require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");
require("solidity-coverage");
require('hardhat-spdx-license-identifier');
require("@atixlabs/hardhat-time-n-mine");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
      // ganache:{
      //   url:'https://localhost:8545',
      //   accounts:["0xfd7cc0c608941aa729c2a94625418ca4ff5199c5250b6c1ad10d46553bc0daf7","0x6ea17a9695f5d97f604b40beaefe4c3604f83099c62eeaa99715f6c4d045941b"],
      // },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.7.6",
      },
    ],
  },
};
