import "./globals.css";
import PageTransition from "./components/PageTransition";
import { WalletNotifier, WalletProvider } from "./components/WalletConnect";

export const metadata = {
  title: "ProofDrop - Blockchain proof for digital files",
  description:
    "Create tamper-evident, independently verifiable records for digital files without uploading the file itself.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <PageTransition>{children}</PageTransition>
          <WalletNotifier />
        </WalletProvider>
      </body>
    </html>
  );
}
