const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../src/config/logger';

import Croni from '../../../../../src/platforms/management/platform/croni';
let sandbox;

const platform = {
  internalCode: 6,
  name: 'Croni',
  credentials: {
    type: 'push',
    data: { thirdPartyId: 'croni', thirdPartySecret: 'croniSecret' }
  }
};

describe('CRONI management.', function () {
  let stubLoggerFn;
  beforeEach(() => {
    stubLoggerFn = sinon.stub(logger, 'error');
    sandbox = sinon.createSandbox();
    sandbox.stub(Croni.prototype, 'updateLastContact').returns();
  });
  afterEach(() => {
    sandbox.restore();
    stubLoggerFn.restore();
  });

  describe('fn(): init()', function () {
    it('should init correctly', async function () {
      const croni = new Croni(platform);
      await croni.init();
    });
    it('should not init correctly', async function () {
      const croni = new Croni();
      await croni.init();
    });
  });
});
