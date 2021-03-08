/* const expect = require('chai').expect;
import CroniSingleton from '../../../../../../src/platforms/management/platform/instance/croniSingleton';

const platform = {
  internalCode: 6,
  name: 'Croni',
  credentials: {
    type: 'push',
    data: { thirdPartyId: 'croni', thirdPartySecret: 'test' }
  }
};

const result = {
  _platform: {
    internalCode: 6,
    name: 'Croni',
    credentials: {
      type: 'push',
      data: { thirdPartyId: 'croni', thirdPartySecret: 'test' }
    }
  },
  doesNotApply: 'n/a',
  parser: {},
  aws: {}
};

describe('Rappi Singletton', function () {
  describe('fn(): getInstance()', function () {
    it('should  getInstance correctly', async function () {
      const instance = await CroniSingleton.getInstance(platform);
      expect(JSON.stringify(instance)).to.equal(JSON.stringify(result));
    });
  });
});
 */
