import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { serialize, UnsignedTransaction } from "@ethersproject/transactions";
import { ContractTransaction } from "ethers";

export async function buildPopulatedExampleContractTransaction(exampleContractAddress: string, newValueToSet: number): Promise<ContractTransaction> {
  const exampleContract = await ethers.getContractAt("ExampleContract", exampleContractAddress);

  return exampleContract.setExampleVariable.populateTransaction(newValueToSet);
}

export async function buildUnsignedTransaction(signer: HardhatEthersSigner, populatedTransaction: ContractTransaction): Promise<UnsignedTransaction> {
  const nonce = await signer.getNonce();
  console.log(populatedTransaction.data)
  return {
    data: populatedTransaction.data,
    to: populatedTransaction.to,
    gasPrice: populatedTransaction.gasPrice,
    type: populatedTransaction.type,
    gasLimit: populatedTransaction.gasLimit,
    nonce,
  };
}

export function getSerializedTransaction(tx: UnsignedTransaction) {
  return serialize(tx);
}