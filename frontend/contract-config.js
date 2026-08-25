window.ProofDropConfig = {
  contractAddress: "",
  sepoliaChainId: "0xaa36a7",
  sepoliaChainName: "Sepolia",
  abi: [
    {
      type: "function",
      name: "sealFile",
      stateMutability: "nonpayable",
      inputs: [{ name: "fileHash", type: "bytes32" }],
      outputs: [],
    },
    {
      type: "function",
      name: "verifyFile",
      stateMutability: "view",
      inputs: [{ name: "fileHash", type: "bytes32" }],
      outputs: [{ name: "", type: "bool" }],
    },
    {
      type: "function",
      name: "getProof",
      stateMutability: "view",
      inputs: [{ name: "fileHash", type: "bytes32" }],
      outputs: [
        { name: "sealer", type: "address" },
        { name: "sealedAt", type: "uint256" },
        { name: "exists", type: "bool" },
      ],
    },
  ],
};
