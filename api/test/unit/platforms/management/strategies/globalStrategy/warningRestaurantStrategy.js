const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../../src/config/logger';
import WarningRestaurantStrategy from '../../../../../../src/platforms/management/strategies/globalStrategy/warningRestaurantStrategy';

let sandbox = sinon.createSandbox();
describe('Warning Restaurant Strategy.', function () {
    const newToSet = {
        typeId: 11,
        id: "5d2dcea6c7632d4a9bfbe0e9",
    };
    beforeEach(() => {
        sandbox.stub(logger, 'error');
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('fn(): manageNewType()', function () {
        it('should log the warning the restaurant correctly', async function () {
            const strategy = new WarningRestaurantStrategy(newToSet);
            strategy.typeId = 9;
            const res = await strategy.manageNewType();
            expect(res).to.be.undefined;
        });
    });
});

