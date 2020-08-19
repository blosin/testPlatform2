let rappi = require('../../../../src/platforms/interfaces/rappi');
import NewsStateSingleton from '../../../../src/utils/newsState';
import NewsTypeSingleton from '../../../../src/utils/newsType';
const sinon = require('sinon');
let sandbox;

var expect = require('chai').expect;

describe('RAPPI - Test interface platform', function () {
    beforeEach(() => {
        sandbox = sinon.createSandbox();

    });
    afterEach(() => {
        sandbox.restore();
    });
    const order = {
        "order": {
            "id": "259777",
            "totalValue": 210,
            "createdAt": "2020-02-08 10:32:46",
            "items": [
                {
                    "sku": "46",
                    "name": "Grido cremoso (20 porciones)",
                    "price": "210",
                    "type": "product",
                    "subtype": "Palitos y bombones",
                    "comments": "",
                    "toppings": [
                        {
                            "sku": "46",
                            "name": "Crema americana",
                            "price": "0",
                            "type": "topping",
                            "subtype": "Grido cremoso (20 porciones)",
                            "comments": null,
                            "toppingCategoryId": 34144,
                            "units": 1
                        }
                    ],
                    "units": 1
                }
            ]
        },
        "client": {
            "id": "1",
            "firstName": "Rappi",
            "lastName": "Rappi",
            "email": "integration@rappi.com",
            "phone": "09122018",
            "address": "cra 93 # 19"
        },
        "store": {
            "id": "115001",
            "name": "Grido - Caballito (MP)"
        }
    };

    const encapsulated_order = {
        "thirdParty": "Rappi",
        "internalCode": 2,
        "state": "PENDING",
        "orderId": "259777",
        "branchId": 2,
        "order": order
    }

    const parsed_new = {
        "viewed": null,
        "typeId": 1,
        "branchId": 2,
        "extraData": {
            "branch": "Surcusal 19",
            "chain": "Grido",
            "client": "Perez Juan",
            "platform": "Rappi",
            "region": "Noreste"
        },
        "order": {
            "id": 259777,
            "originalId": 259777,
            "platformId": 2,
            "statusId": 1,
            "orderTime": "2020-02-08 10:32:46",
            "deliveryTime": null,
            "pickupOnShop": false,
            "pickupDateOnShop": null,
            "preOrder": false,
            "statusId": 1,
            "observations": "",
            "ownDelivery": false,
            "customer": {
                "name": "Rappi Rappi",
                "address": "cra 93 # 19",
                "phone": "09122018",
                "dni": null,
                "email": "integration@rappi.com",
                "id": "1",
            },
            "details": [
                {
                    "productId": 43,
                    "count": 1,
                    "price": 260,
                    "promo": 0,
                    "discount": 0,
                    "optionalText": "",
                    "groupId": "0",
                    "description": "Bombn escocs (8 porciones)",
                    "sku": "43",
                    "note": ""
                }
            ],
            "payment": {
                "online": true,
                "shipping": 0,
                "discount": 0,
                "voucher": "",
                "subtotal": 210,
                "typeId": 2,
                "currency": "$",
                "remaining": 0,
                "partial": 0,
                "note": ""
            },
            "driver": null,
            "details": [
                {
                    "productId": 46,
                    "sku": "46",
                    "count": 1,
                    "price": 210,
                    "promo": 0,
                    "groupId": "0",
                    "discount": 0,
                    "description": "Grido cremoso (20 porciones)",
                    "note": "",
                    "optionalText": "Crema americana"
                }
            ],
            "totalAmount": 210
        },
        "extraData": {
            "branch": "Surcusal 19",
            "chain": "Grido",
            "client": "Perez Juan",
            "platform": "Rappi",
            "region": "Noreste"
        }
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

    describe('generate new of an order', function () {
        context('- with correct arguments', function () {
            it('- should return new rappi order parsed.', async function () {
                const platform = {
                    "name": "Rappi",
                    "thirdPartyId": "-",
                    "thirdPartySecret": "-",
                    "internalCode": 2,
                    "credentials": {
                        "token": "{{rappiToken}}"
                    },
                    "createdAt": "2019-09-22T19:43:20.975Z",
                    "updatedAt": "2019-09-22T19:43:20.975Z",
                    "_id": "5d87ced89b0634004fd83c6c"
                }
                const stateCod = 'pend';
                const newsCod = 'new_ord';
                sandbox.stub(NewsStateSingleton, 'idByCod').returns(1);
                sandbox.stub(NewsTypeSingleton, 'idByCod').returns(1);
                let return_new = await rappi.newsFromOrders(encapsulated_order, platform, newsCod, stateCod, branch);

                expect(return_new).to.eql(parsed_new);
            });
        });
    });

    describe('retrive minimun data order', function () {
        context('- order with platform format', function () {
            it('- should return minium data of the order.', function () {
                expect(rappi.retriveMinimunData(order)).to.eql({ branchReference: "115001", id: "259777" });
            });
        });
    });
});