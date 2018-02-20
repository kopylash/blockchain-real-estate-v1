'use strict';

const PropertyEnlistmentContractService = require('./PropertyEnlistmentContractService');

module.exports = {
  async createEnlistment(enlistment) {
    const createdEnlistment = await Models.PropertyEnlistment.create(enlistment);
    createdEnlistment.contractAddress = await PropertyEnlistmentContractService.createEnlistment(enlistment);

    return createdEnlistment.save();
  },

  async sendOffer(enlistmentId, {amount, tenantName, tenantEmail}) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.sendOffer(enlistment.contractAddress, {amount, tenantName, tenantEmail});
  },

  async getOffer(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.getOffer(enlistment.contractAddress, tenantEmail);
  },

  async reviewOffer(enlistmentId, tenantEmail, approved = true) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.reviewOffer(enlistment.contractAddress, tenantEmail, approved);
  },

  async submitAgreementDraft(enlistmentId, agreementDraft) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.submitAgreementDraft(enlistment.contractAddress, agreementDraft);
  },

  async getAgreement(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.getAgreement(enlistment.contractAddress, tenantEmail);
  },

  async reviewAgreement(enlistmentId, tenantEmail, confirmed = true) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.reviewAgreement(enlistment.contractAddress, tenantEmail, confirmed);
  },

  async signAgreement(enlistmentId, tenantEmail, party, signatureHash) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    if (party === 'landlord') {
      return PropertyEnlistmentContractService.landlordSignAgreement(enlistment.contractAddress, tenantEmail, signatureHash);
    } else {
      return PropertyEnlistmentContractService.tenantSignAgreement(enlistment.contractAddress, tenantEmail, signatureHash);
    }
  },

  async receiveFirstMonthRent(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.receiveFirstMonthRent(enlistment.contractAddress, tenantEmail);
  }
};
