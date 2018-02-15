'use strict';

const Web3 = require('web3');
const contract = require('truffle-contract');
const log = require('../../server/logger');

const config = require('../../config/ethereum');
const artifact = require('../../ethereum/build/contracts/EnlistmentToContract.json');

const provider = new Web3.providers.HttpProvider(config.provider);

const PropertyEnlistmentContract = contract(artifact);
PropertyEnlistmentContract.setProvider(provider);
PropertyEnlistmentContract.defaults({
  from: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
  gas: 6000000,
  gasPrice: 1000000000

});

// In-memory storage for mapping id => contract address
const store = {};

module.exports = {
  createEnlistment({landlordName, streetName, floor, apartment, house, zipCode}) {
    return PropertyEnlistmentContract.new(landlordName, streetName, floor, apartment, house, zipCode).then(contract => {
      log.info(`Enlistment created on address: ${contract.address}`);

      const enlistmentId = Math.random().toString(36).substring(2);
      store[enlistmentId] = contract.address;

      return enlistmentId;
    });
  },

  sendOffer(enlistmentId, {amount, tenantName, tenantEmail}) {
    const contractAddress = store[enlistmentId];

    // https://github.com/trufflesuite/truffle-contract#usage
    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.sendOffer(amount, tenantName, tenantEmail));
  },

  getOffer(enlistmentId, tenantEmail) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.getOffer.call(tenantEmail))
    // TODO: convert BigNumber
      .then(([initialized, amount, tenantName, tenantEmail, status]) => ({initialized, amount, tenantName, tenantEmail, status}));
  },

  reviewOffer(enlistmentId, tenantEmail, approved = true) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.reviewOffer(approved, tenantEmail));
  },

  submitAgreementDraft(enlistmentId, {
    tenantEmail, landlordName, agreementTenantName, agreementTenantEmail, leaseStart, handoverDate, leasePeriod, otherTerms, hash
  }) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => {
      return contract.submitDraft(
        tenantEmail,
        landlordName,
        agreementTenantName,
        agreementTenantEmail,
        leaseStart,
        handoverDate,
        leasePeriod,
        otherTerms,
        hash
      );
    });
  },

  getAgreement(enlistmentId, tenantEmail) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => {
      return Promise.all([
        contract.getAgreementParticipants.call(tenantEmail),
        contract.getAgreementDetails.call(tenantEmail),
        contract.getAgreementHashes.call(tenantEmail),
        contract.getAgreementStatus.call(tenantEmail)
      ]);
    }).then(([
               [landlordName, tenantName, tenantEmail],
               [amount, leaseStart, handoverDate, leasePeriod, otherTerms], // TODO: convert BigNumber
               [hash, landlordSignatureHash, tenantSignatureHash],
               status
             ]) => {
      return {
        landlordName,
        tenantName,
        tenantEmail,
        amount,
        leaseStart,
        handoverDate,
        leasePeriod,
        otherTerms,
        hash,
        landlordSignatureHash,
        tenantSignatureHash,
        status
      };
    });
  },

  reviewAgreement(enlistmentId, tenantEmail, confirmed = true) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.reviewAgreement(tenantEmail, confirmed));
  },

  landlordSignAgreement(enlistmentId, tenantEmail, signatureHash) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.landlordSignAgreement(tenantEmail, signatureHash));
  },

  tenantSignAgreement(enlistmentId, tenantEmail, signatureHash) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.tenantSignAgreement(tenantEmail, signatureHash));
  },

  receiveFirstMonthRent(enlistmentId, tenantEmail) {
    const contractAddress = store[enlistmentId];

    return PropertyEnlistmentContract.at(contractAddress).then(contract => contract.receiveFirstMonthRent(tenantEmail));
  }
};
