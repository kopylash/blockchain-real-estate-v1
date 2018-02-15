'use strict';

const PropertyEnlistmentContractService = require('../services/PropertyEnlistmentContractService');
const log = require('../../server/logger');

module.exports = {
  async createEnlistment(req, res) {
    const id = await PropertyEnlistmentContractService.createEnlistment(req.body);

    res.status(201).json({id});
  },

  async sendOffer(req, res) {
    await PropertyEnlistmentContractService.sendOffer(req.params.id, req.body);

    log.info('Offer received');
    res.status(201).send();
  },

  async getOffer(req, res) {
    const offer = await PropertyEnlistmentContractService.getOffer(req.params.id, req.query.tenantEmail);

    res.json(offer);
  },

  async reviewOffer(req, res) {
    await PropertyEnlistmentContractService.reviewOffer(req.params.id, req.body.tenantEmail, req.body.approved);

    log.info(`Offer reviewed with resolution ${req.body.approved}`);
    res.status(200).send();
  },

  async submitAgreementDraft(req, res) {
    await PropertyEnlistmentContractService.submitAgreementDraft(req.params.id, req.body);

    log.info('Agreement draft submitted');
    res.status(201).send();
  },

  async getAgreement(req, res) {
    const agreement = await PropertyEnlistmentContractService.getAgreement(req.params.id, req.query.tenantEmail);

    res.json(agreement);
  },

  async reviewAgreement(req, res) {
    await PropertyEnlistmentContractService.reviewAgreement(req.params.id, req.body.tenantEmail, req.body.confirmed);

    log.info(`Agreement reviewed with resolution ${req.body.confirmed}`);
    res.status(200).send();
  },

  async signAgreement(req, res) {
    if (req.body.party === 'landlord') {
      await PropertyEnlistmentContractService.landlordSignAgreement(req.params.id, req.body.tenantEmail, req.body.signatureHash);
    } else {
      await PropertyEnlistmentContractService.tenantSignAgreement(req.params.id, req.body.tenantEmail, req.body.signatureHash);
    }

    log.info(`Agreement signed by ${req.body.party}`);
    res.status(200).send();
  },

  async receiveFirstMonthRent(req, res) {
    await PropertyEnlistmentContractService.receiveFirstMonthRent(req.params.id, req.body.tenantEmail);

    log.info(`First month payment received`);
    res.status(200).send();
  }
};
