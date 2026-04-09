import { ethers } from "ethers";
import contractABI from "./abi/MedicinalPlantRegistry.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI.abi, signer);
};