import { ethers } from "ethers";

// ─── Replace with your deployed contract address ───────────────────────────
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

// ─── Replace with your contract ABI after compiling the Solidity contract ──
const contractABI = [
  // RegisterBatch
  "function registerBatch(string plantName, string scientificName, string partUsed, string traditionalUse, uint256 harvestDate, string sourceLocation, string ipfsHash) returns (uint256)",

  // UpdateProcessing
  "function updateProcessing(uint256 batchId, string processingMethod, uint256 processingDate, string ipfsHash)",

  // TransferOwnership
  "function transferOwnership(uint256 batchId, address newOwner)",

  // GetBatch
  "function getBatch(uint256 batchId) view returns (string plantName, string scientificName, string partUsed, string traditionalUse, address currentOwner, string ipfsHash)",

  // Events
  "event BatchRegistered(uint256 indexed batchId, string plantName, address indexed owner)",
  "event OwnershipTransferred(uint256 indexed batchId, address indexed previousOwner, address indexed newOwner)",
  "event BatchProcessed(uint256 indexed batchId, string processingMethod)"
];

/**
 * Returns an ethers.js Contract instance connected via MetaMask signer.
 * Throws if MetaMask is not installed.
 */
export async function getContract() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to use this dApp."
    );
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

export { contractAddress, contractABI };
