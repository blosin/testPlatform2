const model = require('../../../src/models/branch');

const expect = require('chai').expect;
const sinon = require('sinon');
import PlatformFactory from '../../../src/platforms/management/factory_platform';
import PlatformSingleton from '../../../src/utils/platforms';
const rewire = require('rewire');
const branch = rewire('../../../src/controllers/branch');
const logger = require('../../../src/config/logger');
import SetNews from '../../../src/platforms/management/strategies/set-news';

let sandbox;

const mockRequest = (authorization, params, body, token, uuid) => ({
  headers: { authorization },
  params,
  body,
  token,
  uuid
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
  });*/

  describe('fn(): setNews()', function () {
    it('should set news of branch', async function () {
      const body = [{ typeId: 1, id: 'adasdasd123' }, { typeId: 20 }];
      const req = mockRequest(null, null, body, { branchId: 'asdasd554' });
      const res = mockResponse();
      sandbox.stub(SetNews.prototype, 'setNews').resolves('adasdasd123');
      const result = await branch.setNews(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
    });
    it('should faild set news of branch but return 200', async function () {
      const body = [{ typeId: 1, id: 'adasdasd123' }, { typeId: 20 }];
      const req = mockRequest(null, null, body, { branchId: 'asdasd554' });
      const res = mockResponse();
      sandbox.stub(SetNews.prototype, 'setNews').rejects();
      const result = await branch.setNews(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
    });
    it('should faild set news of branch return 400', async function () {
      const req = mockRequest(null, null, null, { branchId: 'asdasd554' });
      const res = mockResponse();
      sandbox.stub(SetNews.prototype, 'setNews').rejects();
      const result = await branch.setNews(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
    it('should faild set news of  return 400', async function () {
      const body = [{ id: 'adasdasd123' }, { typeId: 20 }];
      const req = mockRequest(null, null, body, { branchId: 'asdasd554' });
      const res = mockResponse();
      sandbox.stub(SetNews.prototype, 'setNews').rejects();
      const result = await branch.setNews(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
  });

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
    const platform = {
      _id: 1,
      internalCode: 1,
      name: 'PedidosYa',
      credentials: {
        type: 'sdk',
        data: {
          clientId: 'integration_smartfran',
          clientSecret: '1',
          environment: 'DEVELOPMENT'
        }
      }
    };
    const token = {
      _id: 'e3afa3ba2cbb8eaa4fa6b54d',
      name: 'Surcusal 700000',
      branchId: 700000,
      branchTimeout: '20'
    };
    it('should fail update Date', async function () {
      const req = mockRequest();
      const res = mockResponse();
      req.token = token;
      req.uuid = '1';
      sandbox.stub(PlatformFactory.prototype, 'createPlatform').rejects();
      sandbox.stub(PlatformSingleton, 'getByCod').resolves(platform);
      await branch.updateDate(req, res);
      res.status.calledWith(400).should.be.ok;
    });
  });
});
