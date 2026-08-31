import Link from "next/link";
import { WalletConnectButton } from "./components/WalletConnect";
import ProofFlowPipeline from "./components/ProofFlowPipeline";

const heroStats = [
  ["0 bytes", "of file data stored on-chain"],
  ["SHA-256", "browser-generated fingerprint"],
  ["Public", "independently checkable record"],
];

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav" aria-label="Primary navigation">
          <Link className="brand" href="/">
            <span className="brandMark" aria-hidden="true">
              PD
            </span>
            <span>ProofDrop</span>
            <span className="versionBadge">v0.0.1</span>
          </Link>
          <div className="navLinks">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/workflow">Workflow</Link>
            <Link href="/proof-boundary">Proof boundary</Link>
          </div>
          <WalletConnectButton />
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Blockchain proof layer for digital files</p>
            <h1 id="hero-title">
              Prove a file existed. Verify it has not changed.
            </h1>
            <p className="lede">
              ProofDrop hashes files locally, anchors the fingerprint on-chain,
              and gives teams a clean way to verify the exact version later
              without uploading the original file.
            </p>
            <div className="heroActions" aria-label="Primary actions">
              <Link className="button buttonPrimary" href="/create">
                Create proof
                <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link className="button buttonSecondary" href="/verify">
                Verify a file
              </Link>
            </div>
            <div className="heroStats" aria-label="ProofDrop trust signals">
              {heroStats.map(([value, label]) => (
                <div className="heroStat" key={value}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="productPanel" aria-label="ProofDrop proof preview">
            <div className="panelHeader">
              <span>
                <span className="statusDot" aria-hidden="true" />
                Chain record
              </span>
              <code>Sepolia</code>
            </div>
            <div className="dropPreview">
              <div className="fileIcon" aria-hidden="true">
                PDF
              </div>
              <div>
                <strong>research-paper.pdf</strong>
                <p>Hashed locally with SHA-256</p>
              </div>
            </div>
            <div className="pipelinePreview" aria-label="Preview proof pipeline">
              <span>File</span>
              <i aria-hidden="true" />
              <span>Hash</span>
              <i aria-hidden="true" />
              <span>Chain</span>
            </div>
            <div className="hashBox">
              <span>Fingerprint</span>
              <code>a93f14c8e29b6d4f91b0...e2c58b27</code>
            </div>
            <div className="chainRecord">
              <div>
                <span>Wallet</span>
                <strong>0x7d31...9A42</strong>
              </div>
              <div>
                <span>Network</span>
                <strong>Sepolia</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className="verified">Verified match</strong>
              </div>
            </div>
          </div>
        </div>

        <ProofFlowPipeline />
      </section>

      <footer className="footer">
        <div>
          <strong>ProofDrop</strong>
          <p>A blockchain-based proof layer for digital files.</p>
        </div>
        <Link className="button buttonPrimary" href="/create">
          Start with a file
        </Link>
      </footer>
    </main>
  );
}
