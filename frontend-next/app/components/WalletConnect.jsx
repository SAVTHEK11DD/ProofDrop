"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const WalletContext = createContext(null);

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("Wallet not connected");

  useEffect(() => {
    if (!window.ethereum) {
      setMessage("MetaMask not detected");
      return;
    }

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          setMessage("Wallet connected");
        }
      })
      .catch(() => setMessage("Wallet not connected"));

    function handleAccounts(accounts) {
      if (accounts?.[0]) {
        setAddress(accounts[0]);
        setMessage("Wallet connected");
      } else {
        setAddress("");
        setMessage("Wallet disconnected");
      }
    }

    window.ethereum.on?.("accountsChanged", handleAccounts);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccounts);
    };
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage("Install MetaMask to connect");
      return;
    }

    try {
      setMessage("Opening wallet");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts?.[0] || "");
      setMessage(accounts?.[0] ? "Wallet connected" : "Wallet not connected");
    } catch {
      setMessage("Connection cancelled");
    }
  }

  const value = useMemo(
    () => ({
      address,
      connectWallet,
      displayAddress: address ? shortAddress(address) : "",
      message,
    }),
    [address, message]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error("useWallet must be used within WalletProvider");
  return wallet;
}

export function WalletConnectButton({ className = "navAction" }) {
  const { address, connectWallet, displayAddress } = useWallet();

  return (
    <button className={className} onClick={connectWallet} type="button">
      {address ? displayAddress : "Connect wallet"}
    </button>
  );
}

export function WalletNotifier() {
  const pathname = usePathname();
  const { address, connectWallet, displayAddress, message } = useWallet();

  if (pathname === "/") return null;

  return (
    <button className="walletNotifier" onClick={connectWallet} type="button">
      <span aria-hidden="true">{address ? "ON" : "OFF"}</span>
      <strong>{address ? displayAddress : "Connect wallet"}</strong>
      <small>{message}</small>
    </button>
  );
}
