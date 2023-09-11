/**
 * Deployment script that deployes to Hardhat local network.
 */

const { BigNumber } = require("@ethersproject/bignumber");
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying with: ", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const SUPER_NFT = await ethers.getContractFactory("SUPER_NFT").then(async (response) => await response.deploy("NFT Collection", "NFTC"));
  const BATCH_MINT = await ethers.getContractFactory("Batch_mint").then(async (response) => await response.deploy("NFT Mint"));
  const MYERC = await ethers.getContractFactory("myERC20").then(async (response) => await response.deploy("My ERC20", "MERC", BigNumber.from("10").pow(18)));
  const AUCTION = await ethers.getContractFactory("Auction").then(async (response) => await response.deploy(SUPER_NFT.address, MYERC.address));

  console.log("Deployed NFT at: ", SUPER_NFT.address);
  console.log("Deployed Batch_mint at: ", BATCH_MINT.address);
  console.log("Deployed MERC at: ", MYERC.address);
  console.log("Deployed Auction at: ", AUCTION.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });