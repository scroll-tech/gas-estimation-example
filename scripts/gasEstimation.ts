import { ethers } from "hardhat";

import dotenv from "dotenv";
import {
  getSerializedTransaction,
  buildUnsignedTransaction,
  buildPopulatedExampleContractTransaction
} from "./helpers/transactions";
import { estimateL1DataFee, estimateL2ExecutionFee } from "./helpers/oracle";
import { getRandomInt } from "./helpers/utils";
import { ContractTransaction } from "ethers";

dotenv.config();

const {
  EXAMPLE_CONTRACT_ADDRESS,
  ORACLE_PRECOMPILE_ADDRESS
} = process.env;

async function getEstimatedFees(gasOracleAddress: string, populatedTransaction: ContractTransaction, serializedTransaction: string) {
  const estimatedL1DataFee = await estimateL1DataFee(gasOracleAddress, serializedTransaction);
  const estimatedL2ExecutionFee = await estimateL2ExecutionFee(populatedTransaction);
  const estimatedTotalFee = estimatedL1DataFee + estimatedL2ExecutionFee;

  return {
    estimatedL1DataFee,
    estimatedL2ExecutionFee,
    estimatedTotalFee
  }
}

async function main() {
  if (!EXAMPLE_CONTRACT_ADDRESS || !ORACLE_PRECOMPILE_ADDRESS) {
    throw new Error("Please fill the .env file with all values");
  }

  const { getSigners } = ethers;
  const [ signer ] = await getSigners();
  const signerAddress = await signer.getAddress()

  const newValueToSetOnExampleContract = getRandomInt(100);

  // Building the transaction and getting the estimated fees
  const populatedTransaction = await buildPopulatedExampleContractTransaction(EXAMPLE_CONTRACT_ADDRESS, newValueToSetOnExampleContract);
  const unsignedTransaction = await buildUnsignedTransaction(signer, populatedTransaction);
  const serializedTransaction = getSerializedTransaction(unsignedTransaction);
  const estimatedFees = await getEstimatedFees(ORACLE_PRECOMPILE_ADDRESS, populatedTransaction, serializedTransaction);

  console.log("Estimated L1 data fee (wei):", estimatedFees.estimatedL1DataFee.toString());
  console.log("Estimated L2 execution fee (wei):", estimatedFees.estimatedL2ExecutionFee.toString());
  console.log("Estimated total fee (wei): ", estimatedFees.estimatedTotalFee.toString());
  console.log("\n");

  // Executing the transaction on-chain and verifying actual values
  const signerBalanceBefore = await ethers.provider.getBalance(signerAddress);
  const exampleContract = await ethers.getContractAt("ExampleContract", EXAMPLE_CONTRACT_ADDRESS, signer);
  const tx = await exampleContract.setExampleVariable(newValueToSetOnExampleContract);
  const txReceipt = await tx.wait(5);
  const signerBalanceAfter = await ethers.provider.getBalance(signerAddress);

  if (!txReceipt) {
    throw new Error("Failed fetching the tx receipt, please try running the script again");
  }

  const totalFee = signerBalanceBefore - signerBalanceAfter;
  const l2ExecutionFee = txReceipt.gasUsed * txReceipt.gasPrice;
  const l1DataFee = totalFee - l2ExecutionFee;

  console.log("Actual L1 data fee (wei):", l1DataFee.toString());
  console.log("Actual L2 execution fee (wei):", l2ExecutionFee.toString());
  console.log("Actual total fee (wei): ", totalFee.toString());

  console.log("\n");

  console.log("(actual fee - estimated fee)");
  console.log("Difference L1 data fee (wei):", (l1DataFee - estimatedFees.estimatedL1DataFee).toString());
  console.log("Difference L2 execution fee (wei):", (l2ExecutionFee - estimatedFees.estimatedL2ExecutionFee).toString());
  console.log("Difference total fee (wei): ", (totalFee - estimatedFees.estimatedTotalFee).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});