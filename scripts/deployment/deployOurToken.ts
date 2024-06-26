import { ignition } from "hardhat";
import OurTokenModule from "../../ignition/modules/OurToken";

async function deployOurModule(chainId: number) {
  const ourToken = (await ignition.deploy(OurTokenModule)).ourToken;
  const ourTokenAddress = await ourToken.getAddress();
  console.log(`ourToken is deployed at ${ourTokenAddress}`);
}
