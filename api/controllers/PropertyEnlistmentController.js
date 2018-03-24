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

  async findEnlistments(req, res) {
    if (!req.query.latitude && req.query.longitude || req.query.latitude && !req.query.longitude) {
      throw new Error('If provided, latitude and longitude are both required');
    }

    let enlistments;

    if (req.query.admin) {
      enlistments = await PropertyEnlistmentService.findAllUnpublished();
    } else if (req.query.latitude && req.query.longitude) {
      enlistments = await PropertyEnlistmentService.findInArea(
        parseFloat(req.query.latitude), parseFloat(req.query.longitude), parseFloat(req.query.distance)) || [];
    } else {
      enlistments = await PropertyEnlistmentService.findAllReviewed();
    }
    res.json(enlistments);
  }
};
