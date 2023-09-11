const { expect, assert } = require("chai");
const { ethers, hardhatArguments } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Auction", () => {

    let owner, addr1, addr2;
    let SUPER_NFT, MYERC, AUCTION;
    let dropID = 0, cubeID;
    let arbitraryURI = "https://ipfs.io/ipfs/arbitraryURI";
    let auction_start, auction_end;
    let distributedAmmount = 25;
    let auctionDuration = 10;
    let totalSupply = 100;

    it("Deploying Auction, creating NFT.", async () => {
        [owner, addr1, addr2, _] = await ethers.getSigners();

        SUPER_NFT = await ethers.getContractFactory("SUPER_NFT").then(async (response) => await response.deploy("NFT Collection", "NFTC"));
        MYERC = await ethers.getContractFactory("myERC20").then(async (response) => await response.deploy("My ERC20", "MERC", 100));
        AUCTION = await ethers.getContractFactory("Auction").then(async (response) => await response.deploy(SUPER_NFT.address, MYERC.address));

        // create NFT for owner to use for tests later
        await SUPER_NFT.createCube(arbitraryURI);
        expect(await SUPER_NFT.getURI(1)).to.equal(arbitraryURI);
    });

    it("Move test ERC20 tokens to test accounts. ", async () => {
        // move some MYERC tokens to addr1 and addr2 for useage
        await MYERC.transfer(addr1.address, BigNumber.from(distributedAmmount));
        await MYERC.transfer(addr2.address, BigNumber.from(distributedAmmount));

        expect(await MYERC.balanceOf(addr1.address)).to.equal(distributedAmmount);
        expect(await MYERC.balanceOf(addr2.address)).to.equal(distributedAmmount);

        totalSupply -= (distributedAmmount * 2);
    });

    it("Creating a Cube with ID=1 and Auction, by contract owner, lasting 5 seconds, then querying it's details.", async () => {

        auction_start = Math.floor(Date.now() / 1000);
        auction_end = Math.floor(Date.now() / 1000) + auctionDuration;

        // create new auction    
        await AUCTION.newAuction(auction_start, auction_end, 5, [1]);
        // get highest bid(==0)
        expect(await AUCTION.getHighestBid(1)).to.equal(0);

        // get highest bidder(==0x00)
        expect(await AUCTION.getHighestBidder(1)).to.equal('0x0000000000000000000000000000000000000000');
    });

    it("Creating Auction, Making 2 bids(first larger than 2nd)", async () => {
        // Approve allowance from addr1 for AUCTION to spend on bids, the make bid
        await MYERC.connect(addr1).approve(AUCTION.address, 15);
        await AUCTION.connect(addr1).bid(1, 1, 6);

        // check that the only bid is the highest bid.
        expect(await AUCTION.getHighestBidder(1)).to.equal(addr1.address);

        // Approve allowance from addr2 for AUCTION to spend on bids, the make bid
        await MYERC.connect(addr2).approve(AUCTION.address, 20);
        await AUCTION.connect(addr2).bid(1, 1, 10);

        // check that bid 2 is now the highest
        expect(await AUCTION.getHighestBidder(1)).to.equal(addr2.address);


    });

    it("Await auction end, (Bid2, Addr2) will win, clain NFT", async () => {

        await network.provider.send("evm_increaseTime", [auctionDuration]);
        await network.provider.send("evm_mine");

        // Auction owner will allow Auction contract to transfer NFT
        await SUPER_NFT.setApprovalForAll(AUCTION.address, true);

        // Auction winner calls contract to clain NFT
        await AUCTION.connect(addr2).claimNFT(1, 1);

        // check that NFT ownership changed to addr2
        expect(await SUPER_NFT.ownerOf(1)).to.equal(addr2.address);
    });

    it("Transfer funds from Winner to Owner.", async () => {
        // move funds from auction winner to NFT's original owner.
        await AUCTION.connect(owner).claimFunds(1, 1);

        // check owner's updated balance
        expect(await MYERC.balanceOf(owner.address)).to.equal(totalSupply + 10);
    });

    it("Transfer funds from auction to losers.", async () => {
        expect(await MYERC.balanceOf(addr1.address)).to.equal(distributedAmmount - 6);

        await AUCTION.connect(addr1).withdraw(1, 1);

        expect(await MYERC.balanceOf(addr1.address)).to.equal(distributedAmmount);
    });
});