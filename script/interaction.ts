// scripts/interact.js
import { ethers } from "hardhat";
import { generateMerkleTree } from "./merkle-tree-script";

async function main() {
  const iDrisTokenAddress = "0x39A3bE77b7b7a574800373CE8CaFa7B5082EA82f";
  const iDrisToken = await ethers.getContractAt(
    "IDrisToken",
    iDrisTokenAddress,
  );

  const merkleAirdropContractAddress =
    "0x966c3e6502E3F0090cAa737784fAeB0BC341190c";
  const merkleAirdrop = await ethers.getContractAt(
    "MerkleAirdrop",
    merkleAirdropContractAddress,
  );

  // Approve savings contract to spend token
  const approvalAmount = ethers.parseEther("200");
  const approveTx = await iDrisToken.approve(
    merkleAirdropContractAddress,
    approvalAmount,
  );
  approveTx.wait();

  // Transfer token to contract
  const transferTx = await iDrisToken.transfer(
    merkleAirdropContractAddress,
    approvalAmount,
  );
  transferTx.wait();
  // Interact with the contract

  // 1. Update Merkle Root (only owner can do this)
  const merkleTree = await generateMerkleTree();
  const txUpdateMerkleRoot = await merkleAirdrop.updateMerkleRoot(
    merkleTree.root,
  );
  await txUpdateMerkleRoot.wait();
  console.log("Merkle Root Updated:", merkleTree.root);

  // 2. Claim Airdrop for addr1
  const user1 = merkleTree.at(0)!;
  const user1Proof = merkleTree.getProof(user1);
  const txClaim = await merkleAirdrop.claim(user1[1], user1Proof);
  await txClaim.wait();
  console.log(`Airdrop claimed by ${user1[0]} for ${user1[1]} tokens`);

  // 3. Withdraw remaining tokens (only owner can do this)
  const txWithdraw = await merkleAirdrop.withdrawRemainingTokens();
  await txWithdraw.wait();
  console.log("Remaining tokens withdrawn by owner");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
