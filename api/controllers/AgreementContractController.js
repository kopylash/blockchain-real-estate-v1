'use strict';

const os = require('os');
const fs = require('fs');
const formidable = require('formidable');
const log = require('../../server/logger');
const {removeFile} = require('../../server/utils');

const PropertyEnlistmentService = require('../services/PropertyEnlistmentService');
const DocumentStorageService = require('../services/DocumentStorageService');

module.exports = {
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

  signAgreement(req, res) {
    let fileInfo;
    const body = {};
    const form = new formidable.IncomingForm();

    form.uploadDir = os.tmpdir();
    form.keepExtensions = true;
    form.maxFileSize = 20 * 1024 * 1024;

    form
      .on('fileBegin', (field, file) => {
        fileInfo = {name: file.name, path: file.path};
      })
      .on('file', (field, file) => {
        log.verbose(`File ${file.name} upload finished`);
      })
      .on('field', (field, value) => {
        body[field] = value;
      })
      .on('end', async () => {
        if (form.type !== 'multipart') {
          return res.status(400).send('Form should be multipart');
        }

        if (fileInfo) {
          const fileReference = await DocumentStorageService.save(fs.createReadStream(fileInfo.path));
          log.verbose('File stored in storage: ', fileReference);
          await PropertyEnlistmentService.signAgreement(req.params.id, body.tenantEmail, body.party, body.signatureHash, fileReference);

          log.info(`Agreement signed by ${body.party}`);

          res.status(200).send();
        } else {
          res.status(400).send('Agreement file is not provided');
        }
      })
      .on('error', (error) => {
        log.error('Agreement signing failed.', error);

        removeFile(fileInfo.path, () => {
          res.status(500).send('File uploading failed');
        });
      });

    form.parse(req);
  },

  async cancelAgreement(req, res) {
    await PropertyEnlistmentService.cancelAgreement(req.params.id, req.body.tenantEmail);

    log.info(`Agreement cancelled`);

    res.status(200).send();
  },

  async receiveFirstMonthRent(req, res) {
    await PropertyEnlistmentService.receiveFirstMonthRent(req.params.id, req.body.tenantEmail);

    log.info(`First month payment received`);
    res.status(200).send();
  }
};
