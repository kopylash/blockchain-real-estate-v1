'use strict';

const PropertyEnlistmentContractService = require('./PropertyEnlistmentContractService');
const Status = require('../models/enums/PropertyEnlistmentStatus');
const log = require('../../server/logger');

async function mapAllContractEnlistments(dbEnlistmentInstances) {
  return Promise.all(dbEnlistmentInstances.map(async (instanceObj) => {
    let dbEnlistment = instanceObj.get({ plain: true });

    const contractEnlistment =
      await PropertyEnlistmentContractService.getEnlistment(dbEnlistment.contractAddress);
    return Object.assign({}, dbEnlistment, contractEnlistment);
  }));
}

module.exports = {
  createEnlistment(enlistment) {
    enlistment.geolocation = {
      type: 'Point',
      coordinates: [enlistment.latitude, enlistment.longitude]
    };
    enlistment.offerAuthors = [];

    return Models.PropertyEnlistment.create(enlistment);
  },

  findInArea(latitude, longitude, distance = 5000) {
    return Models.PropertyEnlistment.findInArea(latitude, longitude, distance);
  },

  findAllUnpublished() {
    return Models.PropertyEnlistment.findAll(
      {
        where: { status: [Status.REJECTED, Status.PENDING, Status.CANCELLED] }
      }
    );
  },

  async findAllReviewed() {
    const dbEnlistments = await Models.PropertyEnlistment.findAll(
      {
        where: { status: Status.APPROVED }
      }
    );

    return mapAllContractEnlistments(dbEnlistments);
  },

  async findWithOffersByBidder(bidderEmail) {
    const dbEnlistments = await Models.PropertyEnlistment.findAll(
      {
        where: {
          offerAuthors: {
            $contains: [bidderEmail]
          }
        }
      }
    );
    return mapAllContractEnlistments(dbEnlistments);
  },

  async approveEnlistment(enlistmentId) {
    const enlistment = await Models.PropertyEnlistment.findOne({ where: { id: enlistmentId } });

    enlistment.approve();

    enlistment.contractAddress = await PropertyEnlistmentContractService.createEnlistment(
      enlistment.landlordName,
      enlistment.streetName,
      enlistment.floor,
      enlistment.apartment,
      enlistment.house,
      enlistment.zipCode
    );

    return enlistment.save();
  },

  async rejectEnlistment(enlistmentId) {
    const enlistment = await Models.PropertyEnlistment.findOne({ where: { id: enlistmentId } });

    enlistment.reject();

    return enlistment.save();
  },

  async sendOffer(enlistmentId, { amount, tenantName, tenantEmail }) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });
    await PropertyEnlistmentContractService.sendOffer(enlistment.contractAddress, { amount, tenantName, tenantEmail });
    await enlistment.addOfferAuthor(tenantEmail);
    return enlistment.save();
  },

  async getOffers(enlistmentId) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });
    return Promise.all(enlistment.get({plain: true}).offerAuthors.map(async (offerAuthor) => {
      const contractOffer =
        await PropertyEnlistmentContractService.getOffer(enlistment.contractAddress, offerAuthor);
      return contractOffer;
    }));
  },

  async getOffer(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    const contractOffer = await PropertyEnlistmentContractService.getOffer(enlistment.contractAddress, tenantEmail);
    if (!contractOffer.initialized) {
      throw new Error(404);
    }
    return contractOffer;
  },

  async cancelOffer(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.cancelOffer(enlistment.contractAddress, tenantEmail);
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

  async cancelAgreement(enlistmentId, tenantEmail) {
    const enlistment = await Models.PropertyEnlistment.findOne({
      where: {
        id: enlistmentId
      }
    });

    return PropertyEnlistmentContractService.cancelAgreement(enlistment.contractAddress, tenantEmail);
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
