import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const {
  EXAMPLE_CONTRACT_ADDRESS,
  ORACLE_PRECOMPILE_ADDRESS
} = process.env;

async function main() {
  if (!EXAMPLE_CONTRACT_ADDRESS || !ORACLE_PRECOMPILE_ADDRESS) {
    throw new Error("Please fill the .env file with all values");
  }

  const l1GasOracle = await ethers.getContractAt("IL1GasPriceOracle", ORACLE_PRECOMPILE_ADDRESS);
  console.log("Current L1 base fee: ", await l1GasOracle.l1BaseFee());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});