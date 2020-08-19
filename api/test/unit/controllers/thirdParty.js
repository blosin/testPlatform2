const platformModel = require('../../../src/models/platform');

const expect = require('chai').expect;
const sinon = require('sinon');
const _helpers = require('../../../src/controllers/_helpers');
const rewire = require('rewire');
const thirdParty = rewire('../../../src/controllers/thirdParty');
const thirdPartiesFn = { initPlatform: thirdParty.__get__('initPlatform'), };
const logger = require('../../../src/config/logger');
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

describe('ThirdParty controllers.', function () {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        const stubThirdPartiesFn = sinon.stub(thirdPartiesFn, 'initPlatform').returns(null);
        thirdParty.__set__('initPlatform', stubThirdPartiesFn);
        sandbox.stub(logger, 'error');

    });
    afterEach(() => {
        sandbox.restore();
        thirdPartiesFn.initPlatform.restore();
    });

    describe('fn(): findAll()', function () {
        it('should get all thirdParties', async function () {
            const req = mockRequest();
            const res = mockResponse();
            const helpersStub = sandbox.stub(_helpers, 'find').returns(res);
            const result = thirdParty.findAll(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res));
        });
    });

    describe('fn(): findById()', function () {
        it('should get one thirdParty by id', async function () {
            const req = mockRequest();
            const res = mockResponse();
            const helpersStub = sandbox.stub(_helpers, 'findById').returns(res);
            const result = thirdParty.findById(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res));
        });
    });

    describe('fn(): saveOne()', function () {
        it('should save one thirdParty', async function () {
            const req = mockRequest(null, { internalCode: 2 });
            const res = mockResponse();
            const helpersStub = sandbox.stub(_helpers, 'save').returns(res);
            const result = thirdParty.saveOne(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res));
        });
    });

    describe('fn(): updateOne()', function () {
        it('should update one thirdParty by id', async function () {
            const req = mockRequest(null, { internalCode: 2 });
            const res = mockResponse();
            const helpersStub = sandbox.stub(_helpers, 'findByIdAndUpdate').returns(res);
            const result = thirdParty.updateOne(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res));
        });
    });

    describe('fn(): deleteOne()', function () {
        it('should delete one thirdParty by id', async function () {
            const req = mockRequest();
            const res = mockResponse();
            const helpersStub = sandbox.stub(_helpers, 'deleteModel').returns(res);
            const result = thirdParty.deleteOne(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res));
        });
    });

    describe('fn(): login()', function () {
        it('should login pad platform', async function () {
            const req = mockRequest(undefined, { thirdPartyId: "pad", thirdPartySecret: "pad" });
            const res = mockResponse();
            const findParams = {
                id: true,
                name: true,
                thirdPartyId: true,
                internalCode: true
            };
            const filterParams = {
                id: true,
                name: true,
                permissions: true
            };
            const helpersStub = sandbox.stub(_helpers, 'login').returns(res);
            sandbox.stub(platformModel, 'updateOne').resolves();
            const result = await thirdParty.login(req, res);
            expect(result).to.eql(res);
            expect(helpersStub.calledWith(platformModel, req, res, findParams, filterParams, undefined));
        });
    });
});
