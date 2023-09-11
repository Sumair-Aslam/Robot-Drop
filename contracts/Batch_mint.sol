// SPDX-License-Identifier: MIT
//This smart contract is used to make the NFT's of the every pics on the cube with their respective amount of tokens
pragma solidity ^0.8.0;

import "openzeppelin-latest/token/ERC1155/ERC1155.sol";

contract Batch_mint is ERC1155{

    uint256 ID;
    constructor(string memory batchURI_) ERC1155(batchURI_){
        ID=1;
    }
    
    //hashes of the cubes
    mapping(address=>mapping(uint256=>string)) hashes;
    
    //Calculates the ID's of the every pic uploaded
    function cal_ID(uint256 _images)internal returns(uint256[] memory){
        require(_images>0,"Total number of images = 0");
        uint256[] memory Id_array = new uint256[](_images);
        for(uint i = 0;i<_images;i++){
            Id_array[i]=ID;
            ID= ID+1;
        }
        
        return Id_array;
    }
    
    function new_token(uint256 _id,uint256 _amount) public {
        _mint(msg.sender,_id,_amount,"0x0000000000000000000000000000000");
    }
    
    //_images : No. of images un a cube
    //_amount : amount of the tokens of every pic
    //hash : cryptographic hash of every individual pic
    function new_batch(uint256 _images,uint256[] memory _amount,string[] memory hash) public returns(uint256[] memory){
        require(_images==hash.length,"Hashes and number of images do not match");
        uint256[] memory Id_array = new uint256[](_images);
        Id_array=cal_ID(_images);
        _mintBatch(msg.sender,Id_array,_amount,"0x0000000000000000000000000000000");
        for(uint i=0;i<_images;i++){
            hashes[msg.sender][Id_array[i]] = hash[i];
        }
        return Id_array;
    }
    

    function balance_of(address _account,uint256 _id) public view returns(uint256){
       return balanceOf(_account,_id);
    }

    function batch_balance(address[] memory _account,uint256[] memory _id) public view returns(uint256[] memory){
        return balanceOfBatch(_account,_id);
    } 
    
    function get_hash(address _account,uint256 _id) public view returns(string memory){
        return hashes[_account][_id];
    }
}

