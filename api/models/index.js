'use strict';

module.exports = (sequelize) => {
  sequelize.sync({force: true});

  return {
    PropertyEnlistment: sequelize.import('PropertyEnlistment')
  };
};
