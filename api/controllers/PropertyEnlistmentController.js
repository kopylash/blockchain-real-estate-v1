'use strict';

const PropertyEnlistmentContractService = require('../services/PropertyEnlistmentContractService');
const log = require('../../server/logger');

module.exports = {
  async createEnlistment(req, res) {
    const address = await PropertyEnlistmentContractService.createEnlistment(req.body);

    res.json({address});
  },

  async sendOffer(req, res) {
    await PropertyEnlistmentContractService.receiveOffer(req.params.address, req.body);

    log.info('Offer received');
    res.status(200).send();
  },

  async getOffers(req, res) {
    const contractAddress = req.params.address;

    const offersNumber = await PropertyEnlistmentContractService.getOffersNumberForEnlistment(contractAddress);
    log.info(`${offersNumber} offers for enlistment at: ${contractAddress}`);

    res.json({offersNumber});
  }
};
