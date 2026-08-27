export const PROOF_STORAGE_KEY = "proofdrop:proofs";
export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const CONTRACT_ADDRESS = "0xCF5A3d185DF8826788A0208c593ee9925c42Da1a";

const SELECTORS = {
  sealFile: "0x756656f9",
  verifyFile: "0x4b67d54b",
  getProof: "0x1b80bb3a",
};

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${unit ? value.toFixed(1) : value.toFixed(0)} ${units[unit]}`;
}

export function normalizeHash(value) {
  const trimmed = String(value || "").trim().replace(/^0x/i, "");
  return /^[0-9a-fA-F]{64}$/.test(trimmed) ? trimmed.toLowerCase() : "";
}

export function shortHash(hash) {
  const normalized = normalizeHash(hash);
  return normalized ? `${normalized.slice(0, 10)}...${normalized.slice(-8)}` : "";
}

export function shortAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

export function fileType(name) {
  const extension = name.split(".").pop();
  return extension && extension !== name ? extension.slice(0, 3).toUpperCase() : "FILE";
}

export async function sha256Hex(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function readProofs() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(PROOF_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeProofs(proofs) {
  localStorage.setItem(PROOF_STORAGE_KEY, JSON.stringify(proofs));
  window.dispatchEvent(new Event("proofdrop:proofs-updated"));
}

export function saveProof(proof) {
  const existing = readProofs();
  const next = [
    proof,
    ...existing.filter((item) => item.id !== proof.id && item.hash !== proof.hash),
  ];
  writeProofs(next.slice(0, 100));
  return proof;
}

export function updateProof(id, changes) {
  const next = readProofs().map((proof) =>
    proof.id === id ? { ...proof, ...changes } : proof
  );
  writeProofs(next);
  return next.find((proof) => proof.id === id) || null;
}

export function createProofRecord(file, hash) {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  return {
    id: `pd-${Date.now().toString(36)}`,
    file: file.name,
    size: file.size,
    sizeLabel: formatBytes(file.size),
    type: fileType(file.name),
    algorithm: "SHA-256",
    hash,
    fingerprint: hash,
    createdAt: now,
    sealedAt: "",
    network: "Local",
    status: "Local",
    wallet: "Not anchored",
    chain: "local-preview",
  };
}

export function proofToJson(proof) {
  if (!proof?.hash) return "";

  return JSON.stringify(
    {
      id: proof.id,
      file: proof.file,
      size: proof.size,
      algorithm: proof.algorithm,
      fingerprint: proof.hash,
      createdAt: proof.createdAt,
      sealedAt: proof.sealedAt,
      network: proof.network,
      wallet: proof.wallet,
      transactionHash: proof.transactionHash,
      contractAddress: proof.contractAddress,
      chain: proof.chain,
    },
    null,
    2
  );
}

function encodeHashCall(selector, hash) {
  const normalized = normalizeHash(hash);
  if (!normalized) throw new Error("A valid SHA-256 hash is required.");
  return `${selector}${normalized}`;
}

export async function ensureSepolia() {
  if (!window.ethereum) throw new Error("MetaMask is not installed.");

  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId === SEPOLIA_CHAIN_ID) return;

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID }],
  });
}

export async function sealHashOnChain(hash, from) {
  await ensureSepolia();

  const transactionHash = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: CONTRACT_ADDRESS,
        data: encodeHashCall(SELECTORS.sealFile, hash),
      },
    ],
  });

  return transactionHash;
}

export async function verifyHashOnChain(hash) {
  await ensureSepolia();

  const data = await window.ethereum.request({
    method: "eth_call",
    params: [
      {
        to: CONTRACT_ADDRESS,
        data: encodeHashCall(SELECTORS.verifyFile, hash),
      },
      "latest",
    ],
  });

  return Boolean(Number.parseInt(data || "0x0", 16));
}

export async function getProofOnChain(hash) {
  await ensureSepolia();

  const data = await window.ethereum.request({
    method: "eth_call",
    params: [
      {
        to: CONTRACT_ADDRESS,
        data: encodeHashCall(SELECTORS.getProof, hash),
      },
      "latest",
    ],
  });

  const raw = String(data || "").replace(/^0x/, "");
  if (raw.length < 192) return null;

  const sealer = `0x${raw.slice(24, 64)}`;
  const sealedAt = Number.parseInt(raw.slice(64, 128), 16);
  const exists = Boolean(Number.parseInt(raw.slice(128, 192), 16));

  return {
    exists,
    sealer: exists ? sealer : "",
    sealedAt: exists ? new Date(sealedAt * 1000).toISOString().replace(/\.\d+Z$/, "Z") : "",
  };
}
