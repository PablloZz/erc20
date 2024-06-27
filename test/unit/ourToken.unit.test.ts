import { ethers, ignition } from "hardhat";
import OurTokenModule from "../../ignition/modules/OurToken";
import MockTokenSpenderModule from "../../ignition/modules/MockTokenSpender";
import { type Contract } from "ethers";
import { type MockTokenSpender, type OurToken } from "typechain-types";
import { assert, expect } from "chai";
import { INITIAL_SUPPLY } from "../../helper-hardhat-config";

describe("OurToken Unit Test", function () {
  let ourTokenDeployer: Contract & OurToken;
  let ourTokenUser: Contract & OurToken;
  let deployerAddress: string;
  let userAddress: string;

  this.beforeEach(async function () {
    const user = (await ethers.getSigners())[1];
    deployerAddress = (await ethers.getSigners())[0].address;
    userAddress = user.address;
    ourTokenDeployer = (await ignition.deploy(OurTokenModule)).ourToken as Contract & OurToken;
    ourTokenUser = ourTokenDeployer.connect(user) as Contract & OurToken;
  });

  describe("constructor", function () {
    it("Initialize totalSupply correctly", async function () {
      const decimals = await ourTokenDeployer.decimals();
      const initialSupply = ethers.formatUnits(await ourTokenDeployer.totalSupply(), decimals);
      assert.equal(Number(initialSupply), Number(INITIAL_SUPPLY));
    });
    it("Initialize contract creator balance correctly", async function () {
      const decimals = await ourTokenDeployer.decimals();
      const tokenCreatorBalance = ethers.formatUnits(
        await ourTokenDeployer.balanceOf(deployerAddress),
        decimals,
      );
      assert.equal(Number(tokenCreatorBalance), Number(INITIAL_SUPPLY));
    });
  });

  describe("transferFrom", function () {
    it("Reverts when value is greater that allowance", async function () {
      const valueToTransfer = ethers.parseEther("2");
      const approveValue = ethers.parseEther("1");
      await ourTokenUser.approve(deployerAddress, approveValue);
      await expect(ourTokenDeployer.transferFrom(userAddress, deployerAddress, valueToTransfer)).to
        .be.reverted;
    });
    it("Updates allowance correctly", async function () {
      const approveValue = ethers.parseEther("3");
      const valueToTransfer = ethers.parseEther("1");
      await ourTokenUser.approve(deployerAddress, approveValue);
      await ourTokenDeployer.transfer(userAddress, approveValue);
      await ourTokenDeployer.transferFrom(userAddress, deployerAddress, valueToTransfer);
      const updatedAllowance = await ourTokenDeployer.allowance(userAddress, deployerAddress);
      assert.equal(updatedAllowance, approveValue - valueToTransfer);
    });
  });

  describe("approve", function () {
    it("Sets allowance correctly", async function () {
      const initialSpenderAllowance = await ourTokenDeployer.allowance(
        userAddress,
        deployerAddress,
      );

      const approveValue = ethers.parseEther("1");
      await ourTokenUser.approve(deployerAddress, approveValue);
      const updatedSpendAllowance = await ourTokenUser.allowance(userAddress, deployerAddress);
      assert.equal(String(initialSpenderAllowance), String(0));
      assert.equal(updatedSpendAllowance, approveValue);
    });
    it("Emits approval event", async function () {
      const approveValue = ethers.parseEther("1");
      await expect(ourTokenUser.approve(deployerAddress, approveValue))
        .to.be.emit(ourTokenUser, "Approval")
        .withArgs(userAddress, deployerAddress, approveValue);
    });
  });

  describe("approveAndCall", function () {
    it("Notifies the spender about approval", async function () {
      const mockTokenSpender = (await ignition.deploy(MockTokenSpenderModule))
        .mockTokenSpender as Contract & MockTokenSpender;
        
      const mockTokenSpenderAddress = await mockTokenSpender.getAddress();
      const approveValue = ethers.parseEther("1");
      await ourTokenUser.approveAndCall(mockTokenSpenderAddress, approveValue, "0x");
      const from = await mockTokenSpender.from();
      const value = await mockTokenSpender.value();
      const token = await mockTokenSpender.token();
      const wasCalled = await mockTokenSpender.wasCalled();
      assert.equal(from, userAddress);
      assert.equal(value, approveValue);
      assert.equal(token, await ourTokenUser.getAddress());
      assert.isTrue(wasCalled);
    });
  });

  describe("burn", function () {
    it("Reverts when sender balance is less than value", async function () {
      const valueToBurn = ethers.parseEther("1");
      await expect(ourTokenUser.burn(valueToBurn)).to.be.reverted;
    });
    it("Updates balances correctly", async function () {
      const valueToBurn = ethers.parseEther("1");
      const transferValue = ethers.parseEther("3");
      await ourTokenDeployer.transfer(userAddress, transferValue);
      await ourTokenUser.burn(valueToBurn);
      const updatedUserBalance = await ourTokenUser.balanceOf(userAddress);
      const updatedTotalSupply = await ourTokenUser.totalSupply();

      assert.equal(String(updatedUserBalance), String(transferValue - valueToBurn));
      assert.equal(ethers.parseEther(INITIAL_SUPPLY) - valueToBurn, updatedTotalSupply);
    });
    it("Emits burn event", async function () {
      const valueToBurn = ethers.parseEther("1");
      const transferValue = ethers.parseEther("3");
      await ourTokenDeployer.transfer(userAddress, transferValue);
      await expect(ourTokenUser.burn(valueToBurn))
        .to.emit(ourTokenUser, "Burn")
        .withArgs(userAddress, valueToBurn);
    });
  });

  describe("burnFrom", function () {
    it("Reverts when sender balance is less than value", async function () {
      const valueToBurn = ethers.parseEther("1");
      await expect(ourTokenDeployer.burnFrom(userAddress, valueToBurn)).to.be.reverted;
    });
    it("Reverts when value is greater that allowance", async function () {
      const valueToBurn = ethers.parseEther("2");
      const approveValue = ethers.parseEther("1");
      await ourTokenUser.approve(deployerAddress, approveValue);
      await expect(ourTokenDeployer.burnFrom(userAddress, valueToBurn)).to.be.reverted;
    });
    it("Updates balances correctly", async function () {
      const valueToBurn = ethers.parseEther("1");
      const approveValue = ethers.parseEther("2");
      const transferValue = ethers.parseEther("3");
      await ourTokenDeployer.transfer(userAddress, transferValue);
      await ourTokenUser.approve(deployerAddress, approveValue);
      await ourTokenDeployer.burnFrom(userAddress, valueToBurn);
      const updatedUserBalance = await ourTokenUser.balanceOf(userAddress);
      const updatedSpenderAllowance = await ourTokenUser.allowance(userAddress, deployerAddress);
      const updatedTotalSupply = await ourTokenUser.totalSupply();

      assert.equal(String(updatedUserBalance), String(transferValue - valueToBurn));
      assert.equal(String(updatedSpenderAllowance), String(approveValue - valueToBurn));
      assert.equal(ethers.parseEther(INITIAL_SUPPLY) - valueToBurn, updatedTotalSupply);
    });
    it("Emits burn event", async function () {
      const valueToBurn = ethers.parseEther("1");
      const approveValue = ethers.parseEther("2");
      const transferValue = ethers.parseEther("3");
      await ourTokenDeployer.transfer(userAddress, transferValue);
      await ourTokenUser.approve(deployerAddress, approveValue);
      await expect(ourTokenDeployer.burnFrom(userAddress, valueToBurn))
        .to.emit(ourTokenDeployer, "Burn")
        .withArgs(userAddress, valueToBurn);
    });
  });
});
