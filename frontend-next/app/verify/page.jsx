"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getProofOnChain,
  normalizeHash,
  readProofs,
  sha256Hex,
  shortAddress,
  verifyHashOnChain,
} from "../lib/proofs";

export default function VerifyPage() {
  const fileInputRef = useRef(null);
  const proofInputRef = useRef(null);
  const [savedProofs, setSavedProofs] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [proofHash, setProofHash] = useState("");
  const [proofSource, setProofSource] = useState("Paste a hash or upload proof JSON");
  const [isHashing, setIsHashing] = useState(false);
  const [isCheckingChain, setIsCheckingChain] = useState(false);
  const [chainResult, setChainResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSavedProofs(readProofs());
  }, []);

  const result = useMemo(() => {
    if (!fileHash || !proofHash) return null;
    return fileHash === proofHash ? "match" : "mismatch";
  }, [fileHash, proofHash]);

  async function handleFile(file) {
    if (!file) return;

    setError("");
    setNotice("");
    setChainResult(null);
    setIsHashing(true);
    setFileName(file.name);
    setFileHash("");

    try {
      setFileHash(await sha256Hex(file));
    } catch {
      setError("Could not hash that file. Try another file.");
      setFileName("");
    } finally {
      setIsHashing(false);
    }
  }

  function handleHashInput(value) {
    setProofHash(normalizeHash(value));
    setProofSource(value.trim() ? "Manual fingerprint" : "Paste a hash or upload proof JSON");
    setChainResult(null);
  }

  function selectSavedProof(id) {
    const proof = savedProofs.find((item) => item.id === id);
    if (!proof) return;

    setProofHash(normalizeHash(proof.hash || proof.fingerprint));
    setProofSource(proof.file);
    setChainResult(null);
    setError("");
  }

  function handleProofRecord(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const nextHash = normalizeHash(parsed.fingerprint || parsed.hash || "");
        if (!nextHash) throw new Error("missing fingerprint");
        setProofHash(nextHash);
        setProofSource(file.name);
        setChainResult(null);
        setError("");
        setNotice("Proof JSON loaded");
      } catch {
        setError("That file is not a valid ProofDrop proof JSON record.");
        setNotice("");
      }
    };
    reader.readAsText(file);
  }

  async function checkOnChain() {
    const hash = fileHash || proofHash;
    if (!hash) {
      setError("Choose a file or provide a proof hash before checking Sepolia.");
      return;
    }

    setError("");
    setNotice("");
    setChainResult(null);
    setIsCheckingChain(true);

    try {
      const exists = await verifyHashOnChain(hash);
      const proof = exists ? await getProofOnChain(hash) : null;
      setChainResult({
        exists,
        hash,
        sealedAt: proof?.sealedAt || "",
        sealer: proof?.sealer ? shortAddress(proof.sealer) : "",
      });
    } catch (event) {
      setError(event?.message || "Could not check Sepolia.");
    } finally {
      setIsCheckingChain(false);
    }
  }

  return (
    <main className="appFrame">
      <aside className="appSidebar" aria-label="Verify navigation">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            PD
          </span>
          <span>ProofDrop</span>
        </Link>
        <nav className="sideNav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/create">Create proof</Link>
          <Link className="active" href="/verify">
            Verify file
          </Link>
        </nav>
        <div className="walletSummary">
          <span>Verification mode</span>
          <strong>Local hash compare</strong>
          <small>Connect from the bottom-left control</small>
        </div>
      </aside>

      <section className="dashboardView" aria-labelledby="verify-title">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">Verify a file</p>
            <h1 id="verify-title">Compare a file against a known proof.</h1>
            <p>
              Hash a file locally, then compare it with a ProofDrop proof record
              or a pasted SHA-256 fingerprint.
            </p>
          </div>
          <div className="headerActions">
            <Link className="button buttonSecondary" href="/dashboard">
              Dashboard
            </Link>
            <Link className="button buttonPrimary" href="/create">
              Create proof
            </Link>
          </div>
        </header>

        <section className="verifyGrid" aria-label="File verification workflow">
          <article className="verifyPanel">
            <h2>File under review</h2>
            <button
              className="compactDropTarget"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <span aria-hidden="true">FILE</span>
              <strong>{fileName || "Choose file to verify"}</strong>
              <small>{isHashing ? "Hashing locally" : "The file never leaves this browser"}</small>
            </button>
            <input
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
              ref={fileInputRef}
              type="file"
            />
            <div className="verifyHashBox">
              <span>Generated fingerprint</span>
              <code>{fileHash || "Waiting for file"}</code>
            </div>
          </article>

          <article className="verifyPanel">
            <h2>Known proof</h2>
            <select
              aria-label="Choose saved proof"
              className="controlSelect savedProofSelect"
              disabled={!savedProofs.length}
              onChange={(event) => selectSavedProof(event.target.value)}
              value=""
            >
              <option value="">
                {savedProofs.length ? "Choose saved proof" : "No saved proofs yet"}
              </option>
              {savedProofs.map((proof) => (
                <option key={proof.id} value={proof.id}>
                  {proof.file}
                </option>
              ))}
            </select>
            <textarea
              className="hashTextarea"
              onChange={(event) => handleHashInput(event.target.value)}
              placeholder="Paste a 64-character SHA-256 hash"
              rows="5"
            />
            <div className="proofUploadRow">
              <button
                className="button buttonSecondary"
                onClick={() => proofInputRef.current?.click()}
                type="button"
              >
                Upload proof JSON
              </button>
              <span>{proofSource}</span>
            </div>
            <input
              accept="application/json,.json"
              hidden
              onChange={(event) => handleProofRecord(event.target.files?.[0])}
              ref={proofInputRef}
              type="file"
            />
            <div className="verifyHashBox">
              <span>Expected fingerprint</span>
              <code>{proofHash || "Waiting for proof"}</code>
            </div>
          </article>

          <article className={`resultPanel ${result || ""}`}>
            <span>Verification result</span>
            <strong>
              {!result && "Waiting for both fingerprints"}
              {result === "match" && "MATCH"}
              {result === "mismatch" && "NO MATCH"}
            </strong>
            <p>
              {!result &&
                "Select a file and provide a proof record to compare fingerprints."}
              {result === "match" &&
                "The selected file matches the known ProofDrop fingerprint."}
              {result === "mismatch" &&
                "The selected file does not match the known ProofDrop fingerprint."}
            </p>
            {error && <p className="formError">{error}</p>}
            {notice && <p className="formNotice">{notice}</p>}
            <button
              className="button buttonSecondary chainCheckButton"
              disabled={isCheckingChain || (!fileHash && !proofHash)}
              onClick={checkOnChain}
              type="button"
            >
              {isCheckingChain ? "Checking Sepolia..." : "Check Sepolia"}
            </button>
            {chainResult && (
              <dl className="chainCheckResult">
                <div>
                  <dt>On-chain</dt>
                  <dd>{chainResult.exists ? "Found" : "Not found"}</dd>
                </div>
                <div>
                  <dt>Sealer</dt>
                  <dd>{chainResult.sealer || "-"}</dd>
                </div>
                <div>
                  <dt>Sealed at</dt>
                  <dd>{chainResult.sealedAt || "-"}</dd>
                </div>
              </dl>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
