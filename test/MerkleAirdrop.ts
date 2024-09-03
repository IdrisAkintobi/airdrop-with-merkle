import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { IDrisToken, MerkleAirdrop } from "../typechain-types";

describe("MerkleAirdrop", function () {
  let merkleAirdrop: MerkleAirdrop;
  let iDrisToken: IDrisToken;
  let owner: Signer, addr1: Signer, addr2: Signer, addr3: Signer;
  let merkleTree: StandardMerkleTree<any>;
  let merkleRoot: string;
  let records: (bigint | string)[][];
  const TWO_HUNDRED_ETHERS = ethers.parseEther("200");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy ERC20 Token
    const iDrisTokenFactory = await ethers.getContractFactory("IDrisToken");
    iDrisToken = await iDrisTokenFactory.deploy();

    // Create Merkle Tree using @openzeppelin/merkle-tree
    const addressOne = await addr1.getAddress();
    const addressTwo = await addr2.getAddress();
    records = [
      [addressOne, ethers.parseEther("40")],
      [addressTwo, ethers.parseEther("60")],
    ];

    merkleTree = StandardMerkleTree.of(records, ["address", "uint256"]);
    merkleRoot = merkleTree.root;

    // Deploy MerkleAirdrop
    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    merkleAirdrop = await MerkleAirdrop.deploy(iDrisToken, merkleRoot);

    // Transfer tokens to the MerkleAirdrop contract
    await iDrisToken.transfer(merkleAirdrop, TWO_HUNDRED_ETHERS);
  });

  it("Should allow users to claim their airdrop with valid proof", async function () {
    const value = records[0][1] as bigint;
    const proof = merkleTree.getProof(0);

    await expect(merkleAirdrop.connect(addr1).claim(value, proof))
      .to.emit(merkleAirdrop, "Claimed")
      .withArgs(addr1, value);

    expect(await iDrisToken.balanceOf(addr1)).to.equal(ethers.parseEther("40"));
    expect(await merkleAirdrop.claimed(addr1)).to.be.true;
  });

  it("Should revert if airdrop already claimed", async function () {
    const value = records[0][1] as bigint;
    const proof = merkleTree.getProof(0);

    await merkleAirdrop.connect(addr1).claim(value, proof);
    await expect(
      merkleAirdrop.connect(addr1).claim(value, proof),
    ).to.be.revertedWithCustomError(merkleAirdrop, "AIRDROP_CLAIMED");
  });

  it("Should revert with invalid proof", async function () {
    const value = records[0][1] as bigint;
    const invalidProof: string[] = [];

    await expect(
      merkleAirdrop.connect(addr1).claim(value, invalidProof),
    ).to.be.revertedWithCustomError(merkleAirdrop, "INVALID_PRO0F");
  });

  it("Should allow owner to update the Merkle root", async function () {
    const addressThree = await addr3.getAddress();
    const newRecords = [[addressThree, ethers.parseEther("50")], ...records];
    const newMerkleTree = StandardMerkleTree.of(newRecords, [
      "address",
      "uint256",
    ]);
    const newMerkleRoot = newMerkleTree.root;

    await expect(merkleAirdrop.updateMerkleRoot(newMerkleRoot))
      .to.emit(merkleAirdrop, "MerkleRootUpdated")
      .withArgs(merkleRoot, newMerkleRoot);
  });

  it("Should revert if non-owner tries to update the Merkle root", async function () {
    const addressThree = await addr3.getAddress();
    const newRecords = [[addressThree, ethers.parseEther("50")], ...records];
    const newMerkleTree = StandardMerkleTree.of(newRecords, [
      "address",
      "uint256",
    ]);
    const newMerkleRoot = newMerkleTree.root;

    await expect(
      merkleAirdrop.connect(addr1).updateMerkleRoot(newMerkleRoot),
    ).to.be.revertedWithCustomError(merkleAirdrop, "UNAUTHORIZED");
  });

  it("Should allow owner to withdraw remaining tokens", async function () {
    const balanceBeforeWithdrawal = await iDrisToken.balanceOf(owner);

    await expect(merkleAirdrop.withdrawRemainingTokens())
      .to.emit(merkleAirdrop, "Withdrawn")
      .withArgs(TWO_HUNDRED_ETHERS);

    const expectedBalanceAfterWithdrawal =
      balanceBeforeWithdrawal + TWO_HUNDRED_ETHERS;

    expect(await iDrisToken.balanceOf(owner)).to.equal(
      expectedBalanceAfterWithdrawal,
    );
  });

  it("Should revert if non-owner tries to withdraw tokens", async function () {
    await expect(
      merkleAirdrop.connect(addr1).withdrawRemainingTokens(),
    ).to.be.revertedWithCustomError(merkleAirdrop, "UNAUTHORIZED");
  });
});
