'use strict';

const IPFS = require('ipfs');
const log = require('./logger');

const node = new IPFS();

node.on('ready', () => {
  log.info('IPFS node spawned and ready');
});

module.exports = node;
