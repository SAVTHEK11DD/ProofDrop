import "./globals.css";
import PageTransition from "./components/PageTransition";
import { WalletProvider } from "./components/WalletConnect";

export const metadata = {
  title: "ProofDrops - Blockchain proof for digital files",
  description:
    "Create tamper-evident, independently verifiable records for digital files without uploading the file itself.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <PageTransition>{children}</PageTransition>
        </WalletProvider>
      </body>
    </html>
  );
}
