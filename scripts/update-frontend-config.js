const fs = require("fs");
const path = require("path");

const network = process.argv[2] || "sepolia";
const deploymentPath = path.join(__dirname, "..", "deployments", `${network}.json`);
const configPath = path.join(__dirname, "..", "frontend-next", "app", "lib", "proofs.js");

if (!fs.existsSync(deploymentPath)) {
  throw new Error(`Missing deployment file: deployments/${network}.json`);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const config = fs.readFileSync(configPath, "utf8");
const updated = config.replace(
  /CONTRACT_ADDRESS\s*=\s*"[^"]*"/,
  `CONTRACT_ADDRESS = "${deployment.address}"`
);

fs.writeFileSync(configPath, updated);
console.log(`Updated Next frontend contract address for ${network}: ${deployment.address}`);
