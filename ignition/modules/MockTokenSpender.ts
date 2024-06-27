import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { type IgnitionModuleResult } from "@nomicfoundation/ignition-core";

export default buildModule<
  "MockTokenSpender",
  "MockTokenSpender",
  IgnitionModuleResult<"MockTokenSpender">
>("MockTokenSpender", (m) => {
  const deployer = m.getAccount(0);
  const mockTokenSpender = m.contract("MockTokenSpender", [], {
    from: deployer,
  });

  return { mockTokenSpender };
});
