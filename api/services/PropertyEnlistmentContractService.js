'use strict';

const Web3 = require('web3');
const contract = require('truffle-contract');
const log = require('../../server/logger');

const config = require('../../config/ethereum');
const artifact = require('../../ethereum/build/contracts/PropertyEnlistment.json');

const provider = new Web3.providers.HttpProvider(config.provider);

const PropertyEnlistmentContract = contract(artifact);
PropertyEnlistmentContract.setProvider(provider);
PropertyEnlistmentContract.defaults({
  from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
  gas: 4712388,
  gasPrice: 100000000000
});

module.exports = {
  createEnlistment({landlordName, price}) {
    return PropertyEnlistmentContract.new(landlordName, price).then(contract => {
      log.info(`Enlistment created on address: ${contract.address}`);

      return contract.address;
    });
  },

  receiveOffer(contractAddress, {amount, tenantName, tenantEmail}) {
    // https://github.com/trufflesuite/truffle-contract#usage
    return PropertyEnlistmentContract.at(contractAddress).then(contract => {
      contract.receiveOffer(amount, tenantName, tenantEmail);
    });
  },

  getOffersNumberForEnlistment(enlistmentAddress) {
    return PropertyEnlistmentContract.at(enlistmentAddress).then(contract => contract.getNumberOfOffers.call());
  }
};
