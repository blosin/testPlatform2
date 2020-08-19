const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../../src/config/logger';
import ReceiveStrategy from '../../../../../../src/platforms/management/strategies/orderStrategy/receiveStrategy';
import NewsTypeSingleton from '../../../../../../src/utils/newsType';
import NewsStateSingleton from '../../../../../../src/utils/newsState';

let sandbox = sinon.createSandbox();
const newsSaved = {
    "order": {
        "id": 134177935,
        "platformId": 1,
        "statusId": 1,
        "orderTime": "2019-11-30T13:34:00Z",
        "deliveryTime": "2019-11-30T14:11:00Z",
        "pickupOnShop": false,
        "pickupDateOnShop": null,
        "preOrder": false,
        "observations": "",
        "ownDelivery": true,
        "customer": {
            "id": 15233746,
            "name": "Alain Kraupl",
            "address": "Obispo trejo 1000 esquina arasda",
            "phone": "1130765437"
        },
        "details": [
            {
                "productId": 8739989,
                "count": 1,
                "price": 220,
                "promo": 0,
                "groupId": "0",
                "discount": 0,
                "description": "Crocantino (10 porciones)",
                "note": "",
                "sku": "60",
                "optionalText": ""
            }
        ],
        "payment": {
            "typeId": 2,
            "online": true,
            "shipping": 50,
            "discount": 0,
            "voucher": "",
            "subtotal": 270,
            "currency": "$",
            "remaining": 50,
            "partial": 270,
            "note": ""
        },
        "driver": null,
        "totalAmount": 270
    },
    "typeId": 13,
    "traces": [],
    "branchId": 1,
    _id: "5de16132d5518900104723e8"
};

describe('Receive Strategy.', function () {
    const newToSet = {
        typeId: 10,
        typeIdPrev: 1,
        id: "5d2dcea6c7632d4a9bfbe0e9",
    };
    const typeId = 10;
    const typeCod = 'receive_ord';
    const statusId = 1;
    const entity = 'BRANCH';
    const trace = {
        entity: entity,
        update: {
            typeId: typeId,
            'orderStatusId': statusId
        }
    }
    let idByCodTypeStub;

    beforeEach(() => {
        sandbox.stub(logger, 'error');
        idByCodTypeStub = sandbox.stub(NewsTypeSingleton, 'idByCod')
            .withArgs(typeCod)
            .returns(typeId);
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('fn(): findTrace()', function () {
        it('should find the trace correctly', async function () {
            const savedNew = { traces: [trace] };

            const newsType = new ReceiveStrategy(newToSet);
            newsType.entity = entity;
            newsType.savedNew = savedNew;
            const res = newsType.findTrace();

            expect(res).to.be.undefined;
        });
    });

    describe('fn(): manageNewType()', function () {
        let idByCodTypeStub,
            idByCodStateStub,
            findNewStub,
            createObjectStub,
            updateNewStub;

        beforeEach(() => {
            const findQueryMock = { _id: '5de16132d5518900104723e8' };
            const updateQueryMock = {
                typeId: 0,
                'order.statusId': 0,
                $push: { traces: [] }
            };
            const optionsMock = {};
            createObjectStub = sandbox.stub(ReceiveStrategy.prototype, 'createObjectsUpdate')
                .withArgs()
                .returns({ updateQuery: updateQueryMock, findQuery: findQueryMock, options: optionsMock });
            updateNewStub = sandbox.stub(ReceiveStrategy.prototype, 'updateNew')
                .withArgs()
                .resolves();

        });
        afterEach(() => {
            sandbox.restore();
        });

        it('should receive the order correctly', async function () {
            findNewStub = sandbox.stub(ReceiveStrategy.prototype, 'findNew')
                .withArgs(newToSet.id)
                .resolves(newsSaved);
            const strategy = new ReceiveStrategy(newToSet);
            strategy.trace = trace;
            strategy.platform = {
                receiveOrder: () => { Promise.resolve() }
            };
            const res = await strategy.manageNewType(newToSet);

            expect(res).to.be.undefined;

            expect(findNewStub.callCount).to.equal(1);
            expect(findNewStub.calledWith(newToSet.id)).to.be.true;

            expect(createObjectStub.callCount).to.equal(1);
            expect(createObjectStub.calledWith()).to.be.true;

            expect(updateNewStub.callCount).to.equal(1);
            expect(updateNewStub.calledWith()).to.be.true;
        });

        it('should fail the validation transition', async function () {
            findNewStub = sandbox.stub(ReceiveStrategy.prototype, 'findNew')
                .withArgs(newToSet.id)
                .resolves(newsSaved);
            const strategy = new ReceiveStrategy(newToSet);
            strategy.trace = trace;
            strategy.platform = {
                receiveOrder: () => { Promise.resolve() }
            };
            try {
                const res = await strategy.manageNewType(newToSet);

            } catch (error) {
                expect(error.codeError).to.eql({ code: 1002, name: 'Processing POST /branches/set-news' });
                expect(findNewStub.callCount).to.equal(1);
                expect(findNewStub.calledWith(newToSet.id)).to.be.true;

                expect(createObjectStub.callCount).to.equal(1);
                expect(createObjectStub.calledWith()).to.be.true;

                expect(updateNewStub.callCount).to.equal(1);
                expect(updateNewStub.calledWith()).to.be.true;
            }
        });
    });
});

