const expect = require('chai').expect;
import sinon from 'sinon';
import logger from '../../../../../src/config/logger';

import branchModel from '../../../../../src/models/branch';
import orderModel from '../../../../../src/models/order';
import PedidosYa from '../../../../../src/platforms/management/platform/pedidosYa';
import NewsStateSingleton from '../../../../../src/utils/newsState';
import NewsTypesSingleton from '../../../../../src/utils/newsType';
import RejectedMessagesSingleton from '../../../../../src/utils/rejectedMessages';

let sandbox;
const order = {
    "id": 133290213,
    "code": "ACH65E8D",
    "state": "PENDING",
    "pickup": false,
    "notes": "",
    "timestamp": 1572349248336,
    "registeredDate": "2019-10-29T08:40:46Z",
    "pickupDate": null,
    "deliveryDate": "2019-10-29T09:17:46Z",
    "responseDate": null,
    "dispatchDate": null,
    "whiteLabel": null,
    "application": "WEB",
    "pushed": false,
    "express": false,
    "preOrder": false,
    "logistics": false,
    "integrationCode": null,
    "preparationTime": null,
    "preparationBuffer": null,
    "portal": {
        "id": 1,
        "name": "Pedidos Ya"
    },
    "user": {
        "id": 15233746,
        "name": "Alain",
        "lastName": "Kraupl",
        "email": "alain.kraupl@ross.com.ar",
        "identityCard": "36095544",
        "isNew": false,
        "type": "WEB_USER",
        "orderCount": 15,
        "platform": "PEDIDOS_YA",
        "company": {
            "name": "",
            "document": ""
        }
    },
    "address": {
        "description": "Obispo trejo 1000 esquina arasda",
        "coordinates": "-31.427,-64.1903",
        "phone": "1130765437",
        "notes": "",
        "zipCode": null,
        "area": "Nueva Córdoba",
        "city": "Córdoba",
        "cityId": 137,
        "doorNumber": "1000",
        "street": "Obispo trejo",
        "corner": "arasda",
        "complement": ""
    },
    "payment": {
        "id": 87,
        "notes": "",
        "total": 220,
        "shipping": 50,
        "shippingNoDiscount": 50,
        "amountNoDiscount": 220,
        "paymentAmount": 270,
        "online": true,
        "currencySymbol": "$",
        "discount": 0,
        "discountType": "NONE",
        "discountNotes": "",
        "stampsDiscount": 0,
        "card": {
            "brand": "CABAL",
            "operationType": "CREDIT",
            "issuer": null
        },
        "method": "Pago online",
        "tax": 0,
        "subtotal": 270
    },
    "discounts": [],
    "restaurant": {
        "id": 62702,
        "name": "Grido Helados - Obispo Trejo",
        "integrationCode": "15",
        "integrationName": "Integración Smartfran",
        "country": {
            "id": 3,
            "name": "Argentina",
            "shortName": "ar",
            "url": "https://www.pedidosya.com.ar",
            "timeOffset": -180,
            "currencySymbol": "$",
            "culture": "es_AR"
        },
        "deliveryTime": {
            "id": 2,
            "description": null,
            "minMinutes": 30,
            "maxMinutes": 45
        }
    },
    "details": [
        {
            "id": 243661110,
            "unitPrice": 220,
            "discount": 0,
            "total": 220,
            "quantity": 1,
            "subtotal": 220,
            "notes": "",
            "product": {
                "id": 8739988,
                "integrationCode": "56",
                "integrationName": "",
                "name": "Almendrado (8 porciones)",
                "image": "942522-41d14cb4-651d-4bde-967b-38ffdd7ca4c6.jpg",
                "index": 2,
                "globalIndex": 0,
                "section": {
                    "id": 942522,
                    "name": "Postres",
                    "index": 4,
                    "integrationCode": "",
                    "integrationName": ""
                }
            },
            "optionGroups": [
                {
                    "id": 4529497,
                    "name": "Cantidad",
                    "index": 0,
                    "integrationCode": "",
                    "integrationName": "",
                    "options": [
                        {
                            "id": 30122235,
                            "name": "8 unidades",
                            "index": 0,
                            "integrationCode": "56",
                            "integrationName": "",
                            "amount": 0,
                            "modifiesPrice": false,
                            "quantity": 1
                        }
                    ]
                }
            ]
        }
    ],
    "receptionSystems": [
        {
            "id": 138,
            "code": "integration_smartfran"
        }
    ],
    "attachments": []
};

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
    "branchTimeout": 20,
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

const platform = {
    name: "PedidosYa",
    thirdPartyId: "-",
    thirdPartySecret: "-",
    internalCode: 1,
    credentials: {
        data: {
            clientId: "integration_smartfran",
            clientSecret: "a223e0a5b2",
            environment: "DEVELOPMENT"
        }
    },
    _id: "5d87cea59b0634004fd83c6b"
};

const newOrders = [{
    thirdParty: platform.name,
    internalCode: platform.internalCode,
    state: 'PENDING',
    orderId: order.id,
    branchId: branches[0].branchId,
    order: order
}];

describe('PEDIDOSYA management.', function () {
    let stubLoggerFn;
    let updateLastContactStub;
    beforeEach(() => {
        stubLoggerFn = sinon.stub(logger, 'error');
        sandbox = sinon.createSandbox();
        updateLastContactStub = sandbox.stub(PedidosYa.prototype, 'updateLastContact').returns();
    });
    afterEach(() => {
        sandbox.restore();
        stubLoggerFn.restore();
    });

    describe('fn(): init()', function () {
        it('should init correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            const getOrdersStub = sandbox.stub(PedidosYa.prototype, 'getOrders')
                .returns();
            await py.init();

            expect(getOrdersStub.callCount).to.equal(1);
            expect(getOrdersStub.calledWith()).to.be.true;
        });

        it('should failed init by no credentials', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            delete py._platform.credentials;
            const getOrdersStub = sandbox.stub(PedidosYa.prototype, 'getOrders')
                .returns();
            await py.init();

            expect(getOrdersStub.callCount).to.equal(0);
            expect(getOrdersStub.calledWith()).to.be.false;
        });
    });

    describe('fn(): initRestaurant()', function () {
        it('should init restaurant correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    initialization: () => Promise.resolve()
                }
            }

            const res = await py.initRestaurant(1);
            expect(res).to.eql();
        });

        it('should fail init restaurant correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    initialization: () => Promise.reject('Can not init')
                }
            }
            try {
                await py.initRestaurant(1);
            } catch (error) {
                expect(error.metadata.platformError).to.eql('Can not init');
            }
        });
    });

    describe('fn(): interactWithOrders()', function () {
        const stateCod = 'pend';
        const state = 'PENDING';

        const rejStateCod = 'rej';
        const rejIdState = 2;
        const rejState = 'REJECTED';
        const rejTypeCod = 'platform_rej_ord';
        const rejIdType = 4;

        const rejClosedState = 'REJECTED_CLOSED_RESTAURANT';
        const rejClosedStateCod = 'rej_closed';

        const confirmStateCod = 'confirm';
        const confirmState = 'REJECTED';

        let stateByCodStub, savedOrderStub;
        beforeEach(function () {
            savedOrderStub = sandbox.stub(orderModel, 'findOne')

            stateByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod');
            stateByCodStub
                .withArgs(stateCod)
                .returns(state);
        });

        it('should save an order order correctly', async function () {
            savedOrderStub
                .resolves(order);
            const py = new PedidosYa();
            py._platform = platform;

            const saveNewOrdersStub = sandbox.stub(PedidosYa.prototype, 'saveNewOrders')
                .withArgs([order], py._platform)
                .returns();

            const res = await py.interactWithOrders(order);
            expect(res).to.eql();

            expect(stateByCodStub.callCount).to.equal(1);
            expect(stateByCodStub.calledWith(stateCod)).to.be.true;
        });

        it('should reject an order correctly by the platform', async function () {
            let savedOrd = Object.assign({}, order);
            savedOrd.state = 'PENDING'
            savedOrderStub
                .resolves(savedOrd);

            const py = new PedidosYa();
            py._platform = platform;
            stateByCodStub
                .withArgs(stateCod)
                .returns(state);
            stateByCodStub
                .withArgs(confirmStateCod)
                .returns(confirmState);
            stateByCodStub
                .withArgs(rejStateCod)
                .returns(rejState);
            stateByCodStub
                .withArgs(rejClosedStateCod)
                .returns(rejClosedState);

            const updOrderStateStub = sandbox
                .stub(PedidosYa.prototype, 'updateOrderState')
                .withArgs(newOrders[0].order, rejStateCod)
                .resolves();

            const rejIdTypeByCodStub = sandbox
                .stub(NewsTypesSingleton, 'idByCod')
                .withArgs(rejTypeCod)
                .returns(rejIdType);

            const rejIdStateByCodStub = sandbox
                .stub(NewsStateSingleton, 'idByCod')
                .withArgs(rejStateCod)
                .returns(rejIdState);

            const rejectedMessagesStub = sandbox
                .stub(RejectedMessagesSingleton, 'platformRejectedMessages')
                .returns({ id: 1, name: 'RejectMessage' });

            const updateNewsStateStub = sandbox
                .stub(PedidosYa.prototype, 'updateNewsState')
                .withArgs(order.order, rejIdState, rejIdType, null, 'PLATFORM', {})
                .returns();

            order.state = 'REJECTED';
            const res = await py.interactWithOrders(order);
            expect(res).to.eql();

            expect(stateByCodStub.callCount).to.equal(6);
            expect(stateByCodStub.calledWith(stateCod)).to.be.true;

            // expect(updOrderStateStub.callCount).to.equal(1);
            // expect(updOrderStateStub.calledWith(newOrders[0].order, rejStateCod)).to.be.true;

            expect(rejIdStateByCodStub.callCount).to.equal(1);
            expect(rejIdStateByCodStub.calledWith(rejStateCod)).to.be.true;

            expect(rejIdTypeByCodStub.callCount).to.equal(1);
            expect(rejIdTypeByCodStub.calledWith(rejTypeCod)).to.be.true;

            // expect(rejectedMessagesStub.callCount).to.equal(1);
            // expect(rejectedMessagesStub.calledWith()).to.be.true;

            // expect(updateNewsStateStub.callCount).to.equal(1);
            //  expect(updateNewsStateStub.calledWith(order.order, rejIdState, rejIdType, null, 'PLATFORM', {})).to.be.true;
        });

    });

    describe('fn(): confirmOrder()', function () {
        const stateCod = 'confirm';
        const state = 'CONFIRMED';

        it('should confirm a preOrder or logistics order correctly', async function () {
            let deliveryTimeId = 1;
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    confirm: () => Promise.resolve('Ok')
                }
            }
            const res = await py.confirmOrder(order, deliveryTimeId);
            expect(res).to.eql('Ok');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });

        it('should confirm a not logistics order correctly', async function () {
            let deliveryTimeId = 1;
            order.logistics = false;
            order.preOrder = false;
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    confirm: () => Promise.resolve('Ok')
                }
            }
            const res = await py.confirmOrder(order, deliveryTimeId);
            expect(res).to.eql('Ok');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });

        it('should fail confirming an order', async function () {
            let deliveryTimeId = 1;
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    confirm: () => Promise.reject('Error+')
                }
            }
            const res = await py.confirmOrder(order, deliveryTimeId);
            expect(res.metadata.error).to.eql('Error+');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });
    });

    describe('fn(): rejectOrder()', function () {
        const stateCod = 'rej';
        const state = 'REJECTED';
        const rejectMessageId = 1;
        const rejectMessageNote = 'Nota test';

        it('should reject order correctly', async function () {
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    reject: () => Promise.resolve(newOrders[0])
                }
            }
            const res = await py.branchRejectOrder(order, rejectMessageId, rejectMessageNote);
            expect(res).to.eql(newOrders[0]);

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });

        it('should fail the  rejection order', async function () {
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    reject: () => Promise.reject('Error+')
                }
            }
            const res = await py.branchRejectOrder(order, rejectMessageId, rejectMessageNote);
            expect(res.metadata.error).to.eql('Error+');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });
    });

    describe('fn(): dispatchOrder()', function () {
        const stateCod = 'dispatch';
        const state = 'DISPATCHED';

        it('should dispatch order correctly', async function () {
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    dispatch: () => Promise.resolve(newOrders[0])
                }
            }
            const res = await py.dispatchOrder(order);
            expect(res).to.eql(newOrders[0]);

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });

        it('should fail rejecting an order', async function () {
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);

            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    dispatch: () => Promise.reject('Error+')
                }
            }
            const res = await py.dispatchOrder(order);
            expect(res.metadata.error).to.eql('Error+');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });
    });

    describe('fn(): receiveOrder()', function () {
        it('should receive order correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    reception: () => Promise.resolve('Receive')
                }
            }
            sandbox.stub(branchModel, 'findOne').resolves(branches);
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.receiveOrder(order, branches[0]);
            expect(res).to.eql('Receive');
        });

        it('should fail receiving an order', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    reception: () => Promise.reject('Receive')
                }
            }
            sandbox.stub(branchModel, 'findOne').resolves(branches[0]);
            sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.receiveOrder(order, branches[0]);
            expect(res.metadata.error).to.eql('Receive');
        });
    });

    describe('fn(): viewOrder()', function () {
        const stateCod = 'view';
        const state = 'VIEWED';

        it('should view order correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    acknowledgement: () => Promise.resolve('Viewed')
                }
            }
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);
                sandbox.stub(branchModel, 'findOne').resolves(branches[0]);
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.viewOrder(order, branches[0]);
            expect(res).to.eql('Viewed');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });

        it('should fail viewing an order', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    acknowledgement: () => Promise.reject('Error+')
                }
            }
            const stateIdByCodStub = sandbox.stub(NewsStateSingleton, 'stateByCod')
                .withArgs(stateCod)
                .returns(state);

            const updOrderStateStub = sandbox.stub(PedidosYa.prototype, 'updateOrderState')
                .resolves(newOrders[0]);
                sandbox.stub(branchModel, 'findOne').resolves(branches[0]);
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.viewOrder(order, branches[0]);
            expect(res.metadata.error).to.eql('Error+');

            expect(stateIdByCodStub.callCount).to.equal(1);
            expect(stateIdByCodStub.calledWith(stateCod)).to.be.true;

            expect(updOrderStateStub.callCount).to.equal(1);
            expect(updOrderStateStub.calledWith(order, state)).to.be.true;
        });
    });

    describe('fn(): callHeartBeat()', function () {
        it('should call the heartbeat when the branch has pedidosYa', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    heartBeat: () => Promise.reject('Error+')
                }
            }

            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.callHeartBeat(branches[0]);
            expect(res.metadata.error).to.eql('Error+');
        });

        it('should call the heartbeat when the branch has no pedidosYa', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    heartBeat: () => Promise.resolve()
                }
            }

            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.callHeartBeat();
            expect(res.metadata.error).to.eql('Can not send the heartbeat.');
        });

        it('should fail calling the heartbeat', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                event: {
                    heartBeat: () => Promise.resolve()
                }
            }

            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.callHeartBeat(branches[0]);
            expect(res).to.eql();
        });
    });

    describe('fn(): closeRestaurant()', function () {
        beforeEach(function () {
            sandbox.stub(branchModel, 'findOne').resolves(branches[0]);
            sandbox.stub(branchModel, 'updateOne').resolves();
            sandbox.stub(branchModel, 'validateNewProgClosed').returns('');
        });

        it('should close the restaurant correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                restaurant: {
                    close: () => Promise.resolve('Closed')
                }
            }
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await  py.closeRestaurant(branches[0].branchId, branches[0].platforms[0], 5, 'Test close');
            expect(res).to.eql('Closed');
        });

        it('should fail closing the restaurant', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                restaurant: {
                    close: () => Promise.reject('Closed')
                }
            }
            
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);
            try {
                await  py.closeRestaurant(branches[0].branchId, branches[0].platforms[0], 5, 'Test close');
            } catch (error) {
                expect(error).to.eql(`Failed to closeRestaurant. RestaurantCode: ${branches[0].branchId}.`);
            }
        });
    });

    describe('fn(): openRestaurant()', function () {
        beforeEach(function () {
            sandbox.stub(branchModel, 'findOne').resolves(branches[0]);
            sandbox.stub(branchModel, 'updateOne').resolves();
            sandbox.stub(branchModel, 'findProgClosedToOpen').returns({});
        });
        it('should open the restaurant correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                restaurant: {
                    open: () => Promise.resolve('Open')
                }
            }
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            const res = await py.openRestaurant(branches[0].branchId);
            expect(res).to.eql('Open');
        });

        it('should fail opening the restaurant', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                restaurant: {
                    open: () => Promise.reject()
                }
            }
            const getBranchPlatformsStub = sandbox.stub(PedidosYa.prototype, 'getBranchPlatform')
                .returns(branches[0].platforms[0]);

            try {
                await py.openRestaurant(branches[0].branchId);
            } catch (error) {
                expect(error).to.eql(`Failed to openRestaurant. RestaurantCode: ${branches[0].branchId}.`);
            }
        });
    });

    describe('fn(): retriveDriver()', function () {
        let trackingPY = {
            driver: { name: 'Juan' },
            pickupDate: null,
            estimatedDeliveryDate: null,
            state: "DELIVERED"
        };
        let driver = {
            "state": "DELIVERED",
            "driver": null,
            "pickupDate": null,
            "estimatedDeliveryDate": null,
            "name": 'Juan'
        };
        it('should retrive the order driver correctly', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    tracking: () => Promise.resolve(trackingPY)
                }
            }

            const res = await py.retriveDriver(order);
            expect(res).to.eql(driver);
        });
        it('should retrive the order driver correctly without name', async function () {
            trackingPY.name = undefined;
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    tracking: () => Promise.resolve(trackingPY)
                }
            }
            driver.name = 'Sin Informacion';
            const res = await py.retriveDriver(order);
            expect(res).to.eql(driver);
        });

        it('should fail retriving an empty driver', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    tracking: () => Promise.resolve()
                }
            }

            try {
                await py.retriveDriver(order);
            } catch (error) {
                expect(error).to.eql();
            }
        });

        it('should fail retriving the order driver', async function () {
            const py = new PedidosYa();
            py._platform = platform;
            py._api = {
                order: {
                    tracking: () => Promise.reject('')
                }
            }

            try {
                await py.retriveDriver(order);
            } catch (error) {
                expect(error).to.eql(`Can not retrive order driver. BranchId ${order.id}.`);
            }
        });
    });

});