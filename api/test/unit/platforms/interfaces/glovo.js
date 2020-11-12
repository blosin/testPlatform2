const glovo = require('../../../../src/platforms/interfaces/glovo');
const expect = require('chai').expect;
import NewsStateSingleton from '../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../src/utils/newsType';
const sinon = require('sinon');
let sandbox;

const glovo_order = {
  thirdParty: 'Glovo',
  internalCode: 9,
  state: 'CONFIRMED',
  orderId: 50194,
  branchId: '15',
  displayId: 1050289,
  posId: 'BA7DWBUL',
  originalId: 1050289,
  order: {
    orderId: 1050289,
    branchId: '15',
    order_time: '2018-06-08 14:24:53',
    estimated_pickup_time: '2018-06-08 14:45:44',
    is_picked_up_by_customer: true,
    payment_method: 'CASH',
    currency: 'ARS',
    courier: {
      name: 'Flash',
      phone_number: '+34666666666',
    },
    customer: {
      name: 'John Doe',
      phone_number: '3510000000',
      hash: '11111111-2222-3333-4444-555555555555',
      invoicing_details: {
        company_name: 'Acme Inc.',
        company_address: '42 Wallaby Way, Sydney',
        tax_id: 'B12341234',
      },
    },
    order_code: 'BA7DWBUL',
    allergy_info: 'I am allergic to tomato',
    estimated_total_price: 3080,
    delivery_fee: null,
    minimum_basket_surcharge: null,
    customer_cash_payment_amount: 5000,
    products: [
      {
        quantity: 2,
        price: 1234,
        name: 'Helado 1k',
        id: '1',
        attributes: [
          {
            quantity: 1,
            id: 'at1',
            name: 'Chocolate',
            price: 3000,
          },
          {
            quantity: 1,
            id: 'at2',
            name: 'Limon',
            price: 2000,
          },
        ],
      },
    ],
    delivery_address: {
      label: 'John Doe Address',
      latitude: 41.3971955,
      longitude: 2.2001737,
    },
    bundled_orders: ['order-id-1', 'order-id-2'],
    pick_up_code: '433',
  },
};
const glovo_new = {
  extraData: {
    branch: 'Surcusal 15',
    chain: 'Grido',
    client: 'Perez Juan',
    platform: 'Glovo',
    region: 'Noreste',
  },
  order: {
    customer: {
      id: 0,
      name: 'John Doe',
      address: 'John Doe Address',
      phone: '3510000000',
      dni: null,
      email: '-',
    },
    details: [
      {
        productId: 1,
        count: 2,
        price: 12.34,
        promo: 0,
        groupId: '0',
        discount: 0,
        description: 'Helado 1k',
        note: '',
        sku: '1',
        optionalText: ' Chocolate cantidad 1 Limon cantidad 1',
      },
    ],
    payment: {
      typeId: 3,
      shipping: 0,
      discount: 0,
      voucher: 0,
      online: false,
      subtotal: 30.8,
      currency: '$',
      remaining: 19.2,
      partial: 0,
      note: '',
    },
    totalAmount: 30.8,
    driver: {
      name: 'Flash',
      phone: '+34666666666',
    },
    id: 'BA7DWBUL',
    platformId: 9,
    originalId: 1050289,
    statusId: 3,
    orderTime: '2018-06-08 14:24:53',
    pickupDateOnShop: '2018-06-08 14:45:44',
    pickupOnShop: true,
    ownDelivery: false,
    deliveryTime: null,
    observations: 'I am allergic to tomato',
    preOrder: false,
    displayId: 1050289,
  },
  typeId: 1,
  branchId: '15',
  viewed: null,
};
const platform = {
  name: 'Glovo',
  token: '8163f4b0-74be-4286-9152-67d922bdaeb8',
  internalCode: 9,
  createdAt: '2019-09-22T19:45:40.111Z',
  updatedAt: '2019-09-22T19:45:40.111Z',
  id: '5d87cf649b0634004fd83c6e',
};
const branch = {
  address: { region: { _id: 'de6916525f469e90351abf60', region: 'Noreste' } },
  _id: '8c5e2eb8bc28c20a41e09282',
  name: 'Surcusal 15',
  branchId: 2,
  platforms: [
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc2',
      platform: { _id: 'a24d12527267ecfd0b946390', name: 'PedidosYa' },
      branchReference: 19,
      lastGetNews: ' 2019-12-18T23:29:13.483Z',
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc1',
      platform: { _id: 'f3fc2fb96e42d11cc7c65b4b', name: 'Rappi' },
      branchReference: 115001,
      lastGetNews: '2019-12-18T23:29:13.483Z',
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc0',
      platform: { _id: '2fa749ada05d3303fb00322b', name: 'PaD' },
      branchReference: 3593,
      lastGetNews: '2019-12-18T23:29:13.483Z',
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bbf',
      platform: { _id: 'c602426305e1e834cb7fcedc', name: 'Croni' },
      branchReference: 210,
      lastGetNews: '2019-12-18T23:29:13.483Z',
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e98acf',
      platform: { _id: 'c602426305e1e834cb7fcacec', name: 'Glovo' },
      branchReference: 19,
      lastGetNews: '2019-12-18T23:29:13.483Z',
    },
  ],
  chain: { _id: '3b0ed8fa297fb07209439589', chain: 'Grido' },
  client: {
    _id: '0275758a0bc8e6dc0b269c5c',
    contact: 'Juan Perez',
    businessName: 'Perez Juan',
  },
};
describe('GLOVO - Platform parser', function () {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('parse new order', function () {
    it('should return new glovo order parsed.', async function () {
      const stateCod = 'pend';
      const newsCod = 'new_ord';

      sandbox.stub(NewsStateSingleton, 'idByCod').returns(3);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);
      let return_new = await glovo.newsFromOrders(
        glovo_order,
        platform,
        newsCod,
        stateCod,
        branch,
      );
      expect(return_new).to.eql(glovo_new);
    });
  });

  describe('retrive minimun data order', function () {
    context('order with platform format', function () {
      it('should return minium data of the order.', function () {
        let glovo_order = {
          orderId: 'BA7DWBUL',
          originalId: 50194,
          state: 'CONFIRMED',
          preOrder: false,
          registeredDate: '2019-09-23T16:40:32Z',
          deliveryDate: null,
          pickup: false,
          pickupDate: null,
          notes: 'observacion',
          logistics: false,
          user: {
            platform: 'glovo',
            name: 'Daley',
            lastName: 'Paley',
            id: 10455712,
          },
          address: {
            description: 'Obispo trejo 1420 esquina rew qwre',
            phone: '4324232',
          },
          details: [
            {
              id: 4568487,
              unitPrice: 220,
              quantity: 1,
              promo: 1,
              promotion: false,
              optionGroups: [],
              discount: 0,
              name: 'Crocantino (10 porciones)',
              sku: '4568487',
              notes: 'nota',
            },
          ],
          payment: [
            {
              method: 'Efectivo',
              online: false,
              paymentAmount: 55,
              subtotal: 245,
            },
          ],
          branchId: '15',
        };
        expect(glovo.retriveMinimunData(glovo_order)).to.eql({
          branchReference: '15',
          posId: 'BA7DWBUL',
          originalId: 'BA7DWBUL',
          displayId: 'BA7DWBUL',
        });
      });
    });
  });
});
