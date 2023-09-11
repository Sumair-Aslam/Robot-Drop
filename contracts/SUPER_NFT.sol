// SPDX-License-Identifier: MIT
//This smart contract creates a cube of the images
pragma solidity ^0.8.0;

import "openzeppelin-latest/token/ERC721/ERC721.sol";

contract SUPER_NFT is ERC721{
    uint256 Id;

    //stores token uri
    mapping(uint256=>string) token_uri;
    constructor(string memory name_, string memory symbol_) ERC721(name_,symbol_){
        Id=0;
    }
    
    //returns token id of the NFT being creaated
    function tokenID()internal returns(uint256){
        return Id = Id + 1;
    }
    
    //Mint the NFT of the given cube
    //_uri : Json object of the cube
    function createCube(string memory _uri) public returns(uint256){
        uint256 _id = tokenID();
        token_uri[_id] = _uri;
        _mint(msg.sender,_id);
        return _id;
    }
    
    //Returns the token URI of the cubes
    function getURI(uint256 _id) public view returns(string memory){
        return token_uri[_id];
    }
    
    //Transfer the ownership of the cube 
    function safeCubeTransfer(address _from, address _to, uint256 _tokenId) public payable{
        _safeTransfer(_from, _to, _tokenId, "");
    }
}

