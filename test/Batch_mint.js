const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Batch_mint", () => {
    let arbitraryImagesHashes = ["QmTPuDM7xwzrmeCsiGpJypoW9WmiyTS2Lr56W66BiY3dmZ", "QmTPuDM7xwzrmeCsiGpJypoW9WmiyTS2Lr56W66BiY5gMn", "QmTPuDM7xwzrmeCsiGpJypoW9WmiyTS2Lr56W66BiY5mgM"]; // CID as produced by pinning files to an IPFS
    let Batch_mint, owner, from, to;
    let arbitraryBatchURI = "https://some.example/api/item/{id}.json";

    it("Deploying Batch_mint", async () => {
        Batch_mint = await ethers.getContractFactory("Batch_mint").then(async response => await response.deploy(arbitraryBatchURI));
        [owner, from, to, _] = await ethers.getSigners();
        expect(await Batch_mint.uri(0)).to.equal(arbitraryBatchURI);
    });

    it("Mint a fungile token for ID=0, msg.sender=owner, ammount=50", async () => {
        await Batch_mint.new_token(0, 50);
        expect(await Batch_mint.balanceOf(owner.address, 0)).to.equal(BigNumber.from('50'));
    });

    it("Mint 3 NFTs to msg.sender=owner.address with arbitrary hashes and ID=[1, 2,3] and query their Batch balance.", async () => {
        await Batch_mint.new_batch(3, [1, 1, 1], arbitraryImagesHashes);

        expect(await Batch_mint.balanceOf(owner.address, 1)).to.equal(BigNumber.from('1'));
        expect(await Batch_mint.get_hash(owner.address, 1)).to.equal(arbitraryImagesHashes[0]);
    });

    it("Query Batch balance of all 3 tokes for owner.", async ()=>{
        let IDs=[1,2,3];
        let balances=await Batch_mint.batch_balance(new Array(3).fill(owner.address), IDs);
        for (let index = 0; index < IDs.length; index++) {
            expect(balances[index]).to.equal(BigNumber.from(1));
        }
    });

});