//SPDX-License-Identifier: MIT;

pragma solidity ^0.8.0;

import "openzeppelin-latest/utils/math/SafeMath.sol";
import "openzeppelin-latest/token/ERC20/IERC20.sol";
import "openzeppelin-latest/token/ERC20/utils/SafeERC20.sol";
import "./SUPER_NFT.sol";
import "hardhat/console.sol";

contract Auction {
    using SafeMath for uint256;

    //Struct to store the drop info that is placed on the auction
    struct DropData {
        address auctionOwner;
        uint256 auctionStart;
        uint256 auctionEnd;
        uint256 minBid;
        uint256[] cubeIds;
        bool created;
    }

    //Struct to store the data of the highest bider of a drop
    struct highestBidData {
        uint256 highestBid;
        address highestBidder;
        bool isThere;
    }

    //Mapping of a drop structure
    mapping(uint256 => DropData) Drops;

    //Mapping of highest bid structure
    mapping(uint256 => highestBidData) bids;

    //This mappping stores the total bids of a user
    mapping(uint256 => mapping(address => uint256)) totalBidders;

    //A smart contract where the NFT are created
    SUPER_NFT SuperNft;

    //Wrapped ether that are used in action
    using SafeERC20 for IERC20;

    IERC20 WETHERC20;

    //dropids that are  puted on auction
    uint256 dropId;

    //SuperNFT where the NFTS are created
    // WETH tokens for the bidinf purpose
    constructor(SUPER_NFT _superNft, IERC20 _wethAddress) {
        SuperNft = _superNft;
        WETHERC20 = _wethAddress;
        dropId = 0;
    }

    //emit when a user made a bid
    event BidEvent(uint256 cubeId, address highestBidder, uint256 highestBid);

    //emit when the user withdraw their funds when they have lost the auction
    event WithdrawalEvent(uint256 cubeId, address withDrawer, uint256 amount);

    //emit when owner of the nft claim its funds after selling the NFT
    event OwnerWithdrawel(uint256 cubeId, uint256 amount);

    //emit when the winner of the bid claim the ownership of the NFT
    event NFT_ClAIM(address owner, address winner, uint256 cubeId);

    //emit when new auction is created
    event New_Auction(
        address owner,
        uint256 startTime,
        uint256 endTime,
        uint256 minBid,
        uint256 dropId,
        uint256[] cubeID
    );

    //_startTime : Unix timestamp (when the auction will be started)
    //_endTime : Unix timestamp (when the auction will end)
    //_minBid : minimum amount of bid that the user can place in auction
    //cubeIds : array if cubeIds that you wnat to place on auction
    //Returns dropID
    function newAuction(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minBid,
        uint256[] memory _cubeIds
    ) public returns (uint256) {
        require(_endTime > _startTime, "Invalid time given");
        for (uint256 i = 0; i < _cubeIds.length; i++) {
            require(
                SuperNft.ownerOf(_cubeIds[i]) == msg.sender,
                "Only owner can place NFT on Auction"
            );
        }
        DropData memory drop_data = DropData({
            auctionOwner: msg.sender,
            auctionStart: _startTime,
            auctionEnd: _endTime,
            minBid: _minBid,
            cubeIds: _cubeIds,
            created: true
        });
        dropId = dropId.add(1);
        Drops[dropId] = drop_data;

        emit New_Auction(
            Drops[dropId].auctionOwner,
            Drops[dropId].auctionStart,
            Drops[dropId].auctionEnd,
            Drops[dropId].minBid,
            dropId,
            Drops[dropId].cubeIds
        );
        return dropId;
    }

    //_dropId : that is returned after creating the auction
    //_cubeId : that on which the user wants to bid
    //_amount : weth, that user wants to put on the cube
    function bid(
        uint256 _dropId,
        uint256 _cubeid,
        uint256 _amount
    ) public returns (bool) {
        require(Drops[_dropId].created == true, "Auction is not created yet");

        require(
            block.timestamp >= Drops[_dropId].auctionStart,
            "Auction has not even started yet"
        );

        require(block.timestamp < Drops[_dropId].auctionEnd, "Auction is end");

        require(msg.sender != Drops[_dropId].auctionOwner, "Owner cannot bid");

        require(
            bids[_cubeid].highestBid + _amount >= Drops[_dropId].minBid,
            "Transferring amount is less then the minimum bid"
        );

        require(
            totalBidders[_cubeid][msg.sender] + _amount >
                bids[_cubeid].highestBid,
            "can't bid, Make a higher Bid"
        );

        require(
            WETHERC20.balanceOf(msg.sender) >= _amount,
            "You have Insufficient balance for this bid"
        );

        if (bids[_cubeid].isThere == false) {
            highestBidData memory firstBid = highestBidData({
                highestBidder: msg.sender,
                highestBid: _amount,
                isThere: true
            });
            bids[_cubeid] = firstBid;

            WETHERC20.safeTransferFrom(msg.sender, address(this), _amount);
            totalBidders[_cubeid][msg.sender] = _amount;
            emit BidEvent(
                _cubeid,
                bids[_cubeid].highestBidder,
                bids[_cubeid].highestBid
            );
        } else {
            bids[_cubeid].highestBidder = msg.sender;

            WETHERC20.safeTransferFrom(msg.sender, address(this), _amount);
            totalBidders[_cubeid][msg.sender] =
                totalBidders[_cubeid][msg.sender] +
                _amount;
            bids[_cubeid].highestBid = totalBidders[_cubeid][msg.sender];
            emit BidEvent(
                _cubeid,
                bids[_cubeid].highestBidder,
                bids[_cubeid].highestBid
            );
        }

        return true;
    }

    //Only winner of the auction can call the functioon when the auction is end
    function claimNFT(uint256 _dropId, uint256 _cubeid) public returns (bool) {

        require(Drops[_dropId].created == true, "Auction is not created yet");
        require(
            block.timestamp >= Drops[_dropId].auctionEnd,
            "Aucton is not end"
        );
        require(
            msg.sender == bids[_cubeid].highestBidder,
            "Only Winner can claim the reward"
        );
        SuperNft.safeCubeTransfer(
            Drops[_dropId].auctionOwner,
            bids[_cubeid].highestBidder,
            _cubeid
        );
        totalBidders[_cubeid][bids[_cubeid].highestBidder] = 0;
        bids[_cubeid].highestBidder = address(0x0);
        bids[_cubeid].isThere = false;
        emit NFT_ClAIM(
            Drops[_dropId].auctionOwner,
            bids[_cubeid].highestBidder,
            _cubeid
        );
        return true;
    }

    //Only owner of the NFT can call this function when the auction is end
    function claimFunds(uint256 _dropId, uint256 _cubeid)
        public
        returns (bool)
    {
        require(Drops[_dropId].created == true, "Auction is not created yet");
        require(
            msg.sender == Drops[_dropId].auctionOwner,
            "Only owner can call this function"
        );
        require(
            block.timestamp >= Drops[_dropId].auctionEnd,
            "Aucton is not end"
        );

        WETHERC20.safeTransfer(
            Drops[_dropId].auctionOwner,
            bids[_cubeid].highestBid
        );
        uint256 _amount = bids[_cubeid].highestBid;
        bids[_cubeid].highestBid = 0;
        emit OwnerWithdrawel(_cubeid, _amount);
        return true;
    }

    //the users who lost the bid can call this function to redeem their tokens
    function withdraw(uint256 _dropId, uint256 _cubeid) public returns (bool) {
        require(Drops[_dropId].created == true, "Auction is not created yet");
        require(
            block.timestamp > Drops[_dropId].auctionEnd,
            "can't withdraw, Auction is still open"
        );
        require(
            msg.sender != bids[_cubeid].highestBidder,
            "Bid winner cannot withdraw money"
        );
        uint256 amount = totalBidders[_cubeid][msg.sender];

        //WETHERC20.safeTransferFrom(address(this), msg.sender, amount);
        WETHERC20.safeTransfer(msg.sender, amount);

        totalBidders[_cubeid][msg.sender] = 0;
        emit WithdrawalEvent(_cubeid, msg.sender, amount);

        return true;
    }

    //returns highest bid on the cube uptill now
    function getHighestBid(uint256 _cubeid) public view returns (uint256) {
        return bids[_cubeid].highestBid;
    }

    //returns highest bidder of the cube
    function getHighestBidder(uint256 _cubeid) public view returns (address) {
        return bids[_cubeid].highestBidder;
    }

    //returns the minimum bid of a specific drop that was set at the time of auction creation
    function getMinimumBid(uint256 _dropId) public view returns (uint256) {
        return Drops[_dropId].minBid;
    }

    //returns the total bids by a user uptill now
    function getBidByUser(address _account, uint256 _cubeid)
        public
        view
        returns (uint256)
    {
        return totalBidders[_cubeid][_account];
    }

    //returns current unix timestamp
    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }

    //returns auction start time
    function getAuctionStart(uint256 _dropId) public view returns (uint256) {
        return Drops[_dropId].auctionStart;
    }

    //returns auction end time
    function getAuctionEnd(uint256 _dropId) public view returns (uint256) {
        return Drops[_dropId].auctionEnd;
    }
}
