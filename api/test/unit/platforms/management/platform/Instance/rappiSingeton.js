const expect = require('chai').expect;
import RappiSingletton from '../../../../../../src/platforms/management/platform/instance/rappiSingleton';

const platform = {
  internalCode: 2,
  name: 'Rappi',
  credentials: {
    type: 'pull',
    data: {
      token: 'token',
      baseUrl: 'http://test',
      schedule: '10 * * * * *'
    }
  }
};

const result = {
  _platform: {
    internalCode: 2,
    name: 'Rappi',
    credentials: {
      type: 'pull',
      data: {
        token: 'token',
        baseUrl: 'http://test',
        schedule: '10 * * * * *'
      }
    }
  },
  doesNotApply: 'n/a',
  parser: {},
  aws: {},
  urlLogin: 'login',
  urlGetOrders: 'orders',
  urlConfirmOrders: 'orders/take/',
  urlRejectOrders: 'orders/reject',
  token: 'token',
  baseUrl: 'http://test'
};

describe('Rappi Singletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await RappiSingletton.getInstance(platform);
      expect(JSON.stringify(instance)).to.equal(JSON.stringify(result));
    });
  });
});
