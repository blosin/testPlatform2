const platformModel = require('../../../src/models/platform');

const expect = require('chai').expect;
const sinon = require('sinon');
const _helpers = require('../../../src/controllers/_helpers');
const platforms = require('../../../src/platforms/management/platform');
const rewire = require('rewire');
const thirdParty = rewire('../../../src/controllers/thirdParty');
const thirdPartiesFn = { initPlatform: thirdParty.__get__('initPlatform') };
const logger = require('../../../src/config/logger');
let sandbox;

const mockRequest = (authorization, body, token, params) => ({
  headers: { authorization },
  body,
  token,
  params
});

const mockResponse = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.end = sinon.stub().returns(res);
  return res;
};

const orderData = {
  id: 1,
  state: 'PENDING',
  preOrder: false,
  registeredDate: '2019-09-23T16:40:32Z',
  deliveryDate: null,
  pickup: false,
  pickupDate: null,
  notes: 'observacion',
  logistics: false,
  user: {
    platform: 'thirdParty',
    name: 'Daley',
    lastName: 'Paley',
    id: 10455712,
    email: 'daley.paley@gmail.com',
    dni: 37897458
  },
  address: {
    description: 'Obispo trejo 1420 esquina rew qwre',
    phone: '4324232'
  },
  details: [
    {
      id: 150,
      unitPrice: 220,
      quantity: 1,
      promo: 1,
      promotion: false,
      optionGroups: [],
      discount: 0,
      name: 'Crocantino (10 porciones)',
      sku: '150',
      notes: 'nota'
    }
  ],
  payment: [
    {
      method: 'Efectivo',
      online: false,
      paymentAmount: 55,
      subtotal: 245
    }
  ],
  branchId: 1
};

describe('ThirdParty controllers.', function () {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const stubThirdPartiesFn = sinon
      .stub(thirdPartiesFn, 'initPlatform')
      .returns(null);
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

  /*   describe('fn(): saveOrder()', function () {
    it.only('should save order thirdParty', async function () {
      const req = mockRequest(null, [orderData, orderData], {
        internalCode: 2
      });
      const res = mockResponse();
      const result = thirdParty.saveOrder(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
  });
 */
  describe('fn(): cancelOrder()', function () {
    it('should fail cancel order thirdParty', async function () {
      const req = mockRequest(null, { id: 11 });
      const res = mockResponse();
      const result = await thirdParty.cancelOrder(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
    it('should fail cancel order thirdParty', async function () {
      const req = mockRequest(null, { id: 11, branchId: 2 });
      const res = mockResponse();
      const result = await thirdParty.cancelOrder(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
  });

  describe('fn(): updateOne()', function () {
    it('should update one thirdParty by id', async function () {
      const req = mockRequest(null, { internalCode: 2 });
      const res = mockResponse();
      const helpersStub = sandbox
        .stub(_helpers, 'findByIdAndUpdate')
        .returns(res);
      const result = thirdParty.updateOne(req, res);
      expect(result).to.eql(res);
      expect(helpersStub.calledWith(platformModel, req, res));
    });
  });
  /*  describe('fn(): findOrder()', function () {
    it('should update one thirdParty by id', async function () {
      const req = mockRequest(null, null, { internalCode: 2 });
      const res = mockResponse();
      const findOrderStub = sandbox
        .stub(platforms.prototype, 'findOrder')
        .returns(res);
      const result = thirdParty.findOrder(req, res);
      expect(result).to.eql(res);
    });
  }); */

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
    it('should failed ogin pad platform', async function () {
      const req = mockRequest(undefined, {
        thirdPartySecret: 'pad'
      });
      const res = mockResponse();
      const result = await thirdParty.login(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
    it('should login pad platform', async function () {
      const req = mockRequest(undefined, {
        thirdPartyId: 'pad',
        thirdPartySecret: 'pad'
      });
      const res = mockResponse();
      const findParams = {
        id: true,
        name: true,
        'credentials.data.thirdPartyId': true,
        'credentials.data.thirdPartySecret': true,
        internalCode: true
      };
      const filterParams = {
        id: true,
        name: true,
        permissions: true
      };
      const helpersStub = sandbox.stub(_helpers, 'login').resolves(res);
      sandbox.stub(platformModel, 'updateOne').resolves();
      const result = await thirdParty.login(req, res);
      expect(result).to.eql(res);
      expect(
        helpersStub.calledWith(
          platformModel,
          req,
          res,
          findParams,
          filterParams,
          undefined
        )
      ).to.be.true;
    });
    it('should login pad platform', async function () {
      const req = mockRequest(undefined, {
        thirdPartyId: 'pad',
        thirdPartySecret: 'pad'
      });
      const res = mockResponse();

      sandbox.stub(platformModel, 'updateOne').rejects();
      const result = await thirdParty.login(req, res);
      expect(result).to.eql(res);
      res.status.calledWith(400).should.be.ok;
    });
  });
});
