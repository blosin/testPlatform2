const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../src/config/logger';

import newsModel from '../../../../src/models/news';
import branchModel from '../../../../src/models/branch';
import orderModel from '../../../../src/models/order';
import Platform from '../../../../src/platforms/management/platform';
import NewsStateSingleton from '../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../src/utils/newsType';
import RejectedMessagesSingleton from '../../../../src/utils/rejectedMessages';
const thirdParty = require('../../../../src/platforms/interfaces/thirdParty');

const na = 'n/a';
let sandbox;
const order = {
  id: 134177935,
  code: 'CBL3C9HA',
  state: 'PENDING',
  pickup: false,
  notes: '',
  timestamp: 1575131641792,
  registeredDate: '2019-11-30T13:34:00Z',
  pickupDate: null,
  deliveryDate: '2019-11-30T14:11:00Z',
  responseDate: null,
  dispatchDate: null,
  whiteLabel: null,
  application: 'WEB',
  pushed: false,
  express: false,
  preOrder: false,
  logistics: false,
  integrationCode: null,
  preparationTime: null,
  preparationBuffer: null,
  portal: {
    id: 1,
    name: 'Pedidos Ya'
  },
  user: {
    id: 15233746,
    name: 'Alain',
    lastName: 'Kraupl',
    email: 'alain.kraupl@ross.com.ar',
    identityCard: '36095544',
    isNew: false,
    type: 'WEB_USER',
    orderCount: 16,
    platform: 'PEDIDOS_YA',
    company: {
      name: '',
      document: ''
    }
  },
  address: {
    description: 'Obispo trejo 1000 esquina arasda',
    coordinates: '-31.427,-64.1903',
    phone: '1130765437',
    notes: '',
    zipCode: null,
    area: 'Nueva Córdoba',
    city: 'Córdoba',
    cityId: 137,
    doorNumber: '1000',
    street: 'Obispo trejo',
    corner: 'arasda',
    complement: ''
  },
  payment: {
    id: 87,
    notes: '',
    total: 220,
    shipping: 50,
    shippingNoDiscount: 50,
    amountNoDiscount: 220,
    paymentAmount: 270,
    online: true,
    currencySymbol: '$',
    discount: 0,
    discountType: 'NONE',
    discountNotes: '',
    stampsDiscount: 0,
    card: {
      brand: 'CABAL',
      operationType: 'CREDIT',
      issuer: null
    },
    method: 'Pago online',
    tax: 0,
    subtotal: 270
  },
  discounts: [],
  restaurant: {
    id: 62702,
    name: 'Grido Helados - Obispo Trejo',
    integrationCode: '15',
    integrationName: 'Integración Smartfran',
    country: {
      id: 3,
      name: 'Argentina',
      shortName: 'ar',
      url: 'https://www.pedidosya.com.ar',
      timeOffset: -180,
      currencySymbol: '$',
      culture: 'es_AR'
    },
    deliveryTime: {
      id: 2,
      description: null,
      minMinutes: 30,
      maxMinutes: 45
    }
  },
  details: [
    {
      id: 244550766,
      unitPrice: 220,
      discount: 0,
      total: 220,
      quantity: 1,
      subtotal: 220,
      notes: '',
      product: {
        id: 8739989,
        integrationCode: '60',
        integrationName: '',
        name: 'Crocantino (10 porciones)',
        image: '942522-95743d7e-ace3-4554-ac4b-3364b5fc1afb.jpg',
        index: 3,
        globalIndex: 0,
        section: {
          id: 942522,
          name: 'Postres',
          index: 4,
          integrationCode: '',
          integrationName: ''
        }
      },
      optionGroups: []
    }
  ]
};
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
    branchId: 2,
    branchSecret: '15',
    address: 'Calle s/n',
    branchTimeout: '20',
    platforms: [
      {
        progClosed: [
          { _id: 'dasdasdadasd', opened: new Date(), closed: new Date() }
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
  }
];
const platformSaved = {
  name: 'PedidosYa',
  thirdPartyId: '-',
  thirdPartySecret: '-',
  internalCode: 1,
  credentials: {
    clientId: 'integration_smartfran',
    clientSecret: 'a223e0a5b2'
  },
  createdAt: '2019-09-22T19:42:29.628Z',
  updatedAt: '2019-09-22T19:42:29.628Z',
  _id: '5d87cea59b0634004fd83c6b'
};
const newOrders = [
  {
    thirdParty: platformSaved.name,
    internalCode: platformSaved.internalCode,
    state: 'PENDING',
    orderId: order.id,
    branchId: branches[0].branchId,
    order: order
  }
];

describe('Platform', function () {
  let stubLoggerFn;
  beforeEach(() => {
    stubLoggerFn = sinon.stub(logger, 'error');
    sandbox = sinon.createSandbox();
    sandbox.stub(Platform.prototype, 'updateLastContact').returns();
  });
  afterEach(() => {
    stubLoggerFn.restore();
    sandbox.restore();
  });

  describe('fn(): receiveOrder()', function () {
    it('should receive the order correctly', async () => {
      const platform = new Platform();
      const res = await platform.receiveOrder(order, branches[0].branchId);
      expect(res).to.eql(na);
    });
  });

  describe('fn(): viewOrder()', function () {
    const stateCod = 'view';
    const stateId = 10;
    it('should view the order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);
      const res = await platform.viewOrder(order, branches[0].branchId);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(order, stateId)).to.be.true;

      expect(res).to.eql(na);
    });
  });

  describe('fn(): confirmOrder()', function () {
    const stateCod = 'confirm';
    const stateId = 5;
    it('should confirm the order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);
      const res = await platform.confirmOrder(order, branches[0].branchId);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(order, stateId)).to.be.true;

      expect(res).to.eql(na);
    });
  });

  describe('fn(): dispatchOrder()', function () {
    const stateCod = 'dispatch';
    const stateId = 10;
    it('should dispatch the order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);
      const res = await platform.dispatchOrder(order, branches[0].branchId);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(order, stateId)).to.be.true;

      expect(res).to.eql(na);
    });
  });

  describe('fn(): deliveryOrder()', function () {
    const stateCod = 'delivery';
    const stateId = 14;
    it('should delivery the order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);
      const res = await platform.deliveryOrder(order);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(order, stateId)).to.be.true;

      expect(res).to.eql(na);
    });
  });

  describe('fn(): branchRejectOrder()', function () {
    const stateCod = 'rej';
    const stateId = 2;
    it('should reject the order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);
      const res = await platform.branchRejectOrder(order, branches[0].branchId);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith(order, stateId)).to.be.true;

      expect(res).to.eql(na);
    });
  });

  describe('fn(): findOrder()', function () {
    const stateCod = 'rej_closed';
    const stateId = 13;

    it('order was found', async function () {
      let savedOrder = newOrders[0];
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);

      sandbox
        .stub(orderModel, 'findOne')
        .returns({ lean: () => Promise.resolve(savedOrder) });

      let platform = new Platform();
      platform._platform = { internalCode: 10 };

      const order = await platform.findOrder(savedOrder.orderId);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(order).to.eql(savedOrder.order);
    });

    it('order was not found. Catch error.', function () {
      let savedOrder = newOrders[0];
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      sandbox
        .stub(orderModel, 'findOne')
        .returns({ lean: () => Promise.reject('Error') });
      let platform = new Platform();
      platform._platform = { internalCode: 10 };

      platform.findOrder(savedOrder.orderId).catch((error) => {
        expect(error).to.eql({ orderId: 134177935, error: 'Error' });
        expect(stateIdByCodStub.callCount).to.equal(1);
        expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;
      });
    });

    it('order was not found', function () {
      let savedOrder = newOrders[0];
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      sandbox
        .stub(orderModel, 'findOne')
        .returns({ lean: () => Promise.resolve(null) });
      let platform = new Platform();
      platform._platform = { internalCode: 10 };

      platform.findOrder(savedOrder.orderId).catch((error) => {
        expect(error).to.eql({
          orderId: 134177935,
          error: 'The order 134177935 could not be found.'
        });

        expect(stateIdByCodStub.callCount).to.equal(1);
        expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;
      });
    });
  });

  describe('fn(): closeRestaurant()', function () {
    let savedOrder = newOrders[0];
    it('should close the restaurant', async function () {
      const validatedClosed = '';
      const findOneStub = sandbox
        .stub(branchModel, 'findOne')
        .resolves(branches[0]);
      const updOneStub = sandbox.stub(branchModel, 'updateOne').resolves(null);
      const getBPlatformStub = sandbox
        .stub(Platform.prototype, 'getBranchPlatform')
        .returns();
      const validateProgClosedStub = sandbox
        .stub(branchModel, 'validateNewProgClosed')
        .returns(validatedClosed);
      const timeToClose = 10;
      const description = 'Closing test.';
      const platform = new Platform();
      platform._platform = { _id: 'ssdadsaa' };
      let order = await platform.closeRestaurant(
        savedOrder.branchId,
        platformSaved,
        timeToClose,
        description
      );

      expect(order).to.eql();
      expect(findOneStub.callCount).to.equal(1);
      expect(updOneStub.callCount).to.equal(1);

      expect(getBPlatformStub.callCount).to.equal(1);
      expect(validateProgClosedStub.callCount).to.equal(1);
    });

    it('should not close the restaurant. It is already close', async () => {
      const validatedClosed = 'Failed to closeRestaurant.';
      const findOneStub = sandbox
        .stub(branchModel, 'findOne')
        .resolves(branches[0]);
      const getBPlatformStub = sandbox
        .stub(Platform.prototype, 'getBranchPlatform')
        .returns();
      const validateProgClosedStub = sandbox
        .stub(branchModel, 'validateNewProgClosed')
        .returns(validatedClosed);
      const timeToClose = 10;
      const description = 'Closing test.';
      const platform = new Platform();
      platform._platform = { _id: 'ssdadsaa' };

      try {
        await platform.closeRestaurant(
          savedOrder.branchId,
          platformSaved,
          timeToClose,
          description
        );
      } catch (error) {
        expect(error).to.eql(
          `${validatedClosed} RestaurantCode: ${branches[0].branchId}.`
        );
        expect(findOneStub.callCount).to.equal(1);
        expect(getBPlatformStub.callCount).to.equal(1);
        expect(validateProgClosedStub.callCount).to.equal(1);
      }
    });
  });

  describe('fn(): openRestaurant()', function () {
    let savedOrder = newOrders[0];
    it('should open the restaurant', async function () {
      const findOneStub = sandbox
        .stub(branchModel, 'findOne')
        .resolves(branches[0]);
      const updOneStub = sandbox.stub(branchModel, 'updateOne').resolves(null);
      const getBPlatformStub = sandbox
        .stub(Platform.prototype, 'getBranchPlatform')
        .returns();
      const findProgClosedToOpenStub = sandbox
        .stub(branchModel, 'findProgClosedToOpen')
        .returns(branches[0].platforms[0].progClosed[0]);
      let platform = new Platform();
      platform._platform = { _id: 'ssdadsaa' };
      let order = await platform.openRestaurant(
        savedOrder.branchId,
        platformSaved
      );

      expect(order).to.eql();
      expect(findOneStub.callCount).to.equal(1);
      expect(getBPlatformStub.callCount).to.equal(1);
      expect(findProgClosedToOpenStub.callCount).to.equal(1);
    });
    it('should not open the restaurant. It has not a programmed closed', async () => {
      const closedProg = 'The restaurant has no closed programmed now.';
      const findOneStub = sandbox
        .stub(branchModel, 'findOne')
        .resolves(branches[0]);
      const getBPlatformStub = sandbox
        .stub(Platform.prototype, 'getBranchPlatform')
        .returns();
      const findProgClosedToOpenStub = sandbox
        .stub(branchModel, 'findProgClosedToOpen')
        .returns(closedProg);
      let platform = new Platform();
      platform._platform = { _id: 'ssdadsaa' };
      try {
        await platform.openRestaurant(savedOrder.branchId, platformSaved);
      } catch (error) {
        expect(error).to.eql(
          `Failed to openRestaurant. RestaurantCode: ${savedOrder.branchId}.`
        );
        expect(findOneStub.callCount).to.equal(1);
        expect(getBPlatformStub.callCount).to.equal(1);
        expect(findProgClosedToOpenStub.callCount).to.equal(1);
      }
    });
  });

  describe('fn(): updateOrderState()', function () {
    let state = ' PENDING';
    let savedOrder = newOrders[0];
    it('should udpate order state', async function () {
      const findOneAndUpdateStub = sandbox
        .stub(orderModel, 'findOneAndUpdate')
        .resolves();
      const rejectedMessagesStub = sandbox
        .stub(RejectedMessagesSingleton, 'closedResRejectedMessages')
        .get(() => {
          return { id: 1 };
        });

      let platform = new Platform();
      platform._platform = { internalCode: 10 };

      let res = await platform.updateOrderState(savedOrder.order, state);

      expect(res).to.eql();
      expect(findOneAndUpdateStub.callCount).to.equal(1);
    });

    it('should not update order state', async () => {
      const findOneAndUpdateStub = sandbox
        .stub(orderModel, 'findOneAndUpdate')
        .withArgs(savedOrder, state)
        .rejects();
      const rejectedMessagesStub = sandbox
        .stub(RejectedMessagesSingleton, 'closedResRejectedMessages')
        .get(() => {
          return { id: 1 };
        });

      let platform = new Platform();
      platform._platform = { internalCode: 10 };
      try {
        await platform.updateOrderState(savedOrder, state);
      } catch (error) {
        expect(error).to.eql(`Failed to update order state.`);
        expect(findOneAndUpdateStub.callCount).to.equal(0);
      }
    });
  });

  describe('fn(): updateNewsState()', function () {
    const savedOrder = newOrders[0];
    const statusId = 1;
    const typeId = 13;
    const viewed = null;
    const entity = 'BRANCH';
    const typeCod = 'rej_closed_ord';
    it('should udpate news state', async function () {
      const findOneAndUpdateStub = sandbox
        .stub(newsModel, 'findOneAndUpdate')
        .resolves();
      const idByCodStub = sandbox
        .stub(NewsTypeSingleton, 'idByCod')
        .withArgs(typeCod)
        .returns(typeId);
      let platform = new Platform();
      platform._platform = { internalCode: 10 };

      let res = await platform.updateNewsState(
        savedOrder,
        statusId,
        typeId,
        viewed,
        entity
      );
      expect(res).to.eql();
      expect(idByCodStub.callCount).to.equal(1);
      expect(idByCodStub.calledWith(typeCod)).to.be.true;
    });
  });

  describe('fn(): isClosedRestaurant()', function () {
    it('should pass the validation', async function () {
      let platform = new Platform();
      platform._platform = {
        internalCode: 10,
        _id: '5d87cea59b0634004fd83c6b'
      };
      let res = await platform.isClosedRestaurant(
        branches[0],
        newOrders[0].orderId,
        platformSaved
      );
      expect(res).to.eql(true);
    });
  });

  describe('fn(): validateNewOrders()', function () {
    let platform = new Platform();
    platform._platform = {
      internalCode: 10,
      _id: '5d87cea59b0634004fd83c6b'
    };
    const thirdPartyOrders = {
      id: 1,
      state: 'PENDING',
      preOrder: false,
      registeredDate: '2020-02-26 18:32:16',
      deliveryDate: '2020-02-26 18:40:16',
      pickup: false,
      pickupDate: null,
      notes: '',
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
          id: 10,
          unitPrice: 1,
          quantity: 1,
          name: 'SMOOTHIES Y BATIDOS - Smoothie Durazno Naranja',
          sku: '141',
          notes: '1 SMOOTHIES Y BATIDOS - Smoothie Durazno Naranja'
        },
        {
          id: 13,
          unitPrice: '1',
          quantity: 1,
          name: 'HELADOR POR Kg - 1 Kilo',
          sku: '190',
          notes: 'notas'
        }
      ],
      payment: [
        {
          method: 'Tarjeta de Credito',
          online: false,
          subtotal: 55
        }
      ],
      branchId: 2
    };
    const ordersProccessed = [
      {
        posId: 1,
        thirdParty: 'PaD',
        internalCode: platform._platform.internalCode,
        state: 'PENDING',
        orderId: thirdPartyOrders.id,
        branchId: branches[0].branchId,
        order: thirdPartyOrders
      }
    ];
    const branchThirdParty = {
      _id: '5d8d597141996d0081a70997',
      branchId: 2,
      platforms: [
        {
          progClosed: [
            { _id: 'dasdasdadasd', opened: new Date(), closed: new Date() }
          ],
          _id: '5d87cea59b0634004fd83c6b',
          platform: '5d87cea59b0634004fd83c6b',
          branchReference: 2,
          branchIdReference: 62702,
          lastGetNews: '2019-11-01T18:19:55.436Z'
        }
      ]
    };
    it('should save the order', async function () {
      const stateCod = 'rej_closed';
      const state = 'REJECTED';

      sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(state);

      const findOrderStub = sandbox
        .stub(orderModel, 'find')
        .returns({ lean: () => Promise.resolve([]) });

      const findOneStub = sandbox
        .stub(branchModel, 'findOne')
        .returns({ lean: () => Promise.resolve(branchThirdParty) });

      const saveNewOrderStub = sandbox
        .stub(platform, 'saveNewOrders')
        .withArgs(thirdPartyOrders)
        .resolves(ordersProccessed[0]);

      let res = await platform.validateNewOrders(thirdPartyOrders);

      expect(res).to.eql({ id: 1, state: 'PENDING', branchId: '2' });
      expect(saveNewOrderStub.callCount).to.equal(1);
      expect(findOneStub.callCount).to.equal(1);
      expect(findOrderStub.callCount).to.equal(1);
    });
  });

  describe('fn(): saveNewOrders()', function () {
    beforeEach(() => {
      sandbox.stub(branchModel, 'find').returns({
        populate: () => {
          return {
            populate: () => {
              return {
                populate: () => {
                  return { populate: () => [branch] };
                }
              };
            }
          };
        }
      });
      sinon.stub(Platform.prototype, 'isClosedRestaurant').returns();
      sinon.stub(Platform.prototype, 'saveNewOrders').resolves(newOrders);
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('Platform - should save the news correctly', async function () {
      const sandboxPY = sinon.createSandbox();
      sandboxPY.stub(newsModel, 'createTrace').returns();
      sandboxPY.stub(orderModel, 'create').returns();
      sandboxPY.stub(newsModel, 'create').returns();
      const pedidosYa_orders = [
        {
          id: 134177935,
          code: 'CBL3C9HA',
          state: 'PENDING',
          pickup: false,
          notes: '',
          timestamp: 1575131641792,
          registeredDate: '2019-11-30T13:34:00Z',
          pickupDate: null,
          deliveryDate: '2019-11-30T14:11:00Z',
          responseDate: null,
          dispatchDate: null,
          whiteLabel: null,
          application: 'WEB',
          pushed: false,
          express: false,
          preOrder: false,
          logistics: false,
          integrationCode: null,
          preparationTime: null,
          preparationBuffer: null,
          portal: {
            id: 1,
            name: 'Pedidos Ya'
          },
          user: {
            id: 15233746,
            name: 'Alain',
            lastName: 'Kraupl',
            email: 'alain.kraupl@ross.com.ar',
            identityCard: '36095544',
            isNew: false,
            type: 'WEB_USER',
            orderCount: 16,
            platform: 'PEDIDOS_YA',
            company: {
              name: '',
              document: ''
            }
          },
          address: {
            description: 'Obispo trejo 1000 esquina arasda',
            coordinates: '-31.427,-64.1903',
            phone: '1130765437',
            notes: '',
            zipCode: null,
            area: 'Nueva Córdoba',
            city: 'Córdoba',
            cityId: 137,
            doorNumber: '1000',
            street: 'Obispo trejo',
            corner: 'arasda',
            complement: ''
          },
          payment: {
            id: 87,
            notes: '',
            total: 220,
            shipping: 50,
            shippingNoDiscount: 50,
            amountNoDiscount: 220,
            paymentAmount: 270,
            online: true,
            currencySymbol: '$',
            discount: 0,
            discountType: 'NONE',
            discountNotes: '',
            stampsDiscount: 0,
            card: {
              brand: 'CABAL',
              operationType: 'CREDIT',
              issuer: null
            },
            method: 'Pago online',
            tax: 0,
            subtotal: 270
          },
          discounts: [],
          restaurant: {
            id: 62702,
            name: 'Grido Helados - Obispo Trejo',
            integrationCode: '15',
            integrationName: 'Integración Smartfran',
            country: {
              id: 3,
              name: 'Argentina',
              shortName: 'ar',
              url: 'https://www.pedidosya.com.ar',
              timeOffset: -180,
              currencySymbol: '$',
              culture: 'es_AR'
            },
            deliveryTime: {
              id: 2,
              description: null,
              minMinutes: 30,
              maxMinutes: 45
            }
          },
          details: [
            {
              id: 244550766,
              unitPrice: 220,
              discount: 0,
              total: 220,
              quantity: 1,
              subtotal: 220,
              notes: '',
              product: {
                id: 8739989,
                integrationCode: '60',
                integrationName: '',
                name: 'Crocantino (10 porciones)',
                image: '942522-95743d7e-ace3-4554-ac4b-3364b5fc1afb.jpg',
                index: 3,
                globalIndex: 0,
                section: {
                  id: 942522,
                  name: 'Postres',
                  index: 4,
                  integrationCode: '',
                  integrationName: ''
                }
              },
              optionGroups: []
            }
          ]
        }
      ];
      const newsSaved = [
        {
          thirdParty: 'PedidosYa',
          internalCode: 1,
          state: 'PENDING',
          orderId: 134177935,
          branchId: 2,
          order: pedidosYa_orders[0]
        }
      ];
      const platformObj = new Platform();
      const result = await platformObj.saveNewOrders(pedidosYa_orders);
      sandboxPY.restore();
      expect(result).to.eql(newsSaved);
    });
  });
});
