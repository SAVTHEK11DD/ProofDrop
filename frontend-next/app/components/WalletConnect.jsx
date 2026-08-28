"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ensureSepolia } from "../lib/proofs";

const WalletContext = createContext(null);

const WALLET_OPTIONS = [
  { id: "metamask", name: "MetaMask", description: "Most popular browser wallet", icon: "M" },
  { id: "coinbase", name: "Coinbase Wallet", description: "Self custody wallet by Coinbase", icon: "C" },
  { id: "rabby", name: "Rabby Wallet", description: "Smart wallet for DeFi power users", icon: "R" },
];

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function providerMatchesWallet(info, walletId) {
  const combined = `${info?.name || ""} ${info?.rdns || ""}`.toLowerCase();

  if (walletId === "metamask") return combined.includes("metamask");
  if (walletId === "coinbase") return combined.includes("coinbase");
  if (walletId === "rabby") return combined.includes("rabby");
  return false;
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("Wallet not connected");
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [walletChoices, setWalletChoices] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [activeProvider, setActiveProvider] = useState(null);

  useEffect(() => {
    const providers = new Map();
    const announce = (event) => {
      if (!event.detail?.provider || !event.detail.info?.uuid) return;
      providers.set(event.detail.info.uuid, event.detail);
      setWalletChoices(Array.from(providers.values()));
    };

    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    if (window.ethereum) {
      const browserWallet = {
        info: { uuid: "browser-wallet", name: "Browser wallet" },
        provider: window.ethereum,
      };
      setWalletChoices((current) => (current.length ? current : [browserWallet]));
    }

    return () => window.removeEventListener("eip6963:announceProvider", announce);
  }, []);

  function openWalletModal() {
    setWalletModalOpen(true);
  }

  function closeWalletModal() {
    setWalletModalOpen(false);
    setSelectedWallet("");
  }

  async function connectWallet(walletId = "metamask") {
    const option = WALLET_OPTIONS.find((item) => item.id === walletId);
    if (!option) return;
    setSelectedWallet(walletId);

    try {
      setMessage("Opening wallet");
      const provider = walletChoices.find(({ info }) => providerMatchesWallet(info, walletId))?.provider || window.ethereum;

      if (!provider) {
        throw new Error(`${option.name} was not detected in this browser.`);
      }

      setActiveProvider(provider);
      provider.on?.("accountsChanged", (accounts) => {
        setAddress(accounts?.[0] || "");
        setMessage(accounts?.[0] ? "Wallet connected" : "Wallet disconnected");
      });

      const accounts = await provider.request({ method: "eth_requestAccounts" });
      await ensureSepolia(provider);
      setAddress(accounts?.[0] || "");
      setMessage(accounts?.[0] ? "Wallet connected" : "Wallet not connected");
      closeWalletModal();
      return accounts?.[0] || "";
    } catch (error) {
      setMessage(error?.message || "Connection cancelled");
      setSelectedWallet("");
    }
  }

  async function disconnectWallet() {
    try {
      await activeProvider?.disconnect?.();
    } catch {
      // Some injected wallets do not expose disconnect.
    }

    setActiveProvider(null);
    setAddress("");
    setMessage("Wallet disconnected");
    closeWalletModal();
  }

  const value = useMemo(
    () => ({
      address,
      connectWallet,
      disconnectWallet,
      displayAddress: address ? shortAddress(address) : "",
      message,
      isWalletModalOpen,
      openWalletModal,
      closeWalletModal,
      selectedWallet,
      walletChoices,
      provider: activeProvider,
    }),
    [address, message, isWalletModalOpen, selectedWallet, walletChoices, activeProvider]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error("useWallet must be used within WalletProvider");
  return wallet;
}

export function WalletConnectButton({ className = "navAction" }) {
  const { address, displayAddress, openWalletModal } = useWallet();

  return (
    <button className={className} onClick={openWalletModal} type="button">
      {address ? displayAddress : "Connect wallet"}
    </button>
  );
}

export function WalletNotifier() {
  const pathname = usePathname();
  const { address, displayAddress, message, openWalletModal } = useWallet();

  if (pathname === "/") return null;

  return (
    <button className="walletNotifier" onClick={openWalletModal} type="button">
      <span aria-hidden="true">{address ? "ON" : "OFF"}</span>
      <strong>{address ? displayAddress : "Connect wallet"}</strong>
      <small>{message}</small>
    </button>
  );
}

function WalletModal() {
  const { address, closeWalletModal, connectWallet, disconnectWallet, isWalletModalOpen, selectedWallet } = useWallet();

  if (!isWalletModalOpen) return null;

  return (
    <div className="walletModalBackdrop" onMouseDown={closeWalletModal} role="presentation">
      <section
        className="walletModal"
        aria-labelledby="wallet-modal-title"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="walletModalClose" aria-label="Close wallet dialog" onClick={closeWalletModal} type="button">
          x
        </button>
        <div className="walletModalIntro">
          <span className="walletModalMark" aria-hidden="true">
            WD
          </span>
          <div>
            <h2 id="wallet-modal-title">{address ? "Wallet connected" : "Connect your wallet"}</h2>
            <p>{address ? "Manage the wallet used to anchor your proofs." : "Choose a wallet to continue to ProofDrop."}</p>
          </div>
        </div>
        <div className="walletOptions">
          {address ? (
            <button className="walletOption walletDisconnect" onClick={disconnectWallet} type="button">
              <span className="walletOptionIcon">x</span>
              <span>
                <strong>Disconnect wallet</strong>
                <small>End this wallet session</small>
              </span>
              <span className="walletOptionArrow">-&gt;</span>
            </button>
          ) : (
            WALLET_OPTIONS.map((wallet) => (
              <button
                className="walletOption"
                disabled={selectedWallet === wallet.id}
                key={wallet.id}
                onClick={() => connectWallet(wallet.id)}
                type="button"
              >
                <span className="walletOptionIcon">{wallet.icon}</span>
                <span>
                  <strong>{wallet.name}</strong>
                  <small>{wallet.description}</small>
                </span>
                <span className="walletOptionArrow">{selectedWallet === wallet.id ? "..." : "-&gt;"}</span>
              </button>
            ))
          )}
        </div>
        {!address && (
          <p className="walletModalFooter">
            ProofDrop connects to injected browser wallets and never holds your funds.
          </p>
        )}
      </section>
    </div>
  );
}
