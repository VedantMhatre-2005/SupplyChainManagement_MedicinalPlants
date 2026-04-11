// scripts/assign-role.js
// Usage: npx hardhat run scripts/assign-role.js --network localhost
// This script assigns a role to an address (admin only)

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Contract address (from deployment)
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get contract ABI from artifact
  const artifact = require("../artifacts/contracts/MedicinalPlantRegistry.sol/MedicinalPlantRegistry.json");
  const abi = artifact.abi;

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, abi, deployer);

  console.log("\n========================================");
  console.log("  Assign Role to Account");
  console.log("========================================");
  console.log(`  Deployer (Admin): ${deployer.address}`);
  console.log(`  Contract:         ${contractAddress}\n`);

  // CHANGE THIS to the account address you want to assign the Farmer role to
  const targetAddress = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"; // farmer's account
  const role = "Farmer";

  console.log(`  Assigning role "${role}" to: ${targetAddress}\n`);

  const tx = await contract.assignRole(targetAddress, role);
  const receipt = await tx.wait();

  console.log(`  ✔ Role assigned successfully!`);
  console.log(`  Transaction: ${receipt.transactionHash}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
