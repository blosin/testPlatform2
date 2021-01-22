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

  describe('fn(): rejectPlatformOrder()', function () {
    const stateCod = 'rej';
    const stateId = 2;
    const result = {
      id: order.id,
      state: stateId
    };
    it('should reject the Platform order correctly', async () => {
      const platform = new Platform();
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(stateId);
      const updOrderStateStub = sandbox
        .stub(platform, 'updateOrderState')
        .resolves(true);

      const res = await platform.rejectPlatformOrder(order.id);

      expect(stateIdByCodStub.callCount).to.equal(1);
      expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

      expect(updOrderStateStub.callCount).to.equal(1);
      expect(updOrderStateStub.calledWith({ originalId: order.id }, stateId)).to
        .be.true;

      expect(res).to.eql(result);
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
    it('should dont udpate news state', async function () {
      const findOneAndUpdateStub = sandbox
        .stub(newsModel, 'findOneAndUpdate')
        .rejects();

      let platform = new Platform();
      platform._platform = { internalCode: 10 };
      try {
        await platform.updateNewsState(
          savedOrder,
          statusId,
          typeId,
          viewed,
          entity
        );
      } catch (error) {
        expect(error).to.eql('Failed to update news state.');
      }
    });
  });

  describe('fn(): isClosedRestaurant()', function () {
    it('should pass the validation', async function () {
      let platform = new Platform();
      platform._platform = {
        internalCode: 10,
        _id: '5d87cea59b0634004fd83c6b'
      };
      const branchPlatform = {
        name: 'PediGrido',
        platform: '4766746bc57516b955f29f39',
        lastGetNews: '2023-01-14T15:25:22.912Z',
        progClosed: [
          {
            _id: 'dasdasdadasd',
            open: '2023-01-14T15:25:22.912Z',
            close: '2023-01-14T15:25:22.912Z'
          }
        ],
        isActive: true
      };
      let res = await platform.isClosedRestaurant(branchPlatform);
      expect(res).to.eql(true);
    });

    it('should dont pass the validation 1', async function () {
      let branchPlatforms = {
        name: 'PediGrido',
        platform: '4766746bc57516b955f29f39',
        lastGetNews: '2020-01-14T15:25:22.912Z',
        progClosed: [],
        isActive: true
      };

      let platform = new Platform();
      platform._platform = {
        internalCode: 10,
        _id: '5d87cea59b0634004fd83c6b'
      };
      let res = await platform.isClosedRestaurant(branchPlatforms);
      expect(res).to.eql(false);
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
      originalId: 1,
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

    const minOrder = {
      branchReference: '2',
      posId: 1,
      originalId: '1',
      displayId: '1'
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

    it('should dont save the order', async function () {
      const stateCod = 'rej_closed';
      const state = 'REJECTED';

      sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(state);

      const findOrderStub = sandbox
        .stub(orderModel, 'find')
        .returns({ lean: () => Promise.resolve([minOrder]) });
      try {
        await platform.validateNewOrders(thirdPartyOrders);
      } catch (error) {
        expect(error).to.eql({ error: 'Order: 1 already exists.' });
        expect(findOrderStub.callCount).to.equal(1);
      }
    });
    it('should dont save the order', async function () {
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
        .returns({ lean: () => Promise.resolve() });

      try {
        await platform.validateNewOrders(thirdPartyOrders);
      } catch (error) {
        expect(error).to.eql({ error: 'The branch not exists. 2' });
        expect(findOneStub.callCount).to.equal(1);
        expect(findOrderStub.callCount).to.equal(1);
      }
    });
    it('should  dont save the order', async function () {
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
        .resolves();

      try {
        await platform.validateNewOrders(thirdPartyOrders);
      } catch (error) {
        expect(error).to.eql('Orders could not been processed.');
        expect(saveNewOrderStub.callCount).to.equal(1);
        expect(findOneStub.callCount).to.equal(1);
        expect(findOrderStub.callCount).to.equal(1);
      }
    });
  });

  describe('fn(): saveNewOrders()', function () {
    const stateCod = 'rej_closed';
    const state = 'REJECTED';

    const branch = {
      address: { region: 'Noreste' },
      chain: { chain: 'Grido' },
      client: { businessName: 'Perez Juan' },
      name: 'Surcusal 800000',
      branchId: 800000,
      platform: {
        name: 'PediGrido',
        platform: '4766746bc57516b955f29f39',
        lastGetNews: '2020-12-29T18:32:45.733Z',
        progClosed: [],
        isActive: true
      },
      smartfran_sw: {
        agent: {
          installedVersion: '1.24',
          installedDate: '2019-09-23T19:44:20.562Z',
          nextVersionToInstall: '1.24',
          nextVersionUrl:
            'https://artifacts-agent-notification.s3-us-west-2.amazonaws.com/SmartFranAgente_v_1.25.zip'
        },
        notificator: {
          installedVersion: '1.55',
          installedDate: '2019-09-23T19:44:20.562Z',
          nextVersionToInstall: '1.55',
          nextVersionUrl:
            'https://artifacts-agent-notification.s3-us-west-2.amazonaws.com/SmartFranAlertas_v_1.55.zip'
        }
      }
    };
    const thirdParty_orders = {
      orderId: 4000379,
      originalId: 4000379,
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
      branchId: '800000'
    };

    const newsSaved = [
      {
        thirdParty: 'PediGrido',
        internalCode: 7,
        state: 'PENDING',
        posId: 800000,
        displayId: 800000,
        originalId: 800000,
        branchId: 800000,
        order: thirdParty_orders
      }
    ];

    const newCreator = {
      viewed: null,
      typeId: 1,
      branchId: 800000,
      order: {
        id: 4000381,
        originalId: '4000381',
        displayId: '4000381',
        platformId: 7,
        statusId: 1,
        orderTime: '2019-09-23T16:40:32Z',
        deliveryTime: null,
        pickupOnShop: false,
        pickupDateOnShop: null,
        preOrder: false,
        observations: 'observacion',
        ownDelivery: false,
        customer: {
          name: 'Daley Paley',
          address: 'Obispo trejo 1420 esquina rew qwre',
          phone: '4324232',
          id: 10455712,
          dni: 37897458,
          email: 'daley.paley@gmail.com'
        },
        details: [[Object]],
        payment: {
          typeId: 3,
          online: false,
          shipping: 0,
          discount: 0,
          voucher: '',
          subtotal: 245,
          currency: '$',
          remaining: 55,
          partial: 0,
          note: ''
        },
        driver: null,
        totalAmount: 245
      },
      extraData: {
        branch: 'Surcusal 800000',
        chain: 'Grido',
        platform: 'PediGrido',
        client: 'Perez Juan',
        region: undefined
      }
    };

    const platformObj = new Platform();
    platformObj._platform = {
      internalCode: 7,
      name: 'PediGrido'
    };

    it('Platform - should save the news correctly', async function () {
      sandbox.stub(platformObj, 'getOrderBranches').returns([branch]);
      sandbox.stub(platformObj, 'isClosedRestaurant').returns(true);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      sandbox.stub(thirdParty, 'newsFromOrders').returns(newCreator);
      sandbox.stub(orderModel, 'findOneAndUpdate').returns(true);
      sandbox.stub(newsModel, 'findOneAndUpdate').returns(true);

      const result = await platformObj.saveNewOrders(thirdParty_orders);
      expect([result]).to.eql(newsSaved);
    });
    it('Platform - should dont save the news correctly 1', async function () {
      const stubgetOrderBranches = sandbox
        .stub(platformObj, 'getOrderBranches')
        .returns([]);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      try {
        await platformObj.saveNewOrders(thirdParty_orders);
      } catch (error) {
        expect(error).to.eql({ error: 'There is no branch for this order' });
        expect(stubgetOrderBranches.callCount).to.equal(1);
      }
    });
    it('Platform - should dont save the news correctly 2', async function () {
      const stubgetOrderBranches = sandbox
        .stub(platformObj, 'getOrderBranches')
        .returns([branch]);
      sandbox.stub(platformObj, 'isClosedRestaurant').returns(false);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      try {
        await platformObj.saveNewOrders(thirdParty_orders);
      } catch (error) {
        expect(error).to.eql({
          orderId: 800000,
          error: 'Order: 800000 can not be proccessed correctly.'
        });
        expect(stubgetOrderBranches.callCount).to.equal(1);
      }
    });
    it('Platform - should dont save the news correctly 3', async function () {
      const stubgetOrderBranches = sandbox
        .stub(platformObj, 'getOrderBranches')
        .returns([branch]);
      sandbox.stub(platformObj, 'isClosedRestaurant').returns(false);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(state);
      sandbox.stub(thirdParty, 'newsFromOrders').returns(newCreator);
      const rejectedMessagesStub = sandbox
        .stub(RejectedMessagesSingleton, 'closedResRejectedMessages')
        .get(() => {
          return { id: 1, name: 'Orden rechazada por local cerrado' };
        });
      sandbox.stub(orderModel, 'findOneAndUpdate').rejects();
      try {
        await platformObj.saveNewOrders(thirdParty_orders);
      } catch (error) {
        expect(error).to.eql('Failed to create orders.');
      }
    });
    it('Platform - should dont save the news correctly 4', async function () {
      const branchIsDontActive = {
        address: { region: 'Noreste' },
        chain: { chain: 'Grido' },
        client: { businessName: 'Perez Juan' },
        name: 'Surcusal 800000',
        branchId: 800000,
        platform: {
          name: 'PediGrido',
          platform: '4766746bc57516b955f29f39',
          lastGetNews: '2020-12-29T18:32:45.733Z',
          progClosed: [],
          isActive: false
        },
        smartfran_sw: {
          agent: {
            installedVersion: '1.24',
            installedDate: '2019-09-23T19:44:20.562Z',
            nextVersionToInstall: '1.24',
            nextVersionUrl:
              'https://artifacts-agent-notification.s3-us-west-2.amazonaws.com/SmartFranAgente_v_1.25.zip'
          },
          notificator: {
            installedVersion: '1.55',
            installedDate: '2019-09-23T19:44:20.562Z',
            nextVersionToInstall: '1.55',
            nextVersionUrl:
              'https://artifacts-agent-notification.s3-us-west-2.amazonaws.com/SmartFranAlertas_v_1.55.zip'
          }
        }
      };
      const stubgetOrderBranches = sandbox
        .stub(platformObj, 'getOrderBranches')
        .returns([branchIsDontActive]);
      sandbox.stub(platformObj, 'isClosedRestaurant').returns(true);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(state);
      sandbox.stub(thirdParty, 'newsFromOrders').returns(newCreator);
      const rejectedMessagesStub = sandbox
        .stub(RejectedMessagesSingleton, 'inactiveResRejectedMessages')
        .get(() => {
          return { id: 1, name: 'Orden rechazada por local inactivo' };
        });
      sandbox.stub(orderModel, 'findOneAndUpdate').rejects();
      try {
        await platformObj.saveNewOrders(thirdParty_orders);
      } catch (error) {
        expect(error).to.eql('Failed to create orders.');
      }
    });
    it('Platform - should dont save the news correctly 5', async function () {
      const stubgetOrderBranches = sandbox
        .stub(platformObj, 'getOrderBranches')
        .returns([branch]);
      sandbox.stub(platformObj, 'isClosedRestaurant').returns(false);
      sandbox.stub(thirdParty, 'retriveMinimunData').returns({
        posId: 800000,
        originalId: 800000,
        displayId: 800000,
        branchReference: 800000
      });
      const stateIdByCodStub = sandbox
        .stub(NewsStateSingleton, 'stateByCod')
        .withArgs(stateCod)
        .returns(state);
      sandbox.stub(thirdParty, 'newsFromOrders').rejects(newCreator);

      try {
        await platformObj.saveNewOrders(thirdParty_orders);
      } catch (error) {
        expect(error).to.eql({
          orderId: 800000,
          error: 'Order: 800000 can not be proccessed correctly.'
        });
      }
    });
  });

  describe('fn(): getRejectedMessages()', function () {
    const rejectMsgReturn = [
      {
        id: 11,
        name: 'Cliente reclama pedido no entredago',
        descriptionES: 'Cliente reclama pedido no entredago',
        descriptionPT: 'Cliente reclama pedido no entredago',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 6,
        name: 'Zona peligrosa',
        descriptionES: 'Zona peligrosa',
        descriptionPT: 'Zona peligrosa',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 5,
        name: 'Cliente cancela pedido',
        descriptionES: 'Cliente cancela pedido',
        descriptionPT: 'Cliente cancela pedido',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 7,
        name: 'Sin cambio',
        descriptionES: 'Sin cambio',
        descriptionPT: 'Sin cambio',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 2,
        name: 'Domicilio erroneo',
        descriptionES: 'Domicilio erroneo',
        descriptionPT: 'Domicilio erroneo',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 10,
        name: 'Zona no corresponde',
        descriptionES: 'Zona no corresponde',
        descriptionPT: 'Zona no corresponde',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 1,
        name: 'Sin producto/variedad',
        descriptionES: 'Sin producto/variedad',
        descriptionPT: 'Sin producto/variedad',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 4,
        name: 'Repartidor accidentado',
        descriptionES: 'Repartidor accidentado',
        descriptionPT: 'Repartidor accidentado',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 3,
        name: 'Sin repartidor',
        descriptionES: 'Sin repartidor',
        descriptionPT: 'Sin repartidor',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 8,
        name: 'Cliente no solicita pedido',
        descriptionES: 'Cliente no solicita pedido',
        descriptionPT: 'Cliente no solicita pedido',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: 9,
        name: 'No sale nadie',
        descriptionES: 'No sale nadie',
        descriptionPT: 'No sale nadie',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        id: -1,
        name: 'Orden expirada por tiempo',
        descriptionES: 'Orden expirada por tiempo',
        descriptionPT: 'Orden expirada por tiempo',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      },
      {
        name: 'Orden rechazada por local cerrado',
        descriptionES: 'Orden rechazada por local cerrado',
        descriptionPT: 'Orden rechazada por local cerrado',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        id: -3,
        platformId: 10
      },
      {
        id: -2,
        name: 'Orden rechazada por plataforma',
        descriptionES: 'Orden rechazada por plataforma',
        descriptionPT: 'Orden rechazada por plataforma',
        forRestaurant: true,
        forLogistics: true,
        forPickup: true,
        platformId: 10
      }
    ];
    it('should get Refect Messages', async function () {
      let platform = new Platform();
      platform._platform = { internalCode: 10 };
      let result = await platform.getRejectedMessages();
      expect(result).to.eql(rejectMsgReturn);
    });
  });
  describe('fn(): getBranchPlatform()', function () {
    const platformResult = {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc1',
      platform: '5d87ced89b0634004fd83c6c',
      branchReference: 115005,
      lastGetNews: '2019-11-01T18:19:55.436Z'
    };
    it('should get Platform Parameters', async function () {
      let platform = new Platform();
      let result = await platform.getBranchPlatform(
        branches[0].platforms,
        '5d87ced89b0634004fd83c6c'
      );
      expect(result).to.eql(platformResult);
    });
  });
  describe('fn(): getDeliveryTimes()', function () {
    const deliveryTimeResult = [
      {
        description: '12 horas',
        id: 10,
        maxMinutes: 720,
        minMinutes: 720,
        name: 'Horas12',
        order: 8,
        platformId: 10
      },
      {
        description: "Entre 120' y 150'",
        id: 9,
        maxMinutes: 150,
        minMinutes: 120,
        name: 'Entre120Y150',
        order: 6,
        platformId: 10
      },
      {
        description: "Entre 45' y 60'",
        id: 3,
        maxMinutes: 60,
        minMinutes: 45,
        name: 'Entre45Y60',
        order: 3,
        platformId: 10
      },
      {
        description: "Entre 90' y 120'",
        id: 5,
        maxMinutes: 120,
        minMinutes: 90,
        name: 'Entre90Y120',
        order: 5,
        platformId: 10
      },
      {
        description: '72 horas',
        id: 8,
        maxMinutes: 4320,
        minMinutes: 4320,
        name: 'Horas72',
        order: 11,
        platformId: 10
      },
      {
        description: "Entre 60' y 90'",
        id: 4,
        maxMinutes: 90,
        minMinutes: 60,
        name: 'Entre60Y90',
        order: 4,
        platformId: 10
      },
      {
        description: '24 horas',
        id: 6,
        maxMinutes: 1440,
        minMinutes: 1440,
        name: 'Horas24',
        order: 9,
        platformId: 10
      },
      {
        description: "Entre 15' y 30'",
        id: 1,
        maxMinutes: 30,
        minMinutes: 15,
        name: 'Entre15Y30',
        order: 1,
        platformId: 10
      },
      {
        description: '48 horas',
        id: 7,
        maxMinutes: 2880,
        minMinutes: 2880,
        name: 'Horas48',
        order: 10,
        platformId: 10
      },
      {
        description: "Entre 30' y 45'",
        id: 2,
        maxMinutes: 45,
        minMinutes: 30,
        name: 'Entre30Y45',
        order: 2,
        platformId: 10
      }
    ];
    it('should get Delivery Time', async function () {
      let platform = new Platform();
      platform._platform = { internalCode: 10 };
      let result = await platform.getDeliveryTimes();
      expect(result).to.eql(deliveryTimeResult);
    });
  });
});
