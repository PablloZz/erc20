import hre from "hardhat";
import { deployOurToken } from "./deployOurToken";

async function main() {
  await hre.run("compile");
  await deployOurToken();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
