const thirdParty = require('../../../../src/platforms/interfaces/thirdParty');
const expect = require('chai').expect;
import NewsStateSingleton from '../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../src/utils/newsType';
const sinon = require('sinon');
let sandbox;

const croni_order = {
  thirdParty: 'Croni',
  internalCode: 6,
  state: 'CONFIRMED',
  orderId: 50194,
  branchId: '15',
  posId: 50194,
  originalId: 50194,
  displayId: 50194,
  order: {
    id: 50194,
    state: 'CONFIRMED',
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
      dni: 36095544,
      email: 'integration@rappi.com'
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
        promotion: false,
        optionGroups: [],
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
        subtotal: 245,
        paymentAmount: 5,
        partial: 250
      }
    ],
    branchId: '211'
  }
};
const croni_new = {
  extraData: {
    branch: 'Surcusal 19',
    chain: 'Grido',
    client: 'Perez Juan',
    platform: 'Croni',
    region: 'Noreste',
    country: 'Argentina'
  },
  order: {
    customer: {
      name: 'Daley Paley',
      address: 'Obispo trejo 1420 esquina rew qwre',
      phone: '4324232',
      id: 10455712,
      dni: 36095544,
      email: 'integration@rappi.com'
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
        promo: 0,
        promotion: false,
        groupId: 0
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
      remaining: 5,
      partial: 250,
      note: ''
    },
    totalAmount: 245,
    driver: null,
    id: 50194,
    originalId: 50194,
    platformId: 6,
    statusId: 3,
    orderTime: '2019-09-23T16:40:32Z',
    deliveryTime: null,
    pickupOnShop: false,
    pickupDateOnShop: null,
    preOrder: false,
    observations: 'observacion',
    ownDelivery: false,
    displayId: 50194
  },
  typeId: 1,
  branchId: '15',
  viewed: null
};
const platform = {
  name: 'Croni',
  thirdPartyId: 'croni',
  thirdPartySecret: 'croniSecret',
  internalCode: 6,
  createdAt: '2019-09-22T19:45:40.111Z',
  updatedAt: '2019-09-22T19:45:40.111Z',
  id: '5d87cf649b0634004fd83c6e'
};
const branch = {
  address: {
    region: { _id: 'de6916525f469e90351abf60', region: 'Noreste' },
    country: 'Argentina'
  },
  _id: '8c5e2eb8bc28c20a41e09282',
  name: 'Surcusal 19',
  branchId: 2,
  platforms: [
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc2',
      platform: { _id: 'a24d12527267ecfd0b946390', name: 'PedidosYa' },
      branchReference: 19,
      branchIdReference: 49757,
      lastGetNews: ' 2019-12-18T23:29:13.483Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc1',
      platform: { _id: 'f3fc2fb96e42d11cc7c65b4b', name: 'Rappi' },
      branchReference: 115001,
      lastGetNews: '2019-12-18T23:29:13.483Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bc0',
      platform: { _id: '2fa749ada05d3303fb00322b', name: 'PaD' },
      branchReference: 3593,
      lastGetNews: '2019-12-18T23:29:13.483Z'
    },
    {
      progClosed: [],
      _id: '5d87d35ec50f1f0068e92bbf',
      platform: { _id: 'c602426305e1e834cb7fcedc', name: 'Croni' },
      branchReference: 210,
      lastGetNews: '2019-12-18T23:29:13.483Z'
    }
  ],
  chain: { _id: '3b0ed8fa297fb07209439589', chain: 'Grido' },
  client: {
    _id: '0275758a0bc8e6dc0b269c5c',
    contact: 'Juan Perez',
    businessName: 'Perez Juan'
  }
};
describe('THIRDPARTY - Platform parser', function () {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('parse new order', function () {
    it('should return new croni order parsed.', async function () {
      const stateCod = 'pend';
      const newsCod = 'new_ord';

      sandbox.stub(NewsStateSingleton, 'idByCod').returns(3);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);
      let return_new = await thirdParty.newsFromOrders(
        croni_order,
        platform,
        newsCod,
        stateCod,
        branch
      );
      expect(return_new).to.eql(croni_new);
    });

    it('should return new croni promotion order parsed.', async function () {
      const croni_order = {
        thirdParty: 'Croni',
        internalCode: 6,
        state: 'CONFIRMED',
        orderId: 50194,
        branchId: '15',
        displayId: 50194,
        posId: 50194,
        originalId: 50194,
        order: {
          id: 50194,
          state: 'CONFIRMED',
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
            dni: 36095544,
            email: 'integration@rappi.com'
          },
          address: {
            description: 'Obispo trejo 1420 esquina rew qwre',
            phone: '4324232'
          },
          details: [
            {
              id: '4568487',
              unitPrice: 220,
              quantity: 1,
              discount: 0,
              name: 'Promo Helado 2 Kilos por 1',
              sku: '4568487',
              notes: 'Nota de sobre el producto.',
              promotion: true,
              optionGroups: [
                {
                  id: 49,
                  name: 'Primer kilo',
                  sku: '64',
                  unitPrice: '110',
                  notes:
                    'Granizado. X: 1 - Dulce de leche.     X: 1 - Banana. X: 1 - Limon. X: 1'
                },
                {
                  id: 50,
                  name: 'Segundo kilo',
                  unitPrice: '110',
                  sku: '64',
                  notes: 'Chocolate. X: 3 - Vainilla. X: 1'
                }
              ]
            },
            {
              id: 51,
              unitPrice: 240,
              quantity: 1,
              discount: 0,
              name: '  1 Kilo',
              sku: '64',
              notes: 'Granizado. X: 4'
            }
          ],
          payment: [
            {
              method: 'Efectivo',
              online: false,
              paymentAmount: 5,
              partial: 250,
              subtotal: 245
            }
          ],
          branchId: '211'
        }
      };

      const croni_new = {
        extraData: {
          branch: 'Surcusal 19',
          chain: 'Grido',
          client: 'Perez Juan',
          platform: 'Croni',
          region: 'Noreste',
          country: 'Argentina'
        },
        order: {
          customer: {
            name: 'Daley Paley',
            address: 'Obispo trejo 1420 esquina rew qwre',
            phone: '4324232',
            id: 10455712,
            dni: 36095544,
            email: 'integration@rappi.com'
          },
          details: [
            {
              count: 1,
              description: 'Promo Helado 2 Kilos por 1',
              discount: 0,
              groupId: 1,
              optionalText: 'Nota de sobre el producto.',
              price: 220,
              productId: '4568487',
              promo: 2,
              promotion: false,
              sku: '4568487'
            },
            {
              description: 'Primer kilo',
              groupId: 1,
              optionalText:
                'Granizado. X: 1 - Dulce de leche.     X: 1 - Banana. X: 1 - Limon. X: 1',
              productId: 49,
              promo: 1,
              count: 1,
              sku: '64'
            },
            {
              description: 'Segundo kilo',
              groupId: 1,
              optionalText: 'Chocolate. X: 3 - Vainilla. X: 1',
              productId: 50,
              count: 1,
              promo: 1,
              sku: '64'
            },
            {
              count: 1,
              description: '  1 Kilo',
              discount: 0,
              groupId: 0,
              optionalText: 'Granizado. X: 4',
              price: 240,
              productId: 51,
              promo: 0,
              promotion: false,
              sku: '64'
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
            remaining: 5,
            partial: 250,
            note: ''
          },

          totalAmount: 245,
          driver: null,
          id: 50194,
          originalId: 50194,
          platformId: 6,
          statusId: 3,
          orderTime: '2019-09-23T16:40:32Z',
          deliveryTime: null,
          pickupOnShop: false,
          pickupDateOnShop: null,
          preOrder: false,
          observations: 'observacion',
          ownDelivery: false,
          displayId: 50194
        },
        viewed: null,
        typeId: 1,
        branchId: '15'
      };
      const stateCod = 'pend';
      const newsCod = 'new_ord';

      sandbox.stub(NewsStateSingleton, 'idByCod').returns(3);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);
      const return_new = await thirdParty.newsFromOrders(
        croni_order,
        platform,
        newsCod,
        stateCod,
        branch
      );
      expect(return_new).to.eql(croni_new);
    });
  });

  describe('retrive minimun data order', function () {
    context('order with platform format', function () {
      it('should return minium data of the order.', function () {
        let croni_order = {
          id: 50194,
          state: 'CONFIRMED',
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
              promotion: false,
              optionGroups: [],
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
          branchId: '211'
        };
        expect(thirdParty.retriveMinimunData(croni_order)).to.eql({
          branchReference: '211',
          displayId: '50194',
          originalId: '50194',
          posId: 50194
        });
      });
    });
  });
});
