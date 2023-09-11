pragma solidity ^0.8.0;

/*
    ERC20 contract to temporarily populare WETERC20 for Auction.sol
 */

import "openzeppelin-latest/token/ERC20/ERC20.sol";

contract myERC20 is ERC20{
    constructor(string memory name_, string memory symbol_, uint256 ammount_)ERC20(name_, symbol_){
        _mint(msg.sender, ammount_);
    }
}