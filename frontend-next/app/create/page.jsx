"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useWallet, WalletConnectButton } from "../components/WalletConnect";
import SidebarNav from "../components/SidebarNav";
import {
  CONTRACT_ADDRESS,
  createProofRecord,
  proofToJson,
  saveProof,
  sealHashOnChain,
  sha256Hex,
  shortAddress,
  updateProof,
} from "../lib/proofs";

export default function CreateProofPage() {
  const inputRef = useRef(null);
  const { address, connectWallet, provider } = useWallet();
  const [record, setRecord] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const proofJson = useMemo(() => proofToJson(record), [record]);

  async function handleFile(file) {
    if (!file) return;

    setError("");
    setNotice("");
    setIsHashing(true);
    setRecord(null);

    try {
      const hash = await sha256Hex(file);
      const proof = saveProof(createProofRecord(file, hash));
      setRecord(proof);
      setNotice("Local proof saved to dashboard");
    } catch {
      setError("Could not hash that file. Try another file.");
    } finally {
      setIsHashing(false);
      setIsDragging(false);
    }
  }

  async function anchorProof() {
    if (!record?.hash) return;

    setError("");
    setNotice("");
    setIsSealing(true);

    try {
      let from = address;
      if (!from) {
        from = await connectWallet();
      }
      if (!from) throw new Error("Connect a wallet before anchoring.");

      const transactionHash = await sealHashOnChain(record.hash, from, provider);
      const updated = updateProof(record.id, {
        chain: "sepolia",
        contractAddress: CONTRACT_ADDRESS,
        network: "Sepolia",
        sealedAt: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        status: "Verified",
        transactionHash,
        wallet: shortAddress(from),
      });
      setRecord(updated);
      setNotice("Proof transaction submitted to Sepolia");
    } catch (event) {
      setError(event?.message || "Could not anchor proof on Sepolia.");
    } finally {
      setIsSealing(false);
    }
  }

  async function copyProof() {
    if (!proofJson) return;
    await navigator.clipboard.writeText(proofJson);
    setNotice("Proof JSON copied");
  }

  function downloadProof() {
    if (!proofJson) return;

    const blob = new Blob([proofJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const baseName = record.file.replace(/\.[^/.]+$/, "") || "proofdrop";
    link.href = url;
    link.download = `${baseName}.proofdrop.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("Proof JSON downloaded");
  }

  return (
    <main className="appFrame">
      <aside className="appSidebar" aria-label="Create proof navigation">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            PD
          </span>
          <span>ProofDrop</span>
          <span className="versionBadge">v0.0.1</span>
        </Link>
        <SidebarNav />
      </aside>

      <section className="dashboardView" aria-labelledby="create-title">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">Create a new proof</p>
            <h1 id="create-title">Hash locally. Anchor only the fingerprint.</h1>
            <p>
              Select a file to generate a SHA-256 hash in your browser. The
              original file is never uploaded or stored on-chain.
            </p>
          </div>
          <div className="headerActions">
            <Link className="button buttonSecondary" href="/dashboard">
              Dashboard
            </Link>
            <Link className="button buttonPrimary" href="/verify">
              Verify
            </Link>
            <WalletConnectButton className="button buttonSecondary" />
          </div>
        </header>

        <section className="createGrid" aria-label="Create proof workflow">
          <div className="createPanel">
            <button
              className={`dropTarget ${isDragging ? "dragging" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              type="button"
            >
              <span className="dropIcon" aria-hidden="true">
                SHA
              </span>
              <strong>{record?.file || "Drop a file or browse"}</strong>
              <small>
                {record?.file
                  ? `${record.sizeLabel} selected`
                  : "PDFs, documents, images, archives, or any digital file"}
              </small>
            </button>
            <input
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
              ref={inputRef}
              type="file"
            />
            {error && <p className="formError">{error}</p>}
            {notice && <p className="formNotice">{notice}</p>}
          </div>

          <aside className="proofPreview" aria-label="Generated proof preview">
            <div className="previewHeader">
              <span>{isHashing ? "Hashing locally" : record?.status || "Waiting for file"}</span>
              <strong>{isHashing ? "Working" : record?.hash ? "Ready" : "Empty"}</strong>
            </div>
            <dl className="proofFields">
              <div>
                <dt>File</dt>
                <dd>{record?.file || "-"}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{record?.sizeLabel || "-"}</dd>
              </div>
              <div>
                <dt>Algorithm</dt>
                <dd>SHA-256</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{record?.createdAt || "-"}</dd>
              </div>
              <div>
                <dt>Fingerprint</dt>
                <dd>
                  <code>{record?.hash || "Waiting for file"}</code>
                </dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{record?.network || "-"}</dd>
              </div>
            </dl>
            <div className="previewActions">
              <button
                className="button buttonPrimary"
                disabled={!record?.hash || isSealing}
                onClick={anchorProof}
                type="button"
              >
                {isSealing ? "Anchoring..." : "Anchor on Sepolia"}
              </button>
              <button
                className="button buttonSecondary"
                disabled={!proofJson}
                onClick={copyProof}
                type="button"
              >
                Copy proof
              </button>
              <button
                className="button buttonSecondary"
                disabled={!proofJson}
                onClick={downloadProof}
                type="button"
              >
                Download proof
              </button>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
