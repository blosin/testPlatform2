const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../../src/config/logger';
import ViewStrategy from '../../../../../../src/platforms/management/strategies/orderStrategy/viewStrategy';
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

describe('View Strategy.', function () {
    const newToSet = {
        typeId: 11,
        id: "5d2dcea6c7632d4a9bfbe0e9",
    };
    beforeEach(() => {
        sandbox.stub(logger, 'error');
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('fn(): manageNewType()', function () {
        let idByCodTypeStub,
            idByCodStateStub,
            findNewStub,
            validateStub,
            createObjectStub,
            updateNewStub;
        const typeId = 11;
        const typeCod = 'view_ord';
        const stateId = 11;
        const stateCod = 'view';
        const newToSet = {
            typeId: 11,
            id: "5d2dcea6c7632d4a9bfbe0e9",
        };
        const savedNew = {
            order: { id: 1 }
        };
        beforeEach(() => {
            idByCodTypeStub = sandbox.stub(NewsTypeSingleton, 'idByCod')
                .withArgs(typeCod)
                .returns(typeId);
            idByCodStateStub = sandbox.stub(NewsStateSingleton, 'idByCod')
                .withArgs(stateCod)
                .returns(stateId);
            const findQueryMock = { _id: '5de16132d5518900104723e8' };
            const updateQueryMock = {
                typeId: 0,
                'order.statusId': 0,
                $push: { traces: [] }
            };
            const optionsMock = {};
            createObjectStub = sandbox.stub(ViewStrategy.prototype, 'createObjectsUpdate')
                .withArgs()
                .returns({ updateQuery: updateQueryMock, findQuery: findQueryMock, options: optionsMock });
            updateNewStub = sandbox.stub(ViewStrategy.prototype, 'updateNew')
                .withArgs()
                .resolves();
        });
        afterEach(() => {
            sandbox.restore();
        });

        it('should view the order correctly', async function () {
            validateStub = sandbox.stub(ViewStrategy.prototype, 'validateTransition')
                .withArgs()
                .returns(true);
            findNewStub = sandbox.stub(ViewStrategy.prototype, 'findNew')
                .withArgs(newToSet.id)
                .resolves(newsSaved);
            const strategy = new ViewStrategy(newToSet);
            strategy.platform = {
                viewOrder: () => { Promise.resolve() }
            };
            const res = await strategy.manageNewType(newToSet);

            expect(res).to.be.undefined;

            expect(idByCodTypeStub.callCount).to.equal(1);
            expect(idByCodTypeStub.calledWith(typeCod)).to.be.true;

            expect(idByCodStateStub.callCount).to.equal(1);
            expect(idByCodStateStub.calledWith(stateCod)).to.be.true;

            expect(findNewStub.callCount).to.equal(1);
            expect(findNewStub.calledWith(newToSet.id)).to.be.true;

            expect(validateStub.callCount).to.equal(1);
            expect(validateStub.calledWith()).to.be.true;

            expect(createObjectStub.callCount).to.equal(1);
            expect(createObjectStub.calledWith()).to.be.true;

            expect(updateNewStub.callCount).to.equal(1);
            expect(updateNewStub.calledWith()).to.be.true;
        });

        it('should fail the validation transition', async function () {
            validateStub = sandbox.stub(ViewStrategy.prototype, 'validateTransition')
                .withArgs()
                .returns(false);
            findNewStub = sandbox.stub(ViewStrategy.prototype, 'findNew')
                .withArgs(newToSet.id)
                .resolves(newsSaved);
            const strategy = new ViewStrategy(newToSet);
            strategy.platform = {
                viewOrder: () => { Promise.resolve() }
            };
            try {
                const res = await strategy.manageNewType(newToSet);

            } catch (error) {
                expect(error.codeError).to.eql({ code: 1002, name: 'Processing POST /branches/set-news' });

                expect(idByCodTypeStub.callCount).to.equal(1);
                expect(idByCodTypeStub.calledWith(typeCod)).to.be.true;

                expect(idByCodStateStub.callCount).to.equal(1);
                expect(idByCodStateStub.calledWith(stateCod)).to.be.true;

                expect(findNewStub.callCount).to.equal(1);
                expect(findNewStub.calledWith(newToSet.id)).to.be.true;

                expect(validateStub.callCount).to.equal(1);
                expect(validateStub.calledWith()).to.be.true;

                expect(createObjectStub.callCount).to.equal(1);
                expect(createObjectStub.calledWith()).to.be.true;

                expect(updateNewStub.callCount).to.equal(1);
                expect(updateNewStub.calledWith()).to.be.true;
            }
        });
    });
});

