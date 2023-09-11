const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("SUPER_NFT", () => {
    let SUPER_NFT_FACTORY, SUPER_NFT, owner, from, to;
    let arbitraryURI = "https://ipfs.io/ipfs/arbitraryURI";
    let name="Robot Drop";
    let symbol="RBTD";

    // beforeEach(async () => {
    //     SUPER_NFT_FACTORY = await ethers.getContractFactory("SUPER_NFT");
    //     SUPER_NFT = await SUPER_NFT_FACTORY.deploy("Robot Drop", "RBTD");
    //     [owner, from, to, _] = await ethers.getSigners();
    // });

    describe("Creating a cube with arbitrary URI and checking it's id", () => {

        it("Deploying contract.", async () => {
            SUPER_NFT_FACTORY = await ethers.getContractFactory("SUPER_NFT");
            SUPER_NFT = await SUPER_NFT_FACTORY.deploy("Robot Drop", "RBTD");
            [owner, from, to, _] = await ethers.getSigners();

            expect(await SUPER_NFT.name()).to.equal(name);
            expect(await SUPER_NFT.symbol()).to.equal(symbol);
        });

        it("Creating a cube of ID 1 with arbitrary URI, and retreiving it.", async () => {
            await SUPER_NFT.createCube(arbitraryURI);
            expect(await SUPER_NFT.getURI(1)).to.equal(arbitraryURI);
        });

        it("safeTransferFrom from=owner to=addr1", async () => {
            await SUPER_NFT.safeCubeTransfer(owner.address, to.address, 1);
            expect(await SUPER_NFT.ownerOf(1)).to.equal(to.address);
        });
    });
});