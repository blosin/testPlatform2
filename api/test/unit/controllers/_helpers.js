const model = require('../../../src/models/branch');

const expect = require('chai').expect;
const sinon = require('sinon');
const rewire = require('rewire');
const logger = require('../../../src/config/logger');
const _helpers = rewire('../../../src/controllers/_helpers');
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

const savedBranch = {
  "smartfran_sw": {
    "agent": {
      "installedVersion": "1.0.1019",
      "installedDate": "2019-09-23T19:44:20.562Z"
    },
    "notificator": {
      "installedVersion": "1.10.22",
      "installedDate": "2019-09-23T19:44:20.562Z"
    }
  },
  "_id": "5d8d597141996d0081a70997",
  "name": "Surcusal 15",
  "branchId": 15,
  "branchSecret": "15",
  "address": "Calle s/n",
  "branchTimeout": "20",
  "platforms": [
    {
      "progClosed": [],
      "_id": "5d87d35ec50f1f0068e92bc2",
      "platform": "5d87cea59b0634004fd83c6b",
      "branchReference": 15,
      "branchIdReference": 62702,
      "lastGetNews": "2019-11-01T18:19:55.436Z"
    }
  ],
  "tzo": -3
};

describe('_helpers controllers.', function () {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(logger, 'error');

  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('fn(): find()', function () {
    it('should find correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.url = 'localhost:3085/api?_populates=[{"path":"chain"}]';
      const res = mockResponse();

      const options = {
        new: true,
        runValidators: true,
        context: 'query'
      };

      const _helpersStub = sandbox.stub(model, 'find').returns({
        select: () => {
          return {
            populate: () => {
              return {
                sort: () => [savedBranch]
              }
            }
          }
        }
      });
      const result = await _helpers.find(model, req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith([savedBranch]).should.be.ok;
      _helpersStub.calledWith({deletedAt:null}).should.be.ok;
    });

    it('should fail find', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 2 };
      const res = mockResponse();

      sandbox.stub(model, 'find').returns({
        select: () => {
          return {
            populate: () => {
              return {
                sort: () => [savedBranch]
              }
            }
          }
        }
      });

      try {
        await _helpers.find(model, req, res);
      } catch (error) {
        expect(error).to.eql({ error: 'Can not find any object.' });
      }
      res.status.calledWith(400).should.be.ok;
      res.json.calledWith({ error: 'Can not find any object.' }).should.be.ok;
    });

  });

  describe('fn(): findById()', function () {

    it('should findById correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 2 };
      req.url = 'localhost:3085/api?_populates=[{"path":"chain"}]';
      const res = mockResponse();

      const _helpersStub = sandbox.stub(model, 'findById').returns({
        select: () => {
          return {
            populate: () => {
              return {
                sort: () => savedBranch
              }
            }
          }
        }
      });
      const result = await _helpers.findById(model, req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith(req.params.id).should.be.ok;
    });

    it('should fail findById', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 2 };
      const res = mockResponse();

      sandbox.stub(model, 'findById').returns({
        select: () => {
          return {
            populate: () => {
              return {
                sort: () => savedBranch
              }
            }
          }
        }
      });

      try {
        await _helpers.findById(model, req, res);
      } catch (error) {
        expect(error).to.eql({ error: 'Can not find any object.' });
      }
      res.status.calledWith(400).should.be.ok;
      res.json.calledWith({ error: 'Can not find any object.' }).should.be.ok;
    });

  });


  describe('fn(): login()', function () {
    it('should fail by inssufficient params', async function () {
      const req = mockRequest();
      const res = mockResponse();
      try {
        await _helpers.login(model, req, res);
      } catch (error) {
        res.status.calledWith(400).should.be.ok;
        res.json.calledWith({
          error: 'Insufficient params.'
        }).should.be.ok;
      }
    });

    it('should login correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      const res = mockResponse();
      const accessToken = 'Barear  easfasa2e1321e321';

      const _helpersStub = sandbox.stub(model, 'findOne').resolves(savedBranch);
      const jwtStub = sandbox.stub(jwt, 'sign').returns(accessToken);

      const branchSelect = {
        agent: true,
        name: true,
        branchId: true,
        branchTimeout: true,
        permissions: true,
        'platforms.platform': true,
        'platforms.branchReference': true,
        'platforms.branchIdReference': true,
      };
      const filterParams = {
        name: true,
        _id: true,
      };
      const user = {
        _id: savedBranch._id,
        name: savedBranch.name,
      };
      const result = await _helpers.login(model, req, res, branchSelect, filterParams);

      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith({
        data: user,
        accessToken
      }).should.be.ok;
      _helpersStub.calledWith(req.body, branchSelect).should.be.ok;
    });

    it('should fail login by incorrect username or password ', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
      };
      const res = mockResponse();

      const _helpersStub = sandbox.stub(model, 'findOne').resolves();

      const branchSelect = {
        agent: true,
        name: true,
        branchId: true,
        branchTimeout: true,
        permissions: true,
        'platforms.platform': true,
        'platforms.branchReference': true,
        'platforms.branchIdReference': true,
      };
      const filterParams = {
        name: true,
        _id: true,
      };
      const result = await _helpers.login(model, req, res, branchSelect, filterParams);

      expect(result).to.eql(res);
      res.status.calledWith(401).should.be.ok;
      res.json.calledWith({
        error: 'Username or password are incorrect.'
      }).should.be.ok;
      _helpersStub.calledWith(req.body, branchSelect).should.be.ok;
    });
  });

  describe('fn(): save()', function () {

    it('should save correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 2 };
      const res = mockResponse();

      const _helpersStub = sandbox.stub(model, 'update')
        .resolves(savedBranch);

      const result = await _helpers.save(model, req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith({ _id: req.params.id }, req.body).should.be.ok;
    });

    it('should create correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: null };
      const res = mockResponse();

      const _helpersStub = sandbox.stub(model, 'create')
        .resolves(savedBranch);

      const result = await _helpers.save(model, req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith(req.body).should.be.ok;
    });

    it('should fail save', async function () {
      const req = mockRequest();
      const res = mockResponse();
      try {
        await _helpers.save(model, req, res);
      } catch (error) {
        expect(error).to.eql({ error: 'Object could not be saved.' });
      }
      res.status.calledWith(400).should.be.ok;
      //res.json.calledWith({ error: 'Object could not be saved.' }).should.be.ok;
    });

  });

  describe('fn(): deleteModel()', function () {

    it('should delete correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 'adsasdasdasñ' };
      const res = mockResponse();

      const options = {
        new: true,
        runValidators: true,
        context: 'query'
      };
      const _helpersStub = sandbox.stub(model, 'findByIdAndUpdate').resolves(savedBranch);

      const result = await _helpers.findByIdAndUpdate(model, req, res);

      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith(req.params.id, req.body, options).should.be.ok;
    });

    it('should not delete correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 'adsasdasdasñ' };
      const res = mockResponse();

      const options = {
        new: true,
        runValidators: true,
        context: 'query'
      };
      const _helpersStub = sandbox.stub(model, 'findByIdAndUpdate').resolves();

      const result = await _helpers.findByIdAndUpdate(model, req, res);

      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
      //res.json.calledWith({ error: 'Object could not be updated.' }).should.be.ok;
      _helpersStub.calledWith(req.params.id, req.body, options).should.be.ok;
    });
  });

  describe('fn(): destroyModel()', function () {

    it('should destroy correctly', async function () {
      const req = mockRequest();
      req.params = { id: 2 };
      const res = mockResponse();
      savedBranch.remove = () => { };
      const _helpersStub = sandbox.stub(model, 'findOneAndRemove')
        .resolves(savedBranch);
      const result = await _helpers.destroyModel(model, req, res);
      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith({ _id: req.params.id }).should.be.ok;
      delete savedBranch.remove;
    });

    it('should fail destroying', async function () {
      const req = mockRequest();
      req.params = { id: 2 };
      const res = mockResponse();

      const _helpersStub = sandbox.stub(model, 'findOneAndRemove')
        .resolves(savedBranch);
      const msg = 'Object could not be destroyed.';
      try {
        await _helpers.destroyModel(model, req, res);
      } catch (error) {
        expect(result).to.eql({ error: msg });

      }
      res.status.calledWith(400).should.be.ok;
      res.json.calledWith({ error: msg }).should.be.ok;
      _helpersStub.calledWith({ _id: req.params.id }).should.be.ok;
    });
  });

  describe('fn(): findByIdAndUpdate()', function () {

    it('should findByIdAndUpdate correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 'adsasdasdasñ' };
      const res = mockResponse();

      const options = {
        new: true,
        runValidators: true,
        context: 'query'
      };
      const _helpersStub = sandbox.stub(model, 'findByIdAndUpdate').resolves(savedBranch);

      const result = await _helpers.findByIdAndUpdate(model, req, res);

      expect(result).to.eql(res);
      res.status.calledWith(200).should.be.ok;
      res.json.calledWith(savedBranch).should.be.ok;
      _helpersStub.calledWith(req.params.id, req.body, options).should.be.ok;
    });

    it('should not update correctly', async function () {
      const req = mockRequest();
      req.body = {
        branchId: 1,
        branchSecret: '19'
      };
      req.params = { id: 'adsasdasdasñ' };
      const res = mockResponse();

      const options = {
        new: true,
        runValidators: true,
        context: 'query'
      };
      const _helpersStub = sandbox.stub(model, 'findByIdAndUpdate').resolves();

      const result = await _helpers.findByIdAndUpdate(model, req, res);

      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
      //res.json.calledWith({ error: 'Object could not be updated.' }).should.be.ok;
      _helpersStub.calledWith(req.params.id, req.body, options).should.be.ok;
    });
  });

});