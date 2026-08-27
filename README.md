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

ProofDrop uses a Next.js frontend and a Solidity smart contract. File hashing stays in the browser, while only the resulting hash is sent to the blockchain.

| Layer | Tech | Role |
| --- | --- | --- |
| Frontend framework | Next.js 15, React 19, JSX | App Router pages and interactive proof workflows |
| Styling | CSS | Responsive application layout and component styling |
| File hashing | Browser Web Crypto API | Creates SHA-256 fingerprints locally without uploading files |
| Wallet and Web3 | MetaMask, EIP-1193 provider, JSON-RPC | Connects accounts, switches networks, submits transactions, and reads contract data |
| Smart contract | Solidity 0.8.28 | Stores file hashes, sealer addresses, and timestamps |
| Contract tooling | Hardhat, Hardhat Toolbox | Compiles, tests, and deploys the contract |
| Runtime and packages | Node.js, npm | Runs the frontend and contract development scripts |
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


## License

MIT
