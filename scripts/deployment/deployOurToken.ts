import { ignition, network } from "hardhat";
import OurTokenModule from "../../ignition/modules/OurToken";
import { INITIAL_SUPPLY, developmentChains } from "../../helper-hardhat-config";
import { vars } from "hardhat/config";
import { verify } from "../../utils";

async function deployOurToken() {
  const ourToken = (await ignition.deploy(OurTokenModule)).ourToken;
  const ourTokenAddress = await ourToken.getAddress();
  console.log(`ourToken is deployed at ${ourTokenAddress}`);

  if (!developmentChains.includes(network.name) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(ourTokenAddress, [INITIAL_SUPPLY]);
  }
}

export { deployOurToken };
