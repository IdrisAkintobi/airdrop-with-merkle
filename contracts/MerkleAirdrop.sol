// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    address private owner;
    IERC20 private immutable token;
    bytes32 private merkleRoot;
    mapping(address => bool) public claimed;

    event Claimed(address indexed claimant, uint256 amount);
    event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);
    event Withdrawn(uint256 amount);

    error UNAUTHORIZED();
    error AIRDROP_CLAIMED();
    error INVALID_PRO0F();
    error TRANSFER_FAILED();
    error WITHDRAWAL_FAILED();

    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        token = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
        owner = msg.sender;
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        if (claimed[msg.sender]) revert AIRDROP_CLAIMED();
        bytes32 node = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, amount)))
        );
        if (!MerkleProof.verifyCalldata(merkleProof, merkleRoot, node))
            revert INVALID_PRO0F();

        claimed[msg.sender] = true;
        if (!token.transfer(msg.sender, amount)) revert TRANSFER_FAILED();

        emit Claimed(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 newRoot) external {
        onlyOwner();
        bytes32 oldRoot = merkleRoot;
        if (newRoot != oldRoot) {
            merkleRoot = newRoot;
        }
        emit MerkleRootUpdated(oldRoot, newRoot);
    }

    function withdrawRemainingTokens() external {
        onlyOwner();
        uint256 balance = token.balanceOf(address(this));
        if (!token.transfer(owner, balance)) revert WITHDRAWAL_FAILED();
        emit Withdrawn(balance);
    }

    function onlyOwner() private view {
        if (msg.sender != owner) revert UNAUTHORIZED();
    }
}
