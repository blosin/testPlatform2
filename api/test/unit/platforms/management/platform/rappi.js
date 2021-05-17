const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../src/config/logger';
import cron from 'node-cron';
import axios from 'axios';

import Rappi from '../../../../../src/platforms/management/platform/rappi';
import NewsStateSingleton from '../../../../../src/utils/newsState';
import CustomError from '../../../../../src/utils/errors/codeError';

let sandbox;
const orders = [
  {
    id: '460901786',
    totalValue: 56.6,
    createdAt: '2018-12-04 14:28:53',
    items: [
      {
        sku: '9999600',
        name: 'pizza mussarela',
        price: '35.9',
        type: 'product',
        subtype: 'pratos',
        comments: 'comentario',
        units: 1,
        toppings: [
          {
            sku: '2716',
            name: 'adição de cheddar',
            price: '6.9',
            type: 'topping',
            subtype: 'queso',
            comments: null,
            units: 1
          },
          {
            sku: '2712',
            name: 'adição de catupiry',
            price: '6.9',
            type: 'topping',
            subtype: 'queso',
            comments: null,
            units: 1
          },
          {
            sku: '2703',
            name: 'borda de cheddar',
            price: '6.9',
            type: 'topping',
            subtype: 'borde',
            comments: null,
            units: 1
          }
        ]
      }
    ],
    client: {
      id: '460901786',
      firstName: 'TEST',
      lastName: 'TEST',
      email: 'test@rappi.com',
      phone: '1233456',
      address: 'cra 93 # 19'
    },
    store: {
      id: '115005',
      name: 'STORE TEST'
    }
  }
];
const branches = [
  {
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
    branchId: 15,
    branchSecret: '15',
    address: 'Calle s/n',
    branchTimeout: '20',
    platforms: [
      {
        progClosed: [],
        _id: '5d87d35ec50f1f0068e92bc2',
        platform: '5d87cea59b0634004fd83c6b',
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
  }
];
const platform = {
  name: 'Rappi',
  thirdPartyId: '-',
  thirdPartySecret: '-',
  internalCode: 2,
  credentials: {
    type: 'pull',
    data: {
      token: 'credentials.rappi.token',
      baseUrl: 'credentials.rappi.baseUrl',
      schedule: 'credentials.rappi.schedule'
    }
  },
  createdAt: '2019-09-22T19:43:20.975Z',
  updatedAt: '2019-09-22T19:43:20.975Z',
  id: '5d87ced89b0634004fd83c6c'
};
const newOrders = [
  {
    thirdParty: platform.name,
    internalCode: platform.internalCode,
    state: 'PENDING',
    orderId: orders[0].id,
    branchId: branches[0].branchId,
    order: orders[0]
  }
];

describe('RAPPI management.', function () {
  let stubLoggerFn;
  let updateLastContactStub;
  beforeEach(() => {
    stubLoggerFn = sinon.stub(logger, 'error');
    sandbox = sinon.createSandbox();
    updateLastContactStub = sandbox
      .stub(Rappi.prototype, 'updateLastContact')
      .returns();
  });
  afterEach(() => {
    sandbox.restore();
    stubLoggerFn.restore();
  });

  describe('fn(): loginGetOrders()', function () {
    let response = { headers: { 'x-auth-int': 'dadasd' } };
    it('should login-get-orderds correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;

      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .resolves(response['headers']['x-auth-int']);

      const getOrdersStub = sandbox
        .stub(Rappi.prototype, 'getOrders')
        .withArgs(response['headers']['x-auth-int'])
        .resolves('xAuth');

      await rappi.loginGetOrders();

      expect(loginStub.callCount).to.equal(1);
      expect(loginStub.calledWith()).to.be.true;

      expect(getOrdersStub.callCount).to.equal(1);
      expect(getOrdersStub.calledWith(response['headers']['x-auth-int'])).to.be
        .true;
    });

    it('should not login-get-orderds correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;

      const axiosStub = sandbox.stub(axios, 'post').rejects('Can not login');

      try {
        await rappi.loginToRappi();
      } catch (error) {
        expect(error.metadata.error).to.eql('Can not login');
      }
    });
  });

  describe('fn(): loginToRappi()', function () {
    let response = { headers: { 'x-auth-int': 'dadasd' } };
    it('should login correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;

      const axiosStub = sandbox.stub(axios, 'post').resolves(response);

      let res = await rappi.loginToRappi();

      expect(res).to.eql(response['headers']['x-auth-int']);
    });

    it('should not login correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;

      const axiosStub = sandbox.stub(axios, 'post').rejects('Can not login');

      try {
        await rappi.loginToRappi();
      } catch (error) {
        expect(error.metadata.error).to.eql('Can not login');
      }
    });
  });

  describe.only('fn(): getOrders()', function () {
    it('should create an order correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      sandbox.stub(axios, 'get').resolves({ data: orders });
      const saveNewOrdersStub = sandbox
        .stub(rappi, 'saveNewOrders')
        .resolves(newOrders[0]);
      let saved = await rappi.getOrders('token');
      console.log(3434);

      expect(saved).to.eql(newOrders);

      expect(saveNewOrdersStub.callCount).to.equal(1);
      expect(saveNewOrdersStub.calledWith(orders[0], rappi._platform)).to.be
        .true;
    });

    it('should not create an order correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const err = 'Error';
      sandbox.stub(axios, 'get').rejects(err);
      const saveNewOrdersStub = sandbox
        .stub(rappi, 'saveNewOrders')
        .resolves(newOrders);
      try {
        await rappi.getOrders('token');
      } catch (error) {
        expect(error.metadata.error).to.eql(err);
        expect(saveNewOrdersStub.callCount).to.equal(0);
      }
    });
  });

  /*   describe('fn(): confirmOrder()', function () {
    const stateCod = 'confirm';
    const stateId = 5;

    it('should confirm order correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
   
      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .resolves('token');

      const axiosStub = sandbox
        .stub(axios, 'get')
        .resolves({ data: newOrders });
      let saved = await rappi.receiveOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(loginStub.callCount).to.equal(1);
      expect(loginStub.calledWith()).to.be.true;

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(orders[0], stateId)).to.be.true;
    });

    it('should not confirm order correctly, but resolves', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Rappi.prototype, 'updateOrderState')
        .resolves(newOrders);

      const rejAutoStub = sandbox
        .stub(Rappi.prototype, 'rejectWrongOrderAutomatically')
        .withArgs(orders[0]._id)
        .resolves();

      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .resolves('token');
      const axiosStub = sandbox.stub(axios, 'get').rejects('Error+++');

      let saved = await rappi.receiveOrder(orders[0]);

      expect(saved.metadata.error).to.eql('Error+++');

      expect(loginStub.callCount).to.equal(1);
      expect(loginStub.calledWith()).to.be.true;

      expect(axiosStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });

    it('should reject when confirm order because can not login', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);

      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .rejects('Error');

      try {
        await rappi.receiveOrder(orders[0]);
      } catch (error) {
        expect(error.error).to.eql('Error');

        expect(loginStub.callCount).to.equal(1);
        expect(loginStub.calledWith()).to.be.true;
      }
    });
  });
 */
  describe('fn(): branchRejectOrder()', function () {
    const stateCod = 'rej';
    const stateId = 4;
    const rejectMessageId = 1;
    const rejectMessageNote = 'Rechazo';

    it('should reject order correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Rappi.prototype, 'updateOrderState')
        .resolves(newOrders);
      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .resolves('token');
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      const res = await rappi.branchRejectOrder(
        orders[0],
        rejectMessageId,
        rejectMessageNote
      );

      expect(res).to.eql(newOrders);

      expect(loginStub.callCount).to.equal(1);
      expect(loginStub.calledWith()).to.be.true;

      expect(axiosStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });

    it('should not reject order correctly', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Rappi.prototype, 'updateOrderState')
        .resolves(newOrders);

      const rejAutoStub = sandbox
        .stub(Rappi.prototype, 'rejectWrongOrderAutomatically')
        .withArgs(orders[0]._id)
        .resolves();

      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .resolves('token');
      const axiosStub = sandbox.stub(axios, 'post').rejects('Error');
      try {
        await rappi.branchRejectOrder(
          orders[0],
          rejectMessageId,
          rejectMessageNote
        );
      } catch (error) {
        expect(error.error).to.eql('Error');

        expect(loginStub.callCount).to.equal(1);
        expect(loginStub.calledWith()).to.be.true;

        expect(axiosStub.callCount).to.equal(1);

        expect(stateIdByCodStub.callCount).to.equal(0);

        expect(updOrderStateStub.callCount).to.equal(0);
      }
    });

    it('should reject when confirm order because can not login', async function () {
      const rappi = new Rappi();
      rappi._platform = platform;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);

      const loginStub = sandbox
        .stub(Rappi.prototype, 'loginToRappi')
        .rejects('Error');

      try {
        await rappi.branchRejectOrder(
          orders[0],
          rejectMessageId,
          rejectMessageNote
        );
      } catch (error) {
        expect(error.error).to.eql('Error');

        expect(loginStub.callCount).to.equal(1);
        expect(loginStub.calledWith()).to.be.true;
      }
    });
  });
});
