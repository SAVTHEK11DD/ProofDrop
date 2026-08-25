const hre = require("hardhat");

async function main() {
  const ProofDrop = await hre.ethers.getContractFactory("ProofDrop");
  const proofDrop = await ProofDrop.deploy();

  await proofDrop.waitForDeployment();

  console.log("ProofDrop deployed to:", await proofDrop.getAddress());
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
