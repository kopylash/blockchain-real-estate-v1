'use strict';

const DataTypes = require('sequelize/lib/data-types');
const Status = require('./PropertyEnlistmentStatus');

module.exports = (sequelize) => {
  return sequelize.define('property_enlistments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    landlordName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    streetName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    house: {
      type: DataTypes.STRING,
      allowNull: false
    },
    floor: {
      type: DataTypes.INTEGER
    },
    apartment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractAddress: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM,
      values: [Status.PENDING, Status.APPROVED, Status.REJECTED, Status.CANCELLED],
      defaultValue: Status.PENDING
    }
  }, {
    freezeTableName: true
  });
};
