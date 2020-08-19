const platformModel = require('../../../src/models/platform');

const expect = require('chai').expect;
const sinon = require('sinon');
const glovo = require('../../../src/controllers/glovo');
const _helpers = require('../../../src/controllers/_helpers');
let sandbox;

const mockRequest = (authorization, body) => ({
    headers: { authorization },
    body
});

const mockResponse = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
};

describe('Glovo controller.', function () {
    beforeEach(() => {
        sandbox = sinon.createSandbox();

    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('fn(): saveCancelOrder()', function () {
        it('should save or cancel order', async function () {
            const req = mockRequest(null, { internalCode: 9 });
            const res = mockResponse();
            const controllerStub = sandbox.stub(glovo, 'saveCancelOrder').returns(res);
            glovo.initPlatform = (internalCode) => true;
            const result = glovo.saveCancelOrder(req, res);
            expect(result).to.eql(res);
            expect(controllerStub.calledWith(platformModel, req, res));
        });
    });
});
