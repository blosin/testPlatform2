const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../src/config/logger';

import SetNews from '../../../../../src/platforms/management/strategies/set-news';
import NewsStateSingleton from '../../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../../src/utils/newsType';
import * as ReceiveStrategy from '../../../../../src/platforms/management/strategies/orderStrategy/receiveStrategy';

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
      url: 'https:www.pedidosya.com.ar',
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
          'https:smartfran.s3-us-west-2.amazonaws.com/SmartFranPedidos_1.0.17.zip',
        releaseDate: '2019-10-23T19:00:00.000Z',
        installedVersion: '1.0.1019',
        installedDate: '2019-09-23T19:44:20.562Z'
      },
      notificator: {
        actualVersion: '1.0.1016',
        releaseUrl:
          'https:smartfran.s3-us-west-2.amazonaws.com/SmartFranAlertas_1.0.1016.zip',
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

class MockStrategy {
  //  The fake *Strategy
  constructor(params) {}
}
describe('SET-NEWS Strategy.', function () {
  let sandbox = sinon.createSandbox();
  let setNews;
  let token = 'dasdas';
  let idByCodStub;
  beforeEach(() => {
    sandbox.stub(logger, 'error');
    setNews = new SetNews(token);
    idByCodStub = sandbox.stub(NewsTypeSingleton, 'idByCod');
  });
  afterEach(() => {
    sandbox.restore();
  });
  /*describe('fn(): setNews()', function () {
    it('Receive', async function () {
      const typeId = 11;
      const typeCod = 'receive_ord';
      const newToSet = {
        typeId: 11,
        id: '5d2dcea6c7632d4a9bfbe0e9',
        typeIdPrev: 1
      };

      sandbox.stub(ReceiveStrategy, 'constructor').callsFake((args) => {
        return new MockStrategy(args);
      });
     

      idByCodStub.withArgs(typeCod).returns(typeId);

      const res = await setNews.setNews(newToSet);
         expect(res).to.be.undefined;

      expect(idByCodStub.callCount).to.equal(1);
      expect( idByCodStub.calledWith(cod)).to.be.true;
    });
  });*/
});
