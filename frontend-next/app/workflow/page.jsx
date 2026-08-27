import Link from "next/link";
import { WalletConnectButton } from "../components/WalletConnect";

const workflow = [
  {
    step: "01",
    title: "Select a file",
    body: "The user chooses the file they want to prove. The original file stays on their device.",
  },
  {
    step: "02",
    title: "Generate the hash",
    body: "ProofDrop reads the file locally and creates a SHA-256 fingerprint for that exact version.",
  },
  {
    step: "03",
    title: "Anchor on-chain",
    body: "Only the hash is sent to the smart contract, along with the registering wallet and chain timestamp.",
  },
  {
    step: "04",
    title: "Verify later",
    body: "Hash the file again and compare it with the blockchain record to confirm match or mismatch.",
  },
];

export default function WorkflowPage() {
  return (
    <main>
      <section className="simplePageHero">
        <nav className="nav" aria-label="Primary navigation">
          <Link className="brand" href="/">
            <span className="brandMark" aria-hidden="true">
              PD
            </span>
            <span>ProofDrop</span>
          </Link>
          <div className="navLinks">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/workflow">Workflow</Link>
            <Link href="/proof-boundary">Proof boundary</Link>
          </div>
          <WalletConnectButton />
        </nav>

        <div className="simplePageIntro">
          <p className="eyebrow">How it works</p>
          <h1>From file to verifiable proof in four moves.</h1>
          <p>
            ProofDrop records a cryptographic commitment, not the document
            itself. The proof is useful because even a one-character change
            produces a different hash.
          </p>
        </div>
      </section>

      <section className="section workflowSection" aria-label="ProofDrop workflow">
        <div className="workflowGrid">
          {workflow.map((item) => (
            <article className="workflowCard" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
