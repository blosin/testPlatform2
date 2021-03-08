const expect = require('chai').expect;
import PedidosYaSingletton from '../../../../../../src/platforms/management/platform/instance/pedidosYaSingleton';

const platform = {
  internalCode: 1,
  name: 'PedidosYa',
  credentials: {
    type: 'sdk',
    data: {
      clientId: 'test',
      clientSecret: 'test'
    }
  }
};

const result = {
  internalCode: 1,
  name: 'PedidosYa',
  credentials: {
    type: 'sdk',
    data: { clientId: 'test', clientSecret: 'test' }
  }
};

describe('PedidosYaSingletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await PedidosYaSingletton.getInstance(platform);
      expect(instance._platform.toString()).to.equal(result.toString());
    });
  });
});
