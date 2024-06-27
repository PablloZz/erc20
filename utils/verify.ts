import hre from "hardhat";

async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying a contract...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    console.log(error);
  }
}

export { verify };
