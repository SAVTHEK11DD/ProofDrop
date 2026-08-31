import Link from "next/link";
import { WalletConnectButton } from "../components/WalletConnect";

const proofBoundaries = [
  {
    label: "Proves",
    items: [
      "This exact file version matched a recorded SHA-256 hash.",
      "The hash was anchored at a specific blockchain time.",
      "The registering wallet created the on-chain record.",
    ],
  },
  {
    label: "Does not prove",
    items: [
      "The document contents are truthful.",
      "The file was issued by the organization named inside it.",
      "The registering wallet owns the copyright.",
    ],
  },
];

export default function ProofBoundaryPage() {
  return (
    <main>
      <section className="simplePageHero">
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

        <div className="simplePageIntro">
          <p className="eyebrow">Proof boundary</p>
          <h1>ProofDrop proves integrity, existence, and provenance.</h1>
          <p>
            A blockchain record can confirm that a specific hash existed at a
            specific time. It should not be stretched into claims about legal
            truth, authorship, or institutional endorsement.
          </p>
        </div>
      </section>

      <section className="section proofSection" aria-label="Proof limits">
        <div className="boundaryGrid">
          {proofBoundaries.map((group) => (
            <article className="boundaryCard" key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
