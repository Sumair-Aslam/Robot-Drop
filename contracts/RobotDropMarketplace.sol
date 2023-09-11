pragma solidity ^0.7.6;

import "marketplace-contracts/contracts/marketplace/Marketplace.sol";

contract RobotDropMarketplace is Marketplace{
	constructor(address _acceptedToken, uint256 _ownerCutPerMillion, address _owner)Marketplace(_acceptedToken, _ownerCutPerMillion, _owner){}
}

