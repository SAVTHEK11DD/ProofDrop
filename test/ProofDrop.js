const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofDrop", function () {
  async function deployProofDrop() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ProofDrop = await ethers.getContractFactory("ProofDrop");
    const proofDrop = await ProofDrop.deploy();

    return { proofDrop, owner, otherAccount };
  }

  it("stores a file hash with the sealer and timestamp", async function () {
    const { proofDrop, owner } = await deployProofDrop();
    const fileHash = ethers.id("example-file");

    const tx = await proofDrop.sealFile(fileHash);

    await expect(tx)
      .to.emit(proofDrop, "FileSealed")
      .withArgs(fileHash, owner.address, await timeFromTx(tx));

    const [sealer, sealedAt, exists] = await proofDrop.getProof(fileHash);
    expect(sealer).to.equal(owner.address);
    expect(sealedAt).to.be.greaterThan(0);
    expect(exists).to.equal(true);
  });

  it("returns true when a hash has been sealed", async function () {
    const { proofDrop } = await deployProofDrop();
    const fileHash = ethers.id("example-file");

    await proofDrop.sealFile(fileHash);

    expect(await proofDrop.verifyFile(fileHash)).to.equal(true);
  });

  it("returns false when a hash has not been sealed", async function () {
    const { proofDrop } = await deployProofDrop();
    const fileHash = ethers.id("missing-file");

    expect(await proofDrop.verifyFile(fileHash)).to.equal(false);
  });

  it("rejects duplicate hashes", async function () {
    const { proofDrop, otherAccount } = await deployProofDrop();
    const fileHash = ethers.id("example-file");

    await proofDrop.sealFile(fileHash);

    await expect(
      proofDrop.connect(otherAccount).sealFile(fileHash)
    ).to.be.revertedWith("ProofDrop: hash already sealed");
  });

  it("rejects an empty hash", async function () {
    const { proofDrop } = await deployProofDrop();

    await expect(proofDrop.sealFile(ethers.ZeroHash)).to.be.revertedWith(
      "ProofDrop: empty hash"
    );
  });
});

async function timeFromTx(tx) {
  const receipt = await tx.wait();
  const block = await ethers.provider.getBlock(receipt.blockNumber);
  return block.timestamp;
}
