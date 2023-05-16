const insurance = artifacts.require("../contracts/Insurance.sol");

module.exports = function (deployer) {
  deployer.deploy(insurance);
};
