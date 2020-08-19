const expect = require('chai').expect;
import sinon from 'sinon';
import axios from 'axios';
import platformModel from '../../../../../src/models/platform';
import logger from '../../../../../src/config/logger';

import Glovo from '../../../../../src/platforms/management/platform/glovo';
let sandbox;
const orders =
{
    "order_id": "460901786",
    "store_id": "15",
    "order_time": "2018-06-08 14:24:53",
    "estimated_pickup_time": "2018-06-08 14:45:44",
    "payment_method": "CASH",
    "currency": "ARS",
    "courier": {
        "name": "Flash",
        "phone_number": "+34666666666"
    },
    "customer": {
        "name": "John Doe",
        "phone_number": "3510000000",
        "hash": "11111111-2222-3333-4444-555555555555",
        "invoicing_details": {
            "company_name": "Acme Inc.",
            "company_address": "42 Wallaby Way, Sydney",
            "tax_id": "B12341234"
        }
    },
    "order_code": "BA7DWBUL",
    "allergy_info": "I am allergic to tomato",
    "estimated_total_price": 3080,
    "delivery_fee": null,
    "minimum_basket_surcharge": null,
    "customer_cash_payment_amount": 5000,
    "products": [
        {
            "quantity": 2,
            "price": 1234,
            "name": "Helado 1k",
            "id": "1",
            "attributes": [
                {
                    "quantity": 1,
                    "id": "at1",
                    "name": "Chocolate",
                    "price": 3000
                },
                {
                    "quantity": 1,
                    "id": "at2",
                    "name": "Limon",
                    "price": 2000
                }
            ]
        }
    ],
    "delivery_address": {
        "label": "John Doe Address",
        "latitude": 41.3971955,
        "longitude": 2.2001737
    },
    "bundled_orders": [
        "order-id-1",
        "order-id-2"
    ],
    "pick_up_code": "433"
};

const order_cancel = {
    "order_id": 460901786,
    "cancel_reason": "STORE_ERROR",
    "payment_strategy": "PAY_PRODUCTS"
}

const branches = [{
    "smartfran_sw": {
        "agent": {
            "actualVersion": "1.0.1017",
            "releaseUrl": "https://smartfran.s3-us-west-2.amazonaws.com/SmartFranPedidos_1.0.17.zip",
            "releaseDate": "2019-10-23T19:00:00.000Z",
            "installedVersion": "1.0.1019",
            "installedDate": "2019-09-23T19:44:20.562Z"
        },
        "notificator": {
            "actualVersion": "1.0.1016",
            "releaseUrl": "https://smartfran.s3-us-west-2.amazonaws.com/SmartFranAlertas_1.0.1016.zip",
            "releaseDate": "2019-10-28T19:00:00.000Z",
            "installedVersion": "1.10.22",
            "installedDate": "2019-09-23T19:44:20.562Z"
        }
    },
    "_id": "5d8d597141996d0081a70997",
    "name": "Surcusal 15",
    "branchId": 15,
    "branchSecret": "15",
    "address": "Calle s/n",
    "branchTimeout": "20",
    "platforms": [
        {
            "progClosed": [],
            "_id": "5d87d35ec50f1f0068e92bc2",
            "platform": "5d87cea59b0634004fd83c6b",
            "branchReference": 15,
            "branchIdReference": 62702,
            "lastGetNews": "2019-11-01T18:19:55.436Z"
        },
        {
            "progClosed": [],
            "_id": "5d87d35ec50f1f0068e92bc1",
            "platform": "5d87ced89b0634004fd83c6c",
            "branchReference": 115005,
            "lastGetNews": "2019-11-01T18:19:55.436Z"
        },
        {
            "progClosed": [],
            "_id": "5d87d35ec50f1f0068e92bc0",
            "platform": "5d87cf149b0634004fd83c6d",
            "branchReference": 15,
            "lastGetNews": "2019-11-01T18:19:55.436Z"
        },
        {
            "progClosed": [],
            "_id": "5d87d35ec50f1f0068e92bbf",
            "platform": "5d87cf649b0634004fd83c6e",
            "branchReference": 211,
            "lastGetNews": "2019-11-01T18:19:55.436Z"
        }
    ],
    "createdAt": "2019-09-27T00:36:01.270Z",
    "updatedAt": "2019-11-01T18:19:55.437Z",
    "tzo": -3
}];
const platformGlovo = {
    "name": "Glovo",
    "thirdPartyId": "-",
    "internalCode": 9,
    "credentials": {
        "type": "push",
        "data": {
            "token": "8163f4b0-74be-4286-9152-67d922bdaeb8",
        }
    },
    "createdAt": "2019-09-22T19:43:20.975Z",
    "updatedAt": "2019-09-22T19:43:20.975Z",
    "id": "5d87ced89b0634004fd83c6c"
};

const newOrders = [{
    internalCode: platformGlovo.internalCode,
    state: 'PENDING',
    orderId: orders.order_id,
    branchId: branches[0].branchId,
    order: orders
}];

describe('GLOVO management.', function () {
    let stubLoggerFn;
    beforeEach(() => {
        stubLoggerFn = sinon.stub(logger, 'error');
        sandbox = sinon.createSandbox();
        sandbox.stub(Glovo.prototype, 'updateLastContact').returns();
    });
    afterEach(() => {
        sandbox.restore();
        stubLoggerFn.restore();
    });

    describe('fn(): init()', function () {
        it('should init correctly', async function () {
            const glovo = new Glovo();
            await glovo.init();
        });
    });

    describe('fn(): getOrders()', function () {
        it('should create an order correctly', async function () {
            const glovo = new Glovo();
            sandbox.stub(axios, 'post').resolves({ data: orders });
            const saveNewOrdersStub = sandbox.stub(glovo, 'saveGlovoOrder').resolves(newOrders);
            let saved = await glovo.saveGlovoOrder(orders, platformGlovo.credentials.data.token);
            expect(saved).to.eql(newOrders);
            expect(saveNewOrdersStub.callCount).to.equal(1);
            expect(saveNewOrdersStub.calledWith(orders, platformGlovo.credentials.data.token)).to.be.true;
        });

        it('should not create an order correctly', async function () {
            const glovo = new Glovo();
            const err = 'Error';
            sandbox.stub(axios, 'post').rejects(err);
            const saveNewOrdersStub = sandbox.stub(glovo, 'saveGlovoOrder')
                .resolves(newOrders);
            try {
                await glovo.saveGlovoOrder(orders, platformGlovo.credentials.data.token);
            } catch (error) {
                expect(error.error).to.eql(err);
                expect(saveNewOrdersStub.callCount).to.equal(0);
            }
        });
    });
    describe('fn(): branchRejectOrder()', function () {
        it('should reject order correctly', async function () {
            const glovo = new Glovo();
            sandbox.stub(axios, 'post').resolves({ data: orders });
            const saveNewOrdersStub = sandbox.stub(glovo, 'saveGlovoOrder').resolves(newOrders);
            let saved = await glovo.saveGlovoOrder(order_cancel, platformGlovo.credentials.data.token);
            expect(saved).to.eql(newOrders);
            expect(saveNewOrdersStub.callCount).to.equal(1);
            expect(saveNewOrdersStub.calledWith(order_cancel, platformGlovo.credentials.data.token)).to.be.true;
        });
        it('should not reject an order correctly', async function () {
            const glovo = new Glovo();
            const err = 'Error';
            sandbox.stub(axios, 'post').rejects(err);
            const saveNewOrdersStub = sandbox.stub(glovo, 'saveGlovoOrder')
                .resolves(newOrders);
            try {
                await glovo.saveGlovoOrder(order_cancel, platformGlovo.credentials.data.token);
            } catch (error) {
                expect(error.error).to.eql(err);
                expect(saveNewOrdersStub.callCount).to.equal(0);
            }
        });
    });
});