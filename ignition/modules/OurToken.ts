import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { type IgnitionModuleResult } from "@nomicfoundation/ignition-core";
import { INITIAL_SUPPLY } from "../../helper-hardhat-config";

export default buildModule<"OurToken", "OurToken", IgnitionModuleResult<"OurToken">>(
  "OurToken",
  (m) => {
    const initialSupply = m.getParameter("initialSupply", INITIAL_SUPPLY);
    const deployer = m.getAccount(0);
    const ourToken = m.contract("OurToken", [initialSupply], {
      from: deployer,
    });

    return { ourToken };
  },
);
