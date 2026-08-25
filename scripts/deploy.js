const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ProofDrop = await hre.ethers.getContractFactory("ProofDrop");
  const proofDrop = await ProofDrop.deploy();

  await proofDrop.waitForDeployment();

  const address = await proofDrop.getAddress();
  const deployment = {
    contractName: "ProofDrop",
    address,
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deployment, null, 2)
  );

  console.log("ProofDrop deployed to:", address);
  console.log("Network:", hre.network.name);
  console.log("Saved deployment:", `deployments/${hre.network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
