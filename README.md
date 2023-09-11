# Robot Drop

## Deployment

### Local

#### a. Hardhat Local Node

To accomplish this Hardhat provides decent documentation [here](https://hardhat.org/guides/deploying.html).

To interact with the contracts on your Hardhat Localhost, initialize a hardhat console connected to said network.

```bash
    $ npx hardhat console --network localhost
    >
```

This will initiate a Nodejs console with the hardhat development environment.
To interact with a contract, you need to get it's factory and attatch it's instance of the contract you deployed. You will need this contract's address, which can be found scouring the console instance where you spun up your network.
Something similar to this below.

```bash
     Contract deployment: myToken
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0x646242a3270abee5b385772c1aa1b37c9d3db3069fedd1b81cf1a9c9ea124bfd
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH
  Gas used:            2396974 of 2396974
  Block #1:            0xe81e309620e39e61805c8e9c4a67b0da9ae831e713fb27633666653e0c0c3a98
```

Now get the factory and attach to the contract.

```javascript
> const Token = await ethers.getContractFactory("Token")
> const token = await Token.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
>
```

Now we can call the contract's methods by `token.someMethod([ARGS]) `

#### b. Ganache Local Ethereum Blockchain

[Ganache](https://www.trufflesuite.com/ganache) is part of the Truffle development suite. It spins up an Ethereum block chain on your machine with several accounts with 1000 test ETH.

To use ganache local blockchain, install ganache through npm.

```bash
$ npm install -g galache-cli
```

Then run the galache node

```bash
$ ganache-cli
```

Ganache CLI now runs on the same port Hardhat Node runs on.
To deploy your contracts to it do:

```
$ npx hardhat run --network localhost scripts/deploy_hardhat_local.js
```

### Remote>>>>>>> u readme with local hardhat deployment docs

Interacting with your deployed contracts is the same as interacting with a Hardhat Local Node.

### Remote

> > > > > > > updated README

Interacting with your deployed contracts is the same as interacting with a Hardhat Local Node.

> > > > > > > initialized test script RobotDropMarketplace
