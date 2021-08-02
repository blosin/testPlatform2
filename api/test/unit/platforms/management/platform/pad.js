const expect = require('chai').expect;
import sinon from 'sinon';
import axios from 'axios';
import platformModel from '../../../../../src/models/platform';
import logger from '../../../../../src/config/logger';

import Pad from '../../../../../src/platforms/management/platform/pad';
import NewsStateSingleton from '../../../../../src/utils/newsState';

let sandbox;
const orders = [
  {
    id: 62025,
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
      id: 10455712
    },
    address: {
      description: 'Obispo trejo 1420 esquina rew qwre',
      phone: '4324232'
    },
    details: [
      {
        id: 4568487,
        unitPrice: 220,
        quantity: 1,
        promo: 1,
        promotion: true,
        optionGroups: [{}],
        discount: 0,
        name: 'Crocantino (10 porciones)',
        sku: '4568487',
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
    branchId: '15'
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
        progClosed: [
          {
            close: new Date((2019, 8, 10, 10, 15)),
            open: new Date(2019, 8, 10, 10, 25),
            description: 'Closing test'
          }
        ],
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

const platformThirdParty = {
  name: 'PaD',
  thirdPartyId: 'PaD',
  thirdPartySecret: 'PaD_Secret',
  internalCode: 5,
  createdAt: '2019-09-22T19:44:20.562Z',
  updatedAt: '2019-09-22T19:44:20.562Z',
  _id: '5d87cf149b0634004fd83c6d'
};
const statusResponse = {
  receive: true,
  view: true,
  confirm: true,
  dispatch: true,
  delivery: true,
  reject: true
};
const newOrders = [
  {
    thirdParty: platformThirdParty.name,
    internalCode: platformThirdParty.internalCode,
    state: 'PENDING',
    orderId: orders[0].id,
    branchId: branches[0].branchId,
    order: orders[0]
  }
];

const generatedNew = {
  order: {
    customer: {
      name: 'Daley Paley',
      address: 'Obispo trejo 1420 esquina rew qwre',
      phone: '4324232',
      id: 10455712
    },
    details: [
      {
        productId: 4568487,
        count: 1,
        price: 220,
        discount: 0,
        description: 'Crocantino (10 porciones)',
        sku: '4568487',
        optionalText: 'nota',
        promo: 2,
        promotion: false,
        groupId: 1
      },
      {
        promo: 1,
        groupId: 1
      }
    ],
    payment: {
      typeId: 3,
      online: false,
      shipping: 0,
      discount: 0,
      voucher: '',
      subtotal: 245,
      currency: '$',
      git: 55,
      partial: 0,
      note: ''
    },
    totalAmount: 245,
    driver: null,
    id: 62025,
    platformId: newOrders[0].internalCode,
    statusId: 1,
    orderTime: '2019-09-23T16:40:32Z',
    deliveryTime: null,
    pickupOnShop: false,
    pickupDateOnShop: null,
    preOrder: false,
    observations: 'observacion',
    ownDelivery: false
  },
  typeId: 1,
  branchId: newOrders[0].branchId,
  traces: [
    {
      createdAt: '2019-11-19T14:27:11.939Z',
      _id: '5dd3fbbf03b04700110c0311',
      update: {
        typeId: 1,
        order: {
          statusId: 1
        }
      },
      viewed: '2019-11-19T14:28:47.775Z'
    },
    {
      createdAt: '2019-11-19T14:28:47.781Z',
      _id: '5dd3fc1f03b04700110c0312',
      update: {
        typeId: 10,
        'order.statusId': 10,
        typeIdPrev: 1
      },
      viewed: '2019-11-19T14:28:47.761Z'
    }
  ],
  timestamp: '2019-11-19T14:27:11.939Z',
  createdAt: '2019-11-19T14:27:11.944Z',
  updatedAt: '2019-11-19T14:28:47.781Z',
  id: '5dd3fbbf03b04700110c0310'
};

describe('PAD management.', function () {
  let stubLoggerFn;
  beforeEach(() => {
    stubLoggerFn = sinon.stub(logger, 'error');
    sandbox = sinon.createSandbox();
    sandbox.stub(Pad.prototype, 'updateLastContact').returns();
  });
  afterEach(() => {
    sandbox.restore();
    stubLoggerFn.restore();
  });

  describe('fn(): init()', function () {
    it('should init correctly', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      await pad.init();
    });
  });

  describe('fn(): confirmOrder()', function () {
    const stateCod = 'confirm';
    const stateId = 5;

    it('should confirm order correctly', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      let saved = await pad.confirmOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(orders[0], stateId)).to.be.true;
    });

    it('should not confirm order correctly, but resolves', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      const saved = await pad.confirmOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
    it('should not confirm order correctly, catch', async function () {
      const error = {
        code: 1108,
        name: 'Sending confirmed status'
      };
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .rejects(newOrders);

      const saved = await pad.confirmOrder({});

      expect(saved.codeError).to.eql(error);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
  });

  describe('fn(): dispatchOrder()', function () {
    const stateCod = 'dispatch';
    const stateId = 4;

    it('should dispatch order correctly', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      let saved = await pad.dispatchOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(orders[0], stateId)).to.be.true;
    });

    it('should not dispatchOrder order correctly, but resolves', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      const saved = await pad.dispatchOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
    it('should not dispatchOrder order correctly, Catch', async function () {
      const pad = new Pad();
      const codeError = { code: 1109, name: 'Sending dispatched status' };
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .rejects(newOrders);

      const saved = await pad.dispatchOrder(orders[0]);

      expect(saved.codeError).to.eql(codeError);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
  });

  describe('fn(): deliveryOrder()', function () {
    const stateCod = 'delivery';
    const stateId = 3;

    it('should delivery order correctly', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      let saved = await pad.deliveryOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(orders[0], stateId)).to.be.true;
    });

    it('should not deliveryOrder order correctly, but resolves', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      const saved = await pad.deliveryOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
  });

  describe('fn(): branchRejectOrder()', function () {
    const stateCod = 'rej';
    const stateId = 2;

    it('should reject order correctly', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      let saved = await pad.branchRejectOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(orders[0], stateId)).to.be.true;
    });

    it('should not reject order correctly, but resolves', async function () {
      const pad = new Pad();
      pad._platform = platformThirdParty;
      pad.statusResponse = statusResponse;
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(Pad.prototype, 'updateOrderState')
        .resolves(newOrders);
      const axiosStub = sandbox
        .stub(axios, 'post')
        .resolves({ data: newOrders });

      const saved = await pad.branchRejectOrder(orders[0]);

      expect(saved).to.eql(newOrders);

      expect(axiosStub.callCount).to.equal(1);

      expect(stateIdByCodStub.callCount).to.equal(1);

      expect(updOrderStateStub.callCount).to.equal(1);
    });
  });
});
