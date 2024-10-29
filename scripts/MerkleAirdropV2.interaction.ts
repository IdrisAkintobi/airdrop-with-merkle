import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { IDrisToken, MerkleAirdropV2 } from "../typechain-types";
import {
  generateMerkleProof,
  getMerkleRoot,
} from "./helpers/merkle-tree-v2-generator";

async function main() {
  const baycNFTAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
  const merkleRoot = await getMerkleRoot();
  let iDrisToken: IDrisToken;
  let merkleAirdrop: MerkleAirdropV2;
  const tokenHolder = "0x440bcc7a1cf465eafabae301d1d7739cbfe09dda";
  const amount = "1";
  const merkleProof = await generateMerkleProof(tokenHolder, amount);

  await impersonateAccount(tokenHolder);
  const impersonatedSigner = await ethers.getSigner(tokenHolder);

  const iDrisTokenFactory = await ethers.getContractFactory("IDrisToken");
  iDrisToken = await iDrisTokenFactory.deploy();

  const merkleAirdropFactory = await ethers.getContractFactory(
    "MerkleAirdropV2",
    impersonatedSigner,
  );

  merkleAirdrop = await merkleAirdropFactory.deploy(
    iDrisToken,
    baycNFTAddress,
    merkleRoot,
  );

  // Approve savings contract to spend token
  const approvalAmount = ethers.parseEther("200");
  const approveTx = await iDrisToken.approve(merkleAirdrop, approvalAmount);
  await approveTx.wait();

  // Transfer token to contract
  const transferTx = await iDrisToken.transfer(merkleAirdrop, approvalAmount);
  transferTx.wait();

  const tx = await merkleAirdrop.claim(
    ethers.parseUnits(amount, 18),
    merkleProof,
  );
  const receipt = await tx.wait();

  console.log({ receipt });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
