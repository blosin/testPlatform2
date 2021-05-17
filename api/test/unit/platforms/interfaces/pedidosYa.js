const pedidosYa = require('../../../../src/platforms/interfaces/pedidosYa');
import NewsStateSingleton from '../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../src/utils/newsType';
const sinon = require('sinon');
let sandbox;

const expect = require('chai').expect;

const order = {
  id: 133290240,
  code: 'ACH65E9F',
  state: 'PENDING',
  pickup: false,
  notes: '',
  timestamp: 1572353526476,
  registeredDate: '2019-10-29T09:52:05Z',
  pickupDate: null,
  deliveryDate: '2019-10-29T10:29:05Z',
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
    orderCount: 15,
    platform: 'PEDIDOS_YA',
    company: {
      name: '',
      document: ''
    }
  },
  address: {
    description: 'Colon 5500 esquina 1 y 1',
    coordinates: '-31.3955,-64.2556',
    phone: '1130765437',
    notes: '',
    zipCode: null,
    area: 'Teodoro Fels',
    city: 'Córdoba',
    cityId: 137,
    doorNumber: '5500',
    street: 'Colon',
    corner: '1 y 1',
    complement: ''
  },
  payment: {
    id: 87,
    notes: '',
    total: 240,
    shipping: 30,
    shippingNoDiscount: 30,
    amountNoDiscount: 240,
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
    id: 49757,
    name: 'Grido Helados Cpc Colon',
    integrationCode: '19',
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
      id: 243661146,
      unitPrice: 240,
      discount: 0,
      total: 240,
      quantity: 1,
      subtotal: 240,
      notes: '',
      product: {
        id: 8804062,
        integrationCode: '64',
        integrationName: '',
        name: 'Helado pote 1 kg',
        image: '942521-5a5d5338-76f5-4f72-b9c9-d6913fd6f2c7.jpg',
        index: 3,
        globalIndex: 0,
        section: {
          id: 943725,
          name: 'Línea de sabores',
          index: 4,
          integrationCode: '',
          integrationName: ''
        }
      },
      optionGroups: [
        {
          id: 4531406,
          name: 'Sabores',
          index: 0,
          integrationCode: '64',
          integrationName: '',
          options: [
            {
              id: 30132388,
              name: 'Anana a la crema',
              index: 0,
              integrationCode: '99999',
              integrationName: '',
              amount: 0,
              modifiesPrice: false,
              quantity: 4
            }
          ]
        }
      ]
    }
  ],
  receptionSystems: [
    {
      id: 138,
      code: 'integration_smartfran'
    }
  ],
  attachments: []
};
const encapsulated_order = {
  thirdParty: 'PedidosYa',
  internalCode: 1,
  state: 'PENDING',
  orderId: '133290240',
  branchId: '19',
  order: order
};
const parsed_new = {
  extraData: {
    branch: 'Surcusal 19',
    chain: 'Grido',
    client: 'Perez Juan',
    platform: 'PedidosYa',
    region: 'Noreste'
  },
  order: {
    id: 133290240,
    platformId: 1,
    statusId: 1,
    displayId: 133290240,
    originalId: 133290240,
    orderTime: '2019-10-29T09:52:05Z',
    deliveryTime: '2019-10-29T10:29:05Z',
    pickupOnShop: false,
    pickupDateOnShop: null,
    preOrder: false,
    observations: '',
    ownDelivery: true,
    customer: {
      id: 15233746,
      name: 'Alain Kraupl',
      address: 'Colon 5500 esquina 1 y 1',
      phone: '1130765437',
      email: 'alain.kraupl@ross.com.ar',
      dni: '36095544'
    },
    details: [
      {
        productId: 8804062,
        count: 1,
        price: 240,
        promo: 0,
        groupId: '0',
        discount: 0,
        description: 'Helado pote 1 kg',
        note: '',
        sku: '64',
        optionalText: ' Sabores Anana a la crema X 4'
      }
    ],
    payment: {
      typeId: 2,
      online: true,
      shipping: 30,
      discount: 0,
      voucher: '',
      subtotal: 270,
      currency: '$',
      remaining: 0,
      partial: 0,
      note: ''
    },
    driver: null,
    totalAmount: 270
  },
  typeId: 1,
  branchId: '19',
  viewed: null
};
const platform = {
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
  id: '5d87cea59b0634004fd83c6b'
};
const branch = {
  address: { region: { _id: 'de6916525f469e90351abf60', region: 'Noreste' } },
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

describe('PEDIDOSYA - Platform parser', function () {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('fn(): newsFromOrders()', function () {
    it('should return new pedidosYa order parsed.', async function () {
      const stateCod = 'pend';
      const newsCod = 'new_ord';

      sandbox.stub(NewsStateSingleton, 'idByCod').returns(1);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);

      let return_new = await pedidosYa.newsFromOrders(
        encapsulated_order,
        platform,
        newsCod,
        stateCod,
        branch
      );
      expect(return_new).to.eql(parsed_new);
    });

    it('should return new pedidosYa order parsed with no operationType known.', async function () {
      const stateCod = 'pend';
      const newsCod = 'new_ord';

      sandbox.stub(NewsStateSingleton, 'idByCod').returns(1);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);
      encapsulated_order.order.payment.card.operationType = 'WALLET';
      let return_new = await pedidosYa.newsFromOrders(
        encapsulated_order,
        platform,
        newsCod,
        stateCod,
        branch
      );
      parsed_new.order.payment.typeId = 2;
      expect(return_new).to.eql(parsed_new);
    });

    it('should return new pedidosYa promotion order parsed.', async function () {
      const stateCod = 'pend';
      const newsCod = 'new_ord';
      sandbox.stub(NewsStateSingleton, 'idByCod').returns(1);
      sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);

      const promotionOrder = {
        id: 134213514,
        code: '2O6NEGFE',
        state: 'CLOSED_RESTAURANT_REJECTED',
        pickup: false,
        notes: '',
        timestamp: 1575742825505,
        registeredDate: '2019-12-07T15:20:24Z',
        pickupDate: null,
        deliveryDate: '2019-12-07T15:57:24Z',
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
          id: 1,
          notes: '',
          total: 600,
          shipping: 50,
          shippingNoDiscount: 50,
          amountNoDiscount: 600,
          paymentAmount: 650,
          online: false,
          currencySymbol: '$',
          discount: 0,
          discountType: 'NONE',
          discountNotes: '',
          stampsDiscount: 0,
          card: {
            brand: null,
            operationType: null,
            issuer: null
          },
          method: 'Efectivo',
          tax: 0,
          subtotal: 650
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
            id: 244586547,
            unitPrice: 600,
            discount: 0,
            total: 600,
            quantity: 1,
            subtotal: 600,
            notes: '',
            product: {
              id: 8740033,
              integrationCode: '10001',
              integrationName: '',
              name: 'Promo - Helado 1 kg + Familiar + Tentación',
              image: null,
              index: 1,
              globalIndex: 0,
              section: {
                id: 942533,
                name: 'Promoción',
                index: 0,
                integrationCode: '',
                integrationName: 'PROMO'
              }
            },
            optionGroups: [
              {
                id: 4529523,
                name: 'Helado pote 1 kg',
                index: 0,
                integrationCode: '64',
                integrationName: '',
                options: [
                  {
                    id: 30122419,
                    name: 'Capuccino granizado',
                    index: 2,
                    integrationCode: '99999',
                    integrationName: '',
                    amount: 0,
                    modifiesPrice: false,
                    quantity: 4
                  }
                ]
              },
              {
                id: 4529514,
                name: 'Familiar',
                index: 1,
                integrationCode: '99999',
                integrationName: '',
                options: [
                  {
                    id: 30122351,
                    name: ' Chocolate, Vainilla y Dulce de Leche Granizado',
                    index: 0,
                    integrationCode: '13',
                    integrationName: '',
                    amount: 0,
                    modifiesPrice: false,
                    quantity: 1
                  }
                ]
              },
              {
                id: 4529515,
                name: 'Tentacion',
                index: 2,
                integrationCode: '99999',
                integrationName: '',
                options: [
                  {
                    id: 30122352,
                    name: ' Chocolate',
                    index: 0,
                    integrationCode: '14',
                    integrationName: '',
                    amount: 0,
                    modifiesPrice: false,
                    quantity: 1
                  }
                ]
              }
            ]
          }
        ],
        receptionSystems: [
          {
            id: 138,
            code: 'integration_smartfran'
          }
        ],
        attachments: []
      };
      const encapsulated_order = {
        thirdParty: 'PedidosYa',
        internalCode: 1,
        state: 'PENDING',
        orderId: '133290240',
        branchId: 1,
        order: promotionOrder
      };
      const promotion_news = {
        order: {
          id: 134213514,
          platformId: 1,
          originalId: 134213514,
          displayId: 134213514,
          statusId: 1,
          orderTime: '2019-12-07T15:20:24Z',
          deliveryTime: '2019-12-07T15:57:24Z',
          pickupOnShop: false,
          pickupDateOnShop: null,
          preOrder: false,
          observations: '',
          ownDelivery: true,
          customer: {
            id: 15233746,
            name: 'Alain Kraupl',
            address: 'Obispo trejo 1000 esquina arasda',
            phone: '1130765437',
            email: 'alain.kraupl@ross.com.ar',
            dni: '36095544'
          },
          details: [
            {
              productId: 8740033,
              count: 1,
              price: 600,
              promo: 2,
              groupId: 1,
              discount: 0,
              description: 'Promo - Helado 1 kg + Familiar + Tentación',
              sku: '10001',
              note: ''
            },
            {
              productId: 4529523,
              promo: 1,
              groupId: 1,
              description: 'Helado pote 1 kg',
              sku: '64',
              optionalText: ' Capuccino granizado X 4'
            },
            {
              count: 1,
              productId: 4529514,
              promo: 1,
              groupId: 1,
              description: 'Familiar',
              sku: '13',
              optionalText: ' Chocolate, Vainilla y Dulce de Leche Granizado'
            },
            {
              count: 1,
              productId: 4529515,
              promo: 1,
              groupId: 1,
              description: 'Tentacion',
              sku: '14',
              optionalText: ' Chocolate'
            }
          ],
          payment: {
            typeId: 3,
            online: false,
            shipping: 50,
            discount: 0,
            voucher: '',
            subtotal: 650,
            currency: '$',
            remaining: 0,
            partial: 650,
            note: ''
          },
          driver: null,
          totalAmount: 650
        },
        extraData: {
          branch: 'Surcusal 19',
          chain: 'Grido',
          client: 'Perez Juan',
          platform: 'PedidosYa',
          region: 'Noreste'
        },
        viewed: null,
        typeId: 1,
        branchId: 1
      };

      let return_new = await pedidosYa.newsFromOrders(
        encapsulated_order,
        platform,
        newsCod,
        stateCod,
        branch
      );
      expect(return_new).to.eql(promotion_news);
    });
  });

  describe('fn(): retriveMinimunData()', function () {
    it('should return minium data of the order.', function () {
      expect(pedidosYa.retriveMinimunData(order)).to.eql({
        branchReference: '19',
        posId: 133290240,
        originalId: '133290240',
        displayId: '133290240'
      });
    });
  });
});
