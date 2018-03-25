'use strict';

const PropertyEnlistmentService = require('../services/PropertyEnlistmentService');
const log = require('../../server/logger');

module.exports = {
  async sendOffer(req, res) {
    await PropertyEnlistmentService.sendOffer(req.params.id, req.body);

    log.info('Offer received');
    res.status(201).send();
  },

  async getOffers(req, res) {
    let offers = await PropertyEnlistmentService.getOffers(req.params.id);
    res.json(offers);
  },

  async getOffer(req, res) {
    let offer;
    try {
      offer = await PropertyEnlistmentService.getOffer(req.params.id, req.params.tenantEmail);
      res.json(offer);
    } catch(error) {
      log.info('Enlistment ' + req.params.id + ' has no offer from ' + req.params.tenantEmail);
      res.status(404).send();
    }
  },

  async cancelOffer(req, res) {
    await PropertyEnlistmentService.cancelOffer(req.params.id, req.body.tenantEmail);

    log.info(`Offer cancelled`);

    res.status(200).send();
  },

  async reviewOffer(req, res) {
    await PropertyEnlistmentService.reviewOffer(req.params.id, req.body.tenantEmail, req.body.approved);

    log.info(`Offer reviewed with resolution ${req.body.approved}`);

    res.status(200).send();
  }
};
