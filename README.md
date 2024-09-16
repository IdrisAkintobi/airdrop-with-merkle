# MerkleAirdrop Smart Contract

This is a airdrop smart contract that uses merkle tree to validate user claim:

- Accepts an ERC20 token address and the Merkle root as constructor parameters.
- Allows users to claim their airdrop by providing their address, the amount, and a valid Merkle proof.
- Verifies the proof against the stored Merkle root.
- Ensures that users can only claim their airdrop once.
- Emits an event when a successful claim is made.
- Provides functions for the contract owner to update the Merkle root and withdraw any remaining tokens after the airdrop is complete.

---

IDrisToken Contract Address: 0x39A3bE77b7b7a574800373CE8CaFa7B5082EA82f

MerkleAirdrop Contract Address: 0x966c3e6502E3F0090cAa737784fAeB0BC341190c

---

### Environment Variables

- INFURA_API_KEY
- DO_NOT_LEAK
- ETHERSCAN_API_KEY
- LISK_RPC_URL

---

### Generate Merkle tree root

To generate merkle tree root after the csv file is updated, run the command below. The merkle tree root will be printed to the console.

```shell
npm run gen:merkle-root
```

---

### Build

```shell
npm build
```

### Test

```shell
npm test
```

### Start (local)

1st terminal

```shell
npm run start:local:node
```

2nd terminal

```shell
npm run deploy:local
```

### Deploy

```shell
npm run deploy:MerkleAirdrop
```
