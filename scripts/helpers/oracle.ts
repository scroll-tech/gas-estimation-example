import { ethers } from "hardhat";
import { ContractTransaction } from "ethers";

export async function estimateL1DataFee(gasOraclePrecompileAddress: string, unsignedSerializedTransaction: string): Promise<bigint> {
  const l1GasOracle = await ethers.getContractAt("IL1GasPriceOracle", gasOraclePrecompileAddress);

  return l1GasOracle.getL1GasUsed(unsignedSerializedTransaction);
}

export async function estimateL2ExecutionFee(tx: ContractTransaction): Promise<bigint> {
  const gasToUse = await ethers.provider.estimateGas(tx);
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  if (!gasPrice) {
    throw new Error("There was an error estimating L2 execution cost");
  }

  return gasToUse * gasPrice;
}