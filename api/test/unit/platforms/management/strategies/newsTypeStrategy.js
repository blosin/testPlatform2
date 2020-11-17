const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../src/config/logger';

import news from '../../../../../src/models/news';

import PlatformFactory from '../../../../../src/platforms/management/factory_platform';
import PlatformsSingleton from '../../../../../src/utils/platforms';
import NewsTypeStrategy from '../../../../../src/platforms/management/strategies/newsTypeStrategy';

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
const newsSaved = [
  {
    order: {
      id: 134177935,
      platformId: 1,
      statusId: 1,
      orderTime: '2019-11-30T13:34:00Z',
      deliveryTime: '2019-11-30T14:11:00Z',
      pickupOnShop: false,
      pickupDateOnShop: null,
      preOrder: false,
      observations: '',
      ownDelivery: true,
      customer: {
        id: 15233746,
        name: 'Alain Kraupl',
        address: 'Obispo trejo 1000 esquina arasda',
        phone: '1130765437'
      },
      details: [
        {
          productId: 8739989,
          count: 1,
          price: 220,
          promo: 0,
          groupId: '0',
          discount: 0,
          description: 'Crocantino (10 porciones)',
          note: '',
          sku: '60',
          optionalText: ''
        }
      ],
      payment: {
        typeId: 2,
        online: true,
        shipping: 50,
        discount: 0,
        voucher: '',
        subtotal: 270,
        currency: '$',
        remaining: 50,
        partial: 270,
        note: ''
      },
      driver: null,
      totalAmount: 270
    },
    typeId: 13,
    traces: [],
    branchId: 1,
    _id: '5de16132d5518900104723e8'
  }
];

let sandbox = sinon.createSandbox();
describe('NEWS-TYPE Strategy.', function () {
  const newToSet = {
    typeId: 11,
    id: '5d2dcea6c7632d4a9bfbe0e9'
  };
  const entity = 'BRANCH';
  const typeId = 11;
  const statusId = 10;
  const trace = {
    entity: entity,
    update: {
      isValid: undefined,
      typeId: typeId,
      orderStatusId: statusId,
      platformResult: { id: '5d2dcea6c7632d4a9bfbe0e9', typeId },
      updatedAt: new Date()
    }
  };

  const newUpdated = [
    {
      order: {
        id: 134177935,
        platformId: 1,
        statusId: 1,
        orderTime: '2019-11-30T13:34:00Z',
        deliveryTime: '2019-11-30T14:11:00Z',
        pickupOnShop: false,
        pickupDateOnShop: null,
        preOrder: false,
        observations: '',
        ownDelivery: true,
        customer: {
          id: 15233746,
          name: 'Alain Kraupl',
          address: 'Obispo trejo 1000 esquina arasda',
          phone: '1130765437'
        },
        details: [
          {
            productId: 8739989,
            count: 1,
            price: 220,
            promo: 0,
            groupId: '0',
            discount: 0,
            description: 'Crocantino (10 porciones)',
            note: '',
            sku: '60',
            optionalText: ''
          }
        ],
        payment: {
          typeId: 2,
          online: true,
          shipping: 50,
          discount: 0,
          voucher: '',
          subtotal: 270,
          currency: '$',
          remaining: 50,
          partial: 270,
          note: ''
        },
        driver: null,
        totalAmount: 270
      },
      typeId: 13,
      traces: trace,
      branchId: 1,
      _id: '5de16132d5518900104723e8'
    }
  ];

  beforeEach(() => {
    sandbox.stub(logger, 'error');
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('fn(): createTrace()', function () {
    it('should create the trace correctly', async function () {
      const newsType = new NewsTypeStrategy(newToSet);
      newsType.typeId = typeId;
      newsType.statusId = statusId;
      newsType.entity = entity;
      newsType.createTrace(newToSet);
      trace.update.updatedAt = newsType.trace.update.updatedAt;
      expect(newsType.trace).to.eql(trace);
    });
  });

  describe('fn(): createObjectsUpdate()', function () {
    it('should create the trace correctly', async function () {
      sandbox.stub(NewsTypeStrategy.prototype, 'createTrace');
      const savedNew = { _id: '5d2dcea6c7632d4a9bfbe0e9' };

      const newsType = new NewsTypeStrategy(newToSet);
      newsType.typeId = typeId;
      newsType.statusId = statusId;
      newsType.savedNew = savedNew;
      newsType.trace = trace;

      const { findQuery, updateQuery, options } = newsType.createObjectsUpdate(
        newToSet,
        true
      );

      const findQueryMock = savedNew._id;
      const updateQueryMock = {
        typeId: typeId,
        'order.statusId': statusId,
        $push: { traces: trace }
      };
      const optionsMock = { new: true };

      expect(findQuery).to.eql(findQueryMock);
      expect(updateQuery).to.eql(updateQueryMock);
      expect(options).to.eql(optionsMock);
    });
  });

  describe('fn(): createPlatform()', function () {
    it('should create the platform correctly', async function () {
      const getByCodStub = sandbox
        .stub(PlatformsSingleton, 'getByCod')
        .withArgs(platform.internalCode)
        .returns(platform);

      const createPlatformStub = sandbox
        .stub(PlatformFactory.prototype, 'createPlatform')
        .returns(platform);

      const newsType = new NewsTypeStrategy(newToSet);

      newsType.createPlatform(platform.internalCode);

      expect(newsType.platform).to.eql(platform);

      expect(getByCodStub.callCount).to.equal(1);
      expect(getByCodStub.calledWith(platform.internalCode)).to.be.true;

      expect(createPlatformStub.callCount).to.equal(1);
      expect(createPlatformStub.calledWith()).to.be.true;
    });
  });

  describe('fn(): findTrace()', function () {
    it('should find the trace correctly', async function () {
      const savedNew = { traces: [trace] };

      const newsType = new NewsTypeStrategy(newToSet);

      newsType.savedNew = savedNew;
      newsType.entity = 'BRANCH';
      const res = newsType.findTrace(trace.update.typeId);

      expect(res).to.eql(trace);
    });
  });

  describe('fn(): updateNew()', async function () {
    it('should update the new correctly', async function () {
      sandbox.stub(news, 'findByIdAndUpdate').returns(newUpdated);

      const newsType = new NewsTypeStrategy(newToSet);
      newsType.findQuery = '5d2dcea6c7632d4a9bfbe0e9';
      newsType.updateQuery = {
        typeId: typeId,
        'order.statusId': statusId,
        $push: { traces: trace }
      };

      const res = await newsType.updateNew(
        newsType.findQuery,
        newsType.updateQuerry,
        { new: true }
      );
      expect(res).to.eql(newUpdated);
    });

    it('should no update the new', async function () {
      sandbox.stub(news, 'findByIdAndUpdate').returns({});
      sandbox.stub(NewsTypeStrategy.prototype, 'createPlatform');

      const newsType = new NewsTypeStrategy(newToSet);
      try {
        const res = await newsType.updateNew();
      } catch (error) {
        expect(error.toJSON()).to.eql({
          uuid: '0000',
          message: 'No se pudo actualizar la novedad.',
          error: { code: 2002, description: 'Executing findById query.' }
        });
      }
    });

    it('should fail updating the new', async function () {
      sandbox
        .stub(news, 'findByIdAndUpdate')
        .returns(() => Promise.reject('error'));
      sandbox.stub(NewsTypeStrategy.prototype, 'createPlatform');

      const newsType = new NewsTypeStrategy(newToSet);
      try {
        const res = await newsType.updateNew();
      } catch (error) {
        expect(error.toJSON()).to.eql({
          uuid: '0000',
          message: 'No se pudo actualizar la novedad.',
          error: { code: 2002, description: 'Executing findById query.' }
        });
      }
    });
  });

  describe('fn(): findNew()', async function () {
    it('should find the new correctly', async function () {
      let savedNew = newsSaved[0];
      savedNew.pop = () => newsSaved[0];
      sandbox.stub(news, 'aggregate').resolves(savedNew);
      sandbox.stub(NewsTypeStrategy.prototype, 'createPlatform');

      let newsType = new NewsTypeStrategy(newToSet);
      const res = await newsType.findNew(platform.internalCode);

      expect(res).to.eql(newsSaved[0]);
    });

    it('should fail finding the new', async function () {
      let savedNew = newsSaved[0];
      savedNew.pop = () => newsSaved[0];
      sandbox.stub(news, 'aggregate').rejects('Error');

      sandbox.stub(NewsTypeStrategy.prototype, 'createPlatform');

      const newsType = new NewsTypeStrategy(newToSet);
      try {
        const res = await newsType.findNew(platform.internalCode);
      } catch (error) {
        expect(error.metadata.error).to.eql('Error');
      }
    });
  });
});
