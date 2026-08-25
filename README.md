# ProofDrop

ProofDrop is a Web3 file authenticity tool. It proves that a file fingerprint was recorded on-chain without uploading or storing the file itself.

In v1, a user selects a file, ProofDrop calculates the file's SHA-256 hash in the browser, and the user can seal that hash on the Sepolia testnet through MetaMask. Later, anyone can hash the same file again and check whether that hash exists in the deployed smart contract.

## What It Does

- Hashes files locally in the browser with SHA-256.
- Never uploads the original file.
- Lets users download a local `.proofdrop.json` proof record.
- Stores only the file hash on an Ethereum-compatible blockchain.
- Lets users verify whether a file matches a local proof record.
- Lets users verify whether a file hash exists on Sepolia.
- Uses MetaMask for wallet connection and transaction signing.

## How The Stack Works

ProofDrop is intentionally simple for v1.

| Layer | Tech | Role |
| --- | --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript | File selection, hashing, local proof download, wallet UI, verification UI |
| Wallet | MetaMask | Connects the user's account and signs transactions |
| Web3 library | ethers.js | Lets the frontend call the smart contract from the browser |
| Smart contract | Solidity | Stores file hashes, sealer addresses, and timestamps |
| Dev tooling | Hardhat | Compiles, tests, and deploys the contract |
| Network | Sepolia | Ethereum testnet used for v1 deployment |

## User Flow

1. Open the Seal page.
2. Connect MetaMask on Sepolia.
3. Select a file.
4. ProofDrop hashes the file locally with SHA-256.
5. Click `Seal on Sepolia`.
6. MetaMask asks the user to confirm the transaction.
7. The smart contract stores the hash, sender address, and block timestamp.
8. Later, open the Verify page and select the same file.
9. ProofDrop hashes the file again and checks whether that hash exists on-chain.

## What Is Stored On-Chain

The contract stores:

- `bytes32 fileHash`
- `address sealer`
- `uint256 sealedAt`

The actual file is not stored on-chain, not uploaded to a server, and not placed on IPFS.

## Project Structure

```text
proofdrop/
  contracts/
    ProofDrop.sol
  frontend/
    index.html
    app.js
    contract-config.js
    pages/
      seal.html
      verify.html
      how-it-works.html
      style1.css
  scripts/
    deploy.js
    update-frontend-config.js
  test/
    ProofDrop.js
  hardhat.config.js
  package.json
  .env.example
```

## Getting Started

Install dependencies:

```bash
npm install
```

Compile the contract:

```bash
npm run compile
```

Run tests:

```bash
npm test
```

## Local Frontend

The frontend is static HTML/CSS/JavaScript. You can open the pages directly or serve the project with a local server.

Main pages:

- `frontend/index.html`
- `frontend/pages/seal.html`
- `frontend/pages/verify.html`
- `frontend/pages/how-it-works.html`

For MetaMask browser testing, using a local server is recommended.

## Sepolia Deployment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your private values:

```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_test_wallet_private_key_without_0x
```

Use a test wallet only. Do not use a wallet that holds real funds.

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

Sync the deployed contract address into the frontend:

```bash
npm run sync:frontend
```

This updates:

```text
frontend/contract-config.js
```

## Frontend Contract Config

`frontend/contract-config.js` contains the public contract address, Sepolia chain ID, and ABI used by the browser.

Example:

```js
window.ProofDropConfig = {
  contractAddress: "0x...",
  sepoliaChainId: "0xaa36a7",
  sepoliaChainName: "Sepolia",
  abi: [...]
};
```

The contract address is public and safe to commit. Private keys and RPC secrets belong only in `.env`.

## Security Notes

- Never commit `.env`.
- Never commit private keys.
- Never use a wallet with real funds for testing.
- ProofDrop does not store the original file.
- ProofDrop v1 does not use IPFS, NFTs, tokens, or a database.
- Anyone with the same file can recompute the hash and check it against the contract.

## Current Status

- Local file hashing works.
- Local proof download works.
- Local proof verification works.
- Sepolia smart contract is implemented and tested.
- MetaMask connection and disconnect flow works.
- On-chain seal and verify flows are wired through ethers.js.

## License

MIT
