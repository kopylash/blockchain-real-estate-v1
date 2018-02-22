'use strict';

const PropertyEnlistmentService = require('../services/PropertyEnlistmentService');
const log = require('../../server/logger');

module.exports = {
  async createEnlistment(req, res) {
    const enlistment = await PropertyEnlistmentService.createEnlistment(req.body);

    log.info(`Enlistment created`);

    res.status(201).json(enlistment);
  },

  async approveEnlistment(req, res) {
    await PropertyEnlistmentService.approveEnlistment(req.params.id);

    log.info(`Enlistment with id: ${req.params.id} approved`);

    res.status(200).send();
  },

  async rejectEnlistment(req, res) {
    await PropertyEnlistmentService.rejectEnlistment(req.params.id);

    log.info(`Enlistment with id: ${req.params.id} rejected`);

    res.status(200).send();
  },

  async submitAgreementDraft(req, res) {
    await PropertyEnlistmentService.submitAgreementDraft(req.params.id, req.body);

    log.info('Agreement draft submitted');
    res.status(201).send();
  },

  async getAgreement(req, res) {
    const agreement = await PropertyEnlistmentService.getAgreement(req.params.id, req.query.tenantEmail);

    res.json(agreement);
  },

  async reviewAgreement(req, res) {
    await PropertyEnlistmentService.reviewAgreement(req.params.id, req.body.tenantEmail, req.body.confirmed);

    log.info(`Agreement reviewed with resolution ${req.body.confirmed}`);
    res.status(200).send();
  },

  async signAgreement(req, res) {
    await PropertyEnlistmentService.signAgreement(req.params.id, req.body.tenantEmail, req.body.party, req.body.signatureHash);

    log.info(`Agreement signed by ${req.body.party}`);
    res.status(200).send();
  },

  async receiveFirstMonthRent(req, res) {
    await PropertyEnlistmentService.receiveFirstMonthRent(req.params.id, req.body.tenantEmail);

    log.info(`First month payment received`);
    res.status(200).send();
  }
};
