"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readProofs, shortHash } from "../lib/proofs";
import { WalletConnectButton } from "../components/WalletConnect";
import SidebarNav from "../components/SidebarNav";

const statusOptions = ["All", "Verified", "Local"];
const networkOptions = ["All", "Sepolia", "Local"];

export default function DashboardPage() {
  const [proofs, setProofs] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [network, setNetwork] = useState("All");

  useEffect(() => {
    function syncProofs() {
      setProofs(readProofs());
    }

    syncProofs();
    window.addEventListener("storage", syncProofs);
    window.addEventListener("proofdrop:proofs-updated", syncProofs);

    return () => {
      window.removeEventListener("storage", syncProofs);
      window.removeEventListener("proofdrop:proofs-updated", syncProofs);
    };
  }, []);

  const filteredProofs = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return proofs.filter((proof) => {
      const matchesQuery =
        !needle ||
        proof.file.toLowerCase().includes(needle) ||
        proof.hash.toLowerCase().includes(needle) ||
        proof.id.toLowerCase().includes(needle);
      const matchesStatus = status === "All" || proof.status === status;
      const matchesNetwork = network === "All" || proof.network === network;

      return matchesQuery && matchesStatus && matchesNetwork;
    });
  }, [query, status, network]);

  const verifiedCount = proofs.filter((proof) => proof.network === "Sepolia").length;
  const localCount = proofs.length - verifiedCount;

  return (
    <main className="appFrame">
      <aside className="appSidebar" aria-label="Dashboard navigation">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            PD
          </span>
          <span>ProofDrop</span>
          <span className="versionBadge">v0.0.1</span>
        </Link>
        <SidebarNav />
      </aside>

      <section className="dashboardView" aria-labelledby="dashboard-title">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">User proof dashboard</p>
            <h1 id="dashboard-title">Proof records</h1>
            <p>
              Review file fingerprints, chain anchors, and verification status
              for proofs connected to this wallet.
            </p>
          </div>
          <div className="headerActions">
            <WalletConnectButton className="button buttonSecondary" />
          </div>
        </header>

        <section className="metricGrid" aria-label="Proof summary">
          <article className="metricTile">
            <span>Total proofs</span>
            <strong>{proofs.length}</strong>
          </article>
          <article className="metricTile">
            <span>On-chain</span>
            <strong>{verifiedCount}</strong>
          </article>
          <article className="metricTile">
            <span>Local drafts</span>
            <strong>{localCount}</strong>
          </article>
          <article className="metricTile metricWide">
            <span>Latest proof</span>
            <strong>{proofs[0]?.file || "No proofs yet"}</strong>
          </article>
        </section>

        <section className="proofDirectory" aria-labelledby="proof-list-title">
          <div className="directoryHeader">
            <div>
              <h2 id="proof-list-title">Recent proofs</h2>
              <p>{filteredProofs.length} records in current view</p>
            </div>
            <div className="dashboardFilters">
              <input
                aria-label="Search proofs"
                className="controlInput"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search file, hash, or ID"
                type="search"
                value={query}
              />
              <select
                aria-label="Filter by status"
                className="controlSelect"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                aria-label="Filter by network"
                className="controlSelect"
                onChange={(event) => setNetwork(event.target.value)}
                value={network}
              >
                {networkOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="proofTableWrap">
            <table className="proofTable">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Fingerprint</th>
                  <th>Network</th>
                  <th>Sealed at</th>
                  <th>Status</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {filteredProofs.map((proof) => (
                  <tr key={proof.id}>
                    <td>
                      <div className="fileCell">
                        <span>{proof.type}</span>
                        <div>
                          <strong>{proof.file}</strong>
                          <small>{proof.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{shortHash(proof.hash)}</code>
                    </td>
                    <td>{proof.network}</td>
                    <td>{proof.sealedAt || proof.createdAt}</td>
                    <td>
                      <span className={`statusBadge ${proof.status.toLowerCase()}`}>
                        {proof.status}
                      </span>
                    </td>
                    <td>
                      <span className="tableAction">{proof.wallet}</span>
                    </td>
                  </tr>
                ))}
                {!filteredProofs.length && (
                  <tr>
                    <td className="emptyCell" colSpan="6">
                      No proofs match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
