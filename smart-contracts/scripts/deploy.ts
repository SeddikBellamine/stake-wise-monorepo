import { ethers } from "hardhat";

async function main() {
  const StakeWise = await ethers.getContractFactory("StakeWise");
  // Set gas price options
  const options = {
    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"), // Higher priority fee
    maxFeePerGas: ethers.parseUnits("100", "gwei"), // Higher max fee
  };
  const stakeWise = await StakeWise.deploy(options);

  await stakeWise.waitForDeployment(); // Wait for the deployment to be mined

  console.log("StakeWise deployed to:", await stakeWise.getAddress());

  // Add markets (example)
  const ethUsdPriceFeedAddress = "0xF0d50568e3A7e8259E16663972b11910F89BD8e7";
  const btcUsdPriceFeedAddress = "0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f";
  const ethUsdRanges = [3120, 3150, 3180, 3210];
  const btcUsdRanges = [58000, 58300, 58600, 58900];
  const updateInterval = 600;

  await stakeWise.addMarket(
    "ETH/USD",
    ethUsdPriceFeedAddress,
    ethUsdRanges,
    updateInterval,
  );
  await stakeWise.addMarket(
    "BTC/USD",
    btcUsdPriceFeedAddress,
    btcUsdRanges,
    updateInterval,
  );

  console.log("Markets added successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
