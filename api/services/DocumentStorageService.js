'use strict';

const ipfs = require('../../server/IPFSClient');

module.exports = {
  /**
   * Stores file from a readable stream in a storage.
   * Returns a reference to the file.
   * @param readableStream
   * @return {Promise<String>}
   */
  async save(readableStream) {
    const files = await ipfs.files.add(readableStream);

    return files[0].hash;
  },

  /**
   * Gets file from storage by valid reference
   * @param reference
   * @return {Promise<Buffer>}
   */
  get(reference) {
    return ipfs.files.cat(reference);
  }
};


