const model = require('../../../src/models/branch');

const expect = require('chai').expect;
const sinon = require('sinon');
const _helpers = require('../../../src/controllers/_helpers');
const news = require('../../../src/models/news');
const rewire = require('rewire');
const branch = rewire('../../../src/controllers/branch');
let sandbox;
const chai = require('chai');
chai.should();
import jwt from 'jsonwebtoken';

const mockRequest = (authorization, params, body, token) => ({
    headers: { authorization },
    params,
    body,
    token
});

const mockResponse = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.end = sinon.stub().returns(res);
    return res;
};

describe('Branch controllers.', function () {
    beforeEach(() => {
        sandbox = sinon.createSandbox();

    });
    afterEach(() => {
        sandbox.restore();
    });

    /*    describe('fn(): getBranchParameters()', function () {
           it('should get parameters sw version of branch', async function () {
               const req = mockRequest(null, null, null, { branchId: 'asdasd554' });
               req.version = '1';
               const res = mockResponse();
               const helpersStub = sandbox.stub(pedidosYa, 'getParameters').resolves(res);
               const result = await branch.getBranchParameters(req, res);
               expect(result).to.eql(res);
           });
           it('should fail getting parameteres of branch', async function () {
               const req = mockRequest();
               const res = mockResponse();
               const helpersStub = sandbox.stub(pedidosYa, 'getParameters').resolves(res)
               const result = await branch.getBranchParameters(req, res);
               expect(result).to.eql(res);
           });
       });
   
       describe('fn(): getNews()', function () {
           it('should get news of branch', async function () {
               const req = mockRequest(null, null, null, { branchId: 'asdasd554' });
               const res = mockResponse();
               sandbox.stub(newsModel, 'find').resolves(res);
               sandbox.stub(pedidosYa, 'callHeartBeat').resolves();
               const result = await branch.getNews(req, res);
               expect(result).to.eql(res);
           });
           it('should get news of branch', async function () {
               const req = mockRequest();
               const res = mockResponse();
               sandbox.stub(newsModel, 'find').resolves(res);
               sandbox.stub(pedidosYa, 'callHeartBeat').resolves();
               const result = await branch.getNews(req, res);
               expect(result).to.eql(res);
           });
       });
   
       describe('fn(): setNews()', function () {
           it('should set news of branch', async function () {
               const body = [{ typeId: 1, id: 'adasdasd123' }]
               const req = mockRequest(null, null, body, { branchId: 'asdasd554' });
               const res = mockResponse();
               sandbox.stub(newsStrategy, 'setNews').resolves('adasdasd123');
               const result = await branch.setNews(req, res);
               expect(result).to.eql(res);
           });
       }); */
});
