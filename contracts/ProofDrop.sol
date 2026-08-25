// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofDrop {
    struct Proof {
        address sealer;
        uint256 sealedAt;
        bool exists;
    }

    mapping(bytes32 => Proof) private proofs;

    event FileSealed(bytes32 indexed fileHash, address indexed sealer, uint256 sealedAt);

    function sealFile(bytes32 fileHash) external {
        require(fileHash != bytes32(0), "ProofDrop: empty hash");
        require(!proofs[fileHash].exists, "ProofDrop: hash already sealed");

        proofs[fileHash] = Proof({
            sealer: msg.sender,
            sealedAt: block.timestamp,
            exists: true
        });

        emit FileSealed(fileHash, msg.sender, block.timestamp);
    }

    function verifyFile(bytes32 fileHash) external view returns (bool) {
        return proofs[fileHash].exists;
    }

    function getProof(bytes32 fileHash)
        external
        view
        returns (address sealer, uint256 sealedAt, bool exists)
    {
        Proof memory proof = proofs[fileHash];
        return (proof.sealer, proof.sealedAt, proof.exists);
    }
}
