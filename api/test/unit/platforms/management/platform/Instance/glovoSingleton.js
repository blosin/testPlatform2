const expect = require('chai').expect;
import GlovoSingleton from '../../../../../../src/platforms/management/platform/instance/glovoSingleton';

const platform = {
  internalCode: 9,
  name: 'Glovo',
  credentials: {
    type: 'push',
    data: { token: 'test' }
  }
};

const result = {
  _platform: {
    internalCode: 9,
    name: 'Glovo',
    credentials: {
      type: 'push',
      data: { token: 'test' }
    }
  },
  doesNotApply: 'n/a',
  parser: {},
  aws: {},
  _token: 'test'
};

describe('Rappi Singletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await GlovoSingleton.getInstance(platform);
      expect(JSON.stringify(instance)).to.equal(JSON.stringify(result));
    });
  });
});
