import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x39A3bE77b7b7a574800373CE8CaFa7B5082EA82f";
const merkleRoot =
  "0x4f0ef1957c1497610573259cd8026b8eb46aeef92d4bca0d4cd8cb0fd968446d";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
  const merkleAirdrop = m.contract("MerkleAirdrop", [tokenAddress, merkleRoot]);

  return { merkleAirdrop };
});

export default MerkleAirdropModule;
