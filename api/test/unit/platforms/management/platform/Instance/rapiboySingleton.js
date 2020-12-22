const expect = require('chai').expect;
import RapiboySingletton from '../../../../../../src/platforms/management/platform/instance/rapiboySingleton';

const platform = {
  internalCode: 7,
  name: 'PediGrido',
  credentials: {
    type: 'push',
    data: {
      thirdPartyId: 'rapiboy',
      thirdPartySecret: 'rapiboy_Test',
      baseUrl: 'https://test',
      token: 'test'
    }
  }
};

const result = {
  _platform: {
    internalCode: 7,
    name: 'PediGrido',
    credentials: {
      type: 'push',
      data: {
        thirdPartyId: 'rapiboy',
        thirdPartySecret: 'rapiboy_Test',
        baseUrl: 'https://test',
        token: 'test'
      }
    }
  },
  doesNotApply: 'n/a',
  parser: {},
  aws: {},
  urlRejected: 'CancelarPedido',
  urlConfirmed: 'ConfirmarPedido',
  urlDispatched: 'EnviarPedido',
  urlDelivered: 'EntregarPedido',
  urlRejectedType: 'MotivosRechazo',
  urlDeliveryTime: 'TiemposEntrega',
  baseUrl: 'https://test',
  token: 'test'
};

describe('Pad Singletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await RapiboySingletton.getInstance(platform);
      expect(JSON.stringify(instance)).to.equal(JSON.stringify(result));
    });
  });
});
