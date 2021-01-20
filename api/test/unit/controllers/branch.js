const model = require('../../../src/models/branch');

const expect = require('chai').expect;
const sinon = require('sinon');

const rewire = require('rewire');
const branch = rewire('../../../src/controllers/branch');
const logger = require('../../../src/config/logger');
let sandbox;

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

const branchData = {
  smartfran_sw: {
    agent: {
      actualVersion: '1.0.1017',
      releaseUrl:
        'https://smartfran.s3-us-west-2.amazonaws.com/SmartFranPedidos_1.0.17.zip',
      releaseDate: '2019-10-23T19:00:00.000Z',
      installedVersion: '1.0.1019',
      installedDate: '2019-09-23T19:44:20.562Z'
    },
    notificator: {
      actualVersion: '1.0.1016',
      releaseUrl:
        'https://smartfran.s3-us-west-2.amazonaws.com/SmartFranAlertas_1.0.1016.zip',
      releaseDate: '2019-10-28T19:00:00.000Z',
      installedVersion: '1.10.22',
      installedDate: '2019-09-23T19:44:20.562Z'
    }
  },
  _id: '5d8d597141996d0081a70997',
  name: 'Surcusal 15',
  branchId: 2,
  branchSecret: '15',
  address: 'Calle s/n',
  branchTimeout: '20',
  platforms: [
    {
      progClosed: [
        { _id: 'dasdasdadasd', open: new Date(), close: new Date() }
      ],
      _id: '5d87cea59b0634004fd83c6b',
      platform: { _id: '5d87cea59b0634004fd83c6b' },
      branchReference: 15,
      branchIdReference: 62702,
      lastGetNews: '2019-11-01T18:19:55.436Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc1',
      platform: '5d87ced89b0634004fd83c6c',
      branchReference: 115005,
      lastGetNews: '2019-11-01T18:19:55.436Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc0',
      platform: '5d87cf149b0634004fd83c6d',
      branchReference: 15,
      lastGetNews: '2019-11-01T18:19:55.436Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bbf',
      platform: '5d87cf649b0634004fd83c6e',
      branchReference: 211,
      lastGetNews: '2019-11-01T18:19:55.436Z'
    }
  ],
  createdAt: '2019-09-27T00:36:01.270Z',
  updatedAt: '2019-11-01T18:19:55.437Z',
  tzo: -3
};

describe('Branch controllers.', function () {
  let stubLoggerFn;
  beforeEach(() => {
    stubLoggerFn = sinon.stub(logger, 'error');
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    stubLoggerFn.restore();
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

  describe('fn(): udpdateLastGetNews()', function () {
    it('should udpdateLastGetNews', async function () {
      const updOneStub = sandbox.stub(model, 'updateOne').resolves();
      await branch.udpdateLastGetNews(branchData.branchId);
      expect(updOneStub.callCount).to.equal(1);
    });
    it('should fail udpdateLastGetNews', async function () {
      const updOneStub = sandbox.stub(model, 'updateOne').rejects();
      await branch.udpdateLastGetNews('');
      expect(updOneStub.callCount).to.equal(1);
    });
  });
  describe('fn(): updateDate()', function () {
    it.only('should update Date', async function () {
      const req = mockRequest(1);
      const res = mockResponse();
      await branch.updateDate(req, res);
    });
    it('should fail update Date', async function () {
      const updOneStub = sandbox.stub(model, 'updateOne').rejects();
      await branch.updateDate('');
      expect(updOneStub.callCount).to.equal(1);
    });
  });
});
