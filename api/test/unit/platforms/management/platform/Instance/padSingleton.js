const expect = require('chai').expect;
import PadSingletton from '../../../../../../src/platforms/management/platform/instance/padSingleton';

const platform = {
  internalCode: 5,
  name: 'PaD',
  credentials: {
    type: 'push',
    data: {
      thirdPartyId: 'PaD',
      thirdPartySecret: 'PaD_Test',
      clientId: 'test',
      clientSecret: 'test',
      baseUrl: 'https://test'
    }
  }
};

const result = {
  _platform: {
    internalCode: 5,
    name: 'PaD',
    credentials: {
      type: 'push',
      data: {
        thirdPartyId: 'PaD',
        thirdPartySecret: 'PaD_Test',
        clientId: 'test',
        clientSecret: 'test',
        baseUrl: 'https://test'
      }
    }
  },
  doesNotApply: 'n/a',
  parser: {},
  aws: {},
  urlGetProblemas: 'get-tipos-problema',
  urlSetState: 'set-pedido-estado',
  baseUrl: 'https://test',
  clientId: 'test',
  clientSecret: 'test',
  authData: { auth: { username: 'test', password: 'test' } }
};

describe('Pad Singletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await PadSingletton.getInstance(platform);
      expect(JSON.stringify(instance)).to.equal(JSON.stringify(result));
    });
  });
});
