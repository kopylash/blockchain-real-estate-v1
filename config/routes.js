module.exports = {
  'POST /enlistments': {
    controller: 'PropertyEnlistmentController',
    action: 'createEnlistment'
  },

  'POST /enlistments/:address/offers': {
    controller: 'PropertyEnlistmentController',
    action: 'sendOffer'
  },

  'GET /enlistments/:address/offers': {
    controller: 'PropertyEnlistmentController',
    action: 'getOffers'
  }
};
