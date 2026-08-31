import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function Footer({ showButton = true }) {
  return (
    <footer className="footer">
      <div>
        <strong>ProofDrops</strong>
        <p>A blockchain-based proof layer for digital files.</p>
        <SocialLinks className="socialIcons footerSocials" />
      </div>
      {showButton && (
        <Link className="button buttonPrimary" href="/create">
          Start with a file
        </Link>
      )}
    </footer>
  );
}
