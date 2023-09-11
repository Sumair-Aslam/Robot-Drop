const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("RobotDrop Marketplace", () => {
	let SUPER_NFT, MYERC, MARKETPLACE, owner, addr1, addr2;
	let arbitraryURI = "https://ipfs.io/ipfs/arbitraryURI";
	let name = "Robot Drop";
	let symbol = "RBTD";
	let totalSupply = 1000000000;
	let distributedAmmount = Math.floor(totalSupply / 3);

	// beforeEach(async () => {
	//     SUPER_NFT_FACTORY = await ethers.getContractFactory("SUPER_NFT");
	//     SUPER_NFT = await SUPER_NFT_FACTORY.deploy("Robot Drop", "RBTD");
	//     [owner, from, to, _] = await ethers.getSigners();
	// });

	describe("Creating a cube with arbitrary URI and checking it's id", () => {

		it("Deploying SUPER_NFT, ERC20 and Marketplace contract.", async () => {

			[owner, addr1, addr2, _] = await ethers.getSigners();
			SUPER_NFT = await ethers.getContractFactory("SUPER_NFT").then(async (response) => await response.deploy("NFT Collection", "NFTC"));
			MYERC = await ethers.getContractFactory("myERC20").then(async (response) => await response.deploy("My ERC20", "MERC", totalSupply));
			MARKETPLACE = await ethers.getContractFactory("RobotDropMarketplace").then(async response => await response.deploy(MYERC.address, 100, owner.address));

			await MYERC.transfer(addr1.address, BigNumber.from(distributedAmmount));
			await MYERC.transfer(addr2.address, BigNumber.from(distributedAmmount));

			expect(await MYERC.balanceOf(addr1.address)).to.equal(distributedAmmount);
			expect(await MYERC.balanceOf(addr2.address)).to.equal(distributedAmmount);
		});

		it("Creating a cube of ID 1 with arbitrary URI, and approve marketplace for it.", async () => {
			await SUPER_NFT.createCube(arbitraryURI);
			expect(await SUPER_NFT.getURI(1)).to.equal(arbitraryURI);

			await SUPER_NFT.approve(MARKETPLACE.address, 1);
			expect(await SUPER_NFT.getApproved(1)).to.equal(MARKETPLACE.address);
		});

		it("Create order for assetId 1 lasting 3 minuets by asset owner, the execute order by addr2.", async () => {

			// create order
			await MARKETPLACE.createOrder(SUPER_NFT.address, 1, 10000, (Math.floor(Date.now() / 1000) + 3600));

			// approve marketplace to transferFrom on behalf of addr2
			await MYERC.connect(addr2).approve(MARKETPLACE.address, 5000000);

			// addr2 buys the Order
			await MARKETPLACE.connect(addr2).executeOrder(SUPER_NFT.address, 1, 10000);

			// cube ID1 is now owned by addr2
			expect(await SUPER_NFT.ownerOf(1)).to.equal(addr2.address);
		});

		it("Create NFT of ID 2, Create Order of ID 2, cancel order, and execute order.", async () => {
			await SUPER_NFT.createCube(arbitraryURI);
			expect(await SUPER_NFT.getURI(2)).to.equal(arbitraryURI);

			await SUPER_NFT.approve(MARKETPLACE.address, 2);
			expect(await SUPER_NFT.getApproved(2)).to.equal(MARKETPLACE.address);

			await MARKETPLACE.createOrder(SUPER_NFT.address, 2, 100, (Math.floor(Date.now() / 1000) + 3600));

			await MARKETPLACE.cancelOrder(SUPER_NFT.address, 2);

			await expect(MARKETPLACE.connect(addr2).executeOrder(SUPER_NFT.address, 2, 100))
			.to
			.be
			.revertedWith("Asset not published");
		});
	});
});