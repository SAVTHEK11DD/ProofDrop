"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ensureSepolia } from "../lib/proofs";

const WalletContext = createContext(null);

const MetaMaskIcon = () => (
  <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
    <path d="M32.96 1L19.7 10.89l2.46-5.83L32.96 1Z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.04 1l13.12 9.98-2.32-5.92L3.04 1ZM28.12 25.87l-3.52 5.39 7.54 2.08 2.16-7.34-6.18-.13ZM1.72 25.87l2.14 7.47 7.52-2.08-3.5-5.4-6.16.01Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.02 15.69l-2.1 3.17 7.48.34-.26-8.04-5.12 4.53ZM24.98 15.69l-5.2-4.62-.18 8.13 7.48-.34-2.1-3.17ZM11.38 31.26l4.52-2.18-3.9-3.04-.62 5.22ZM20.1 29.08l4.52 2.18-.62-5.22-3.9 3.04Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.62 31.26l-4.52-2.18.36 2.94-.04 1.24 4.2-2ZM11.38 31.26l4.2 2 .04-1.24.36-2.94-4.6 2.18Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m15.66 23.54-3.76-1.1 2.66-1.22 1.1 2.32ZM20.34 23.54l1.1-2.32 2.68 1.22-3.78 1.1Z" fill="#233447" stroke="#233447" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.38 31.26l.66-5.4-4.16.14 3.5 5.26ZM23.96 25.87l.66 5.4 3.5-5.27-4.16-.13ZM27.08 18.86l-7.48.34.7 3.84 1.1-2.32 2.68 1.22 3-3.08ZM11.9 22.44l2.66-1.22 1.1 2.32.7-3.84-7.44-.34 2.98 3.08Z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.92 18.86l3.1 6.04-.1-3-3-3.04ZM24.08 21.9l-.12 3 3.12-6.04-3 3.04ZM16.36 19.2l-.7 3.84.88 4.54.2-5.98-.38-2.4ZM19.6 19.2l-.36 2.38.18 6 .88-4.54-.7-3.84Z" fill="#E27525" stroke="#E27525" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.34 23.54l-.88 4.54.62.44 3.9-3.04.12-3-3.76 1.06ZM11.9 22.44l.1 3.06 3.9 3.04.62-.44-.88-4.54-3.74-1.12Z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.42 33.26l.04-1.24-.34-.3h-4.24l-.32.3.04 1.24-4.22-2 1.48 1.2 2.98 2.08h4.34l3-2.08 1.46-1.2-4.22 2Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.1 29.08l-.62-.44h-2.96l-.62.44-.36 2.94.32-.3h4.24l.34.3-.34-2.94Z" fill="#161616" stroke="#161616" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33.52 11.5l1.12-5.42L32.96 1l-12.86 9.54 4.94 4.18 6.98 2.04 1.54-1.8-.66-.48 1.06-.98-.82-.62 1.06-.82-.7-.52ZM1.36 6.08L2.5 11.5l-.72.52 1.08.82-.82.62 1.06.98-.66.48 1.54 1.8 6.98-2.04 4.94-4.18L3.04 1 1.36 6.08Z" fill="#763E1A" stroke="#763E1A" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32.02 15.76l-6.98-2.04 2.1 3.17-3.1 6.04 4.08-.06h6.18l-2.28-7.1ZM11.02 13.72l-7 2.04-2.3 7.1h6.18l4.06.06-3.08-6.04 2.14-3.16ZM19.6 19.2l.44-7.72 2.04-5.42H13.88l2.04 5.42.48 7.72.18 2.42v5.96h2.96l.02-5.96.04-2.42Z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CoinbaseIcon = () => (
  <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
    <rect width="36" height="36" rx="8" fill="#0052FF"/>
    <path d="M18 6a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm-3.2 14.4a1.6 1.6 0 0 1-1.6-1.6v-1.6a1.6 1.6 0 0 1 1.6-1.6h6.4a1.6 1.6 0 0 1 1.6 1.6v1.6a1.6 1.6 0 0 1-1.6 1.6h-6.4Z" fill="#fff"/>
  </svg>
);

const RabbyIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28">
    <defs>
      <linearGradient id="rabbyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8697FF"/>
        <stop offset="100%" stopColor="#7B5FFF"/>
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="8" fill="url(#rabbyGrad)"/>
    <g transform="translate(3.5,4) scale(0.0566)">
      <path d="M400.96 222.806C412.465 197.018 355.59 124.972 301.254 94.9561C267.005 71.7031 231.317 74.8977 224.089 85.1075C208.227 107.514 276.614 126.5 322.35 148.655C312.518 152.94 303.253 160.628 297.805 170.461C280.755 151.783 243.331 135.699 199.418 148.655C169.826 157.386 145.233 177.969 135.728 209.057C133.418 208.028 130.861 207.455 128.171 207.455C117.883 207.455 109.543 215.823 109.543 226.146C109.543 236.468 117.883 244.836 128.171 244.836C130.077 244.836 136.04 243.553 136.04 243.553L231.317 244.246C193.214 304.897 163.101 313.763 163.101 324.271C163.101 334.778 191.914 331.931 202.732 328.014C254.521 309.265 310.145 250.83 319.69 234.009C359.773 239.027 393.459 239.62 400.96 222.806Z" fill="#fff"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M322.345 148.658C322.348 148.659 322.35 148.66 322.353 148.661C324.473 147.824 324.13 144.682 323.548 142.215C322.21 136.545 299.125 113.672 277.448 103.428C247.909 89.4683 226.157 90.188 222.944 96.622C228.961 108.996 256.855 120.613 285.989 132.746C298.418 137.923 311.073 143.193 322.35 148.656Z" fill="rgba(255,255,255,0.7)"/>
      <path d="M134.586 239.593C138.08 269.392 154.959 281.07 189.448 284.526C223.938 287.982 243.721 285.664 270.06 288.068C292.058 290.076 311.7 301.324 318.986 297.437C325.544 293.939 321.875 281.301 313.101 273.192C301.726 262.682 285.984 255.374 258.284 252.781C263.805 237.616 262.258 216.352 253.684 204.783C241.288 188.056 218.407 180.493 189.448 183.797C159.193 187.25 130.202 202.195 134.586 239.593Z" fill="rgba(255,255,255,0.85)"/>
    </g>
  </svg>
);

const DisconnectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const WalletMarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/>
    <circle cx="18" cy="16" r="1"/>
  </svg>
);

const WALLET_OPTIONS = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Most popular browser wallet",
    icon: <MetaMaskIcon />,
    installUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Self custody wallet by Coinbase",
    icon: <CoinbaseIcon />,
    installUrl: "https://www.coinbase.com/wallet",
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    description: "Smart wallet for DeFi power users",
    icon: <RabbyIcon />,
    installUrl: "https://rabby.io/",
  },
];

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getSpecificWalletProvider(walletId, walletChoices = []) {
  if (typeof window === "undefined") return null;

  // 1. EIP-6963 announced providers (most accurate standard)
  const eipMatch = walletChoices.find(({ info }) => {
    const rdns = (info?.rdns || "").toLowerCase();
    const name = (info?.name || "").toLowerCase();
    if (walletId === "metamask") return rdns.includes("metamask") || name.includes("metamask");
    if (walletId === "coinbase") return rdns.includes("coinbase") || name.includes("coinbase");
    if (walletId === "rabby") return rdns.includes("rabby") || name.includes("rabby");
    return false;
  });

  if (eipMatch?.provider) {
    return eipMatch.provider;
  }

  // 2. Specific dedicated browser window globals
  if (walletId === "rabby" && window.rabby) {
    return window.rabby;
  }

  if (walletId === "coinbase" && window.coinbaseWalletExtension) {
    return window.coinbaseWalletExtension;
  }

  // 3. Multi-injected window.ethereum.providers array
  const multiProviders = window.ethereum?.providers;
  if (Array.isArray(multiProviders) && multiProviders.length > 0) {
    if (walletId === "metamask") {
      const p = multiProviders.find(
        (prov) => prov.isMetaMask && !prov.isRabby && !prov.isCoinbaseWallet && !prov.isBraveWallet
      );
      if (p) return p;
    }
    if (walletId === "coinbase") {
      const p = multiProviders.find((prov) => prov.isCoinbaseWallet);
      if (p) return p;
    }
    if (walletId === "rabby") {
      const p = multiProviders.find((prov) => prov.isRabby);
      if (p) return p;
    }
  }

  // 4. Single injected window.ethereum
  if (window.ethereum) {
    if (walletId === "rabby" && window.ethereum.isRabby) {
      return window.ethereum;
    }
    if (walletId === "coinbase" && window.ethereum.isCoinbaseWallet) {
      return window.ethereum;
    }
    if (
      walletId === "metamask" &&
      window.ethereum.isMetaMask &&
      !window.ethereum.isRabby &&
      !window.ethereum.isCoinbaseWallet
    ) {
      return window.ethereum;
    }
  }

  return null;
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("Wallet not connected");
  const [modalError, setModalError] = useState("");
  const [errorWalletId, setErrorWalletId] = useState("");
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
    setModalError("");
    setErrorWalletId("");
    setWalletModalOpen(true);
  }

  function closeWalletModal() {
    setWalletModalOpen(false);
    setSelectedWallet("");
    setModalError("");
    setErrorWalletId("");
  }

  async function connectWallet(walletId = "metamask") {
    const option = WALLET_OPTIONS.find((item) => item.id === walletId);
    if (!option) return;
    setSelectedWallet(walletId);
    setModalError("");
    setErrorWalletId("");

    try {
      setMessage("Opening wallet");
      const provider = getSpecificWalletProvider(walletId, walletChoices);

      if (!provider) {
        setModalError(`${option.name} was not detected in this browser.`);
        setErrorWalletId(walletId);
        setSelectedWallet("");
        return;
      }

      setActiveProvider(provider);
      provider.on?.("accountsChanged", (accounts) => {
        setAddress(accounts?.[0] || "");
        setMessage(accounts?.[0] ? "Wallet connected" : "Wallet disconnected");
      });

      // Explicitly request permissions so the wallet prompts the user every time
      try {
        await provider.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permError) {
        // Code 4001 indicates user rejected the connection request
        if (permError?.code === 4001 || permError?.message?.toLowerCase().includes("user rejected")) {
          throw permError;
        }
        // If wallet_requestPermissions is not supported by the wallet, continue to eth_requestAccounts
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" });
      await ensureSepolia(provider);
      setAddress(accounts?.[0] || "");
      setMessage(accounts?.[0] ? "Wallet connected" : "Wallet not connected");
      closeWalletModal();
      return accounts?.[0] || "";
    } catch (error) {
      setModalError(error?.message || "Connection cancelled");
      setErrorWalletId(walletId);
      setMessage(error?.message || "Connection cancelled");
      setSelectedWallet("");
    }
  }

  async function disconnectWallet() {
    // Revoke wallet permissions on the extension side so it forgets this connection
    try {
      await activeProvider?.request?.({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // Wallet may not support wallet_revokePermissions
    }

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
      modalError,
      errorWalletId,
      isWalletModalOpen,
      openWalletModal,
      closeWalletModal,
      selectedWallet,
      walletChoices,
      provider: activeProvider,
    }),
    [address, message, modalError, errorWalletId, isWalletModalOpen, selectedWallet, walletChoices, activeProvider]
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
  const {
    address,
    closeWalletModal,
    connectWallet,
    disconnectWallet,
    isWalletModalOpen,
    selectedWallet,
    modalError,
    errorWalletId,
  } = useWallet();

  if (!isWalletModalOpen) return null;

  const errorOption = WALLET_OPTIONS.find((item) => item.id === errorWalletId);

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
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>
        </button>
        <div className="walletModalIntro">
          <span className="walletModalMark" aria-hidden="true">
            <WalletMarkIcon />
          </span>
          <div>
            <h2 id="wallet-modal-title">{address ? "Wallet connected" : "Connect your wallet"}</h2>
            <p>{address ? "Manage the wallet used to anchor your proofs." : "Choose a wallet to continue to ProofDrop."}</p>
          </div>
        </div>
        <div className="walletOptions">
          {address ? (
            <button className="walletOption walletDisconnect" onClick={disconnectWallet} type="button">
              <span className="walletOptionIcon"><DisconnectIcon /></span>
              <span>
                <strong>Disconnect wallet</strong>
                <small>End this wallet session</small>
              </span>
              <span className="walletOptionArrow"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l6 6-6 6"/></svg></span>
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
                <span className="walletOptionIcon" aria-hidden="true">{wallet.icon}</span>
                <span>
                  <strong>{wallet.name}</strong>
                  <small>{wallet.description}</small>
                </span>
                <span className="walletOptionArrow">
                  {selectedWallet === wallet.id ? (
                    <svg className="spinnerIcon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10" cy="10" r="7" strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l6 6-6 6"/></svg>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
        {modalError && (
          <div className="walletModalError">
            <span>{modalError}</span>
            {errorOption?.installUrl && (
              <a
                className="walletInstallLink"
                href={errorOption.installUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Install {errorOption.name} &rarr;
              </a>
            )}
          </div>
        )}
        {!address && (
          <p className="walletModalFooter">
            ProofDrop connects to injected browser wallets and never holds your funds.
          </p>
        )}
      </section>
    </div>
  );
}
