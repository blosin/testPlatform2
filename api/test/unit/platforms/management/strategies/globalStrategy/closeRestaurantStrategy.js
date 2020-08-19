const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../../src/config/logger';

import CloseRestaurantStrategy from '../../../../../../src/platforms/management/strategies/globalStrategy/closeRestaurantStrategy';
import NewsTypeSingleton from '../../../../../../src/utils/newsType';

let sandbox = sinon.createSandbox();
describe('Close Restaurant Strategy.', function () {
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
        it('should close the restaurant correctly', async function () {
            const strategy = new CloseRestaurantStrategy(newToSet);
            strategy.platform = {
                closeRestaurant: () => { Promise.resolve() }
            };
            const res = strategy.createTrace(newToSet);

            expect(res).to.be.undefined;
        });
    });
});

