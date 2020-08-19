const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../../src/config/logger';
import OpenRestaurantStrategy from '../../../../../../src/platforms/management/strategies/globalStrategy/openRestaurantStrategy';

let sandbox = sinon.createSandbox();
describe('Open Restaurant Strategy.', function () {
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
        it('should open the restaurant correctly', async function () {
            const strategy = new OpenRestaurantStrategy(newToSet);
            strategy.platform = {
                openRestaurant: () => { Promise.resolve() }
            };
            const res = strategy.createTrace(newToSet);

            expect(res).to.be.undefined;
        });
    });
});

