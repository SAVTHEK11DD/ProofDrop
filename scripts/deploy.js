const hre = require("hardhat");

async function main() {
  console.log("Hardhat is ready. Add the ProofDrop contract before deploying.");
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
