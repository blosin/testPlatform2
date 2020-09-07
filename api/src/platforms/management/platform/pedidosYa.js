'use strict'
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import NewsTypesSingleton from '../../../utils/newsType';
import RejectedMessagesSingleton from '../../../utils/rejectedMessages';
import orderModel from '../../../models/order';
import branchModel from '../../../models/branch';
import logger from '../../../config/logger';
import moment from 'moment';
import CustomError from '../../../utils/errors/customError';
import { APP_PLATFORM } from '../../../utils/errors/codeError';
import UUID from '../../../utils/errors/utils';

import Credentials from '../../sdk/pedidosYa/lib/http/Credentials';
import ApiClient from '../../sdk/pedidosYa/lib/ApiClient';
import PaginationOptions from '../../sdk/pedidosYa/lib/utils/PaginationOptions';
import Environments from '../../sdk/pedidosYa/lib/http/Environments';

class PedidosYa extends Platform {
    constructor(platform) {
        super(platform);
        this._platform = platform;
        this.init();
        this.cronGetPlatformParameters();
    }

    async init() {
        if (this._platform &&
            this._platform.credentials &&
            this._platform.credentials.data &&
            this._platform.credentials.data.clientId &&
            this._platform.credentials.data.clientSecret &&
            this._platform.credentials.data.environment
        ) {
            try {
                this.credentials = new Credentials();
                this.credentials.clientId = this._platform.credentials.data.clientId;
                this.credentials.clientSecret = this._platform.credentials.data.clientSecret;
                this.credentials.environment = Environments[this._platform.credentials.data.environment];
                this._api = new ApiClient(this.credentials);
                this.getOrders();
                console.log(`${this._platform.name}.\t Inicializated.`);
            } catch (error) {
                const msg = 'Can not initializate PY.';
                new CustomError(APP_PLATFORM.INIT, msg, this.uuid, { platform: this._platform });
            }

        } else {
            const msg = 'Can not initializate PY.';
            new CustomError(APP_PLATFORM.INIT, msg, this.uuid, { platform: this._platform });
        }
    }

    /**
    * 
    * @override
    */
    importParser() {
        return require('../../interfaces/pedidosYa');
    }

    async getOrders() {
        await this._api.order
            .getAll(null,
                PaginationOptions.create(),
                (data) => {
                    this.uuid = UUID();
                    this.interactWithOrders(data);
                },
                (error) => {
                    const msg = 'Fallo al obtener ordenes de PY.';
                    new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, { orderId: order.id, platformError: error.toString() });
                }
            );
    }

    /**
     * @override
     * Get platform rejectedMessages
     * */
    getDeliveryTimes() {
        return this._api.order.deliveryTime.getAll();
    }

    /**
     * @override
     * Get platform rejectedMessages
     * */
    getRejectedMessages() {
        return new Promise(async (resolve, reject) => {
            let data = await this._api.order.rejectMessage.getAll();
            let negatives = require('../../../assets/rejectedMessages').negatives;
            data = data.concat(negatives);
            resolve(data);
        });
    }

    initRestaurant(idRef) {
        return new Promise(async (resolve, reject) => {
            try {
                let version = {};
                version.os = 'Docker container';
                version.app = '0.0.1';
                await this._api.event.initialization(version, idRef);
                resolve();
            } catch (error) {
                if (!error) error = '';
                const msg = 'No se pudo inicializar el restaurant.';
                const err = new CustomError(APP_PLATFORM.INIT, msg, this.uuid, { idRef, platformError: error.toString() });
                reject(err);
            }
        });
    }

    async interactWithOrders(data) {
        this.updateLastContact();
        try {
            const savedOrder = await orderModel.findOne({
                orderId: data.id,
                internalCode: this._platform.internalCode
            });

            if (data.state == NewsStateSingleton.stateByCod('pend')) {
                if (!savedOrder) {
                    data.driver = {};
                    if (data.logistics)
                        data.driver = await this.retriveDriver(data);
                    this.saveNewOrders([data], this._platform);
                } else {
                    console.log('La orden ya esta guardada', data.id);
                }
            }
            // ------ REJECTED
            else if (data.state == NewsStateSingleton.stateByCod('rej')
                && !!savedOrder
                && savedOrder.state != NewsStateSingleton.stateByCod('rej')
                && savedOrder.state != NewsStateSingleton.stateByCod('rej_closed')) {
                try {
                    const state = NewsStateSingleton.stateByCod('rej');

                    await this.updateOrderState(savedOrder.order, state);

                    const statusId = NewsStateSingleton.idByCod('rej');
                    const typeId = NewsTypesSingleton.idByCod('platform_rej_ord');
                    let viewed = null;
                    if (savedOrder.state == NewsStateSingleton.stateByCod('confirm'))
                        viewed = new Date();

                    const rej = RejectedMessagesSingleton.platformRejectedMessages;
                    const rejectedExtraData = {
                        rejectMessageId: parseInt(rej.id, 10),
                        rejectMessageDescription: rej.name,
                        rejectMessageNote: null,
                        entity: 'PLATFORM'
                    }
                    await this.updateNewsState(savedOrder.order, statusId, typeId, viewed, 'PLATFORM', rejectedExtraData);
                }
                catch (error) {
                    throw error;
                }
            }
        } catch (error) {
            const msg = 'No se pudo procesar la orden entrante.';
            new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, { orderId: data.id, platformError: error.toString() });
        }
    }

    /**
   * @param {*} order
   * @override
   */
    receiveOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const branch = await branchModel.findOne({ branchId: order.branchId });
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const idRef = platformBranch.branchReference.toString();
                let res = await this._api.event.reception(order.id, idRef);
                if (!res) res = true;
                return resolve(res)
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the received status.';
                const err = new CustomError(APP_PLATFORM.RECEIVE, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * @param {*} order
     * @override
     */
    viewOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const branch = await branchModel.findOne({ branchId: order.branchId });
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const idRef = platformBranch.branchReference.toString();
                const state = NewsStateSingleton.stateByCod('view');
                await this.updateOrderState(order, state);
                this.updateLastContact();

                let res = await this._api.event.acknowledgement(order.id, idRef);
                if (!res) res = true;
                return resolve(res);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the viewed status.';
                const err = new CustomError(APP_PLATFORM.VIEW, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * @param {*} order 
     * @param {*} deliveryTimeId 
     * @override
     */
    confirmOrder(order, deliveryTimeId) {
        return new Promise(async (resolve) => {
            try {
                this.updateLastContact();
                const state = NewsStateSingleton.stateByCod('confirm');
                await this.updateOrderState(order, state);
                let res;
                if (order.preOrder || !order.ownDelivery) {
                    res = await this._api.order.confirm(order.id);
                } else {
                    res = await this._api.order.confirm(order.id, deliveryTimeId);
                }
                return resolve(res);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the rejected status.';
                const err = new CustomError(APP_PLATFORM.CONFIRM, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * @param {*} orderId 
     * @param {*} rejectMessageId 
     * @param {*} rejectMessageNote 
     * @override
     */
    branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
        return new Promise(async (resolve) => {
            try {
                this.updateLastContact();
                const state = NewsStateSingleton.stateByCod('rej');
                await this.updateOrderState(order, state);

                const res = await this._api.order.reject(order.id, rejectMessageId, rejectMessageNote);
                resolve(res);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the rejected status.';
                const err = new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * @param {*} order 
     * @override
     */
    dispatchOrder(order) {
        return new Promise(async (resolve) => {
            try {
                this.updateLastContact();
                const state = NewsStateSingleton.stateByCod('dispatch');
                await this.updateOrderState(order, state);

                const res = await this._api.order.dispatch(order);
                return resolve(res);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the dispatched status.';
                const err = new CustomError(APP_PLATFORM.DISPATCH, msg, this.uuid, { error: error.toString() });
                return resolve(err);
            }
        });
    }

    callHeartBeat(branch) {
        return new Promise(async (resolve, reject) => {
            try {
                if (branch && branch.platforms) {
                    const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);

                    if (platformBranch) {

                        this.updateLastContact();
                        const idRef = platformBranch.branchReference.toString();
                        const hb = await this._api.event.heartBeat(idRef);
                        resolve(hb);
                    } else {
                        resolve();
                    }
                }
                else {
                    throw `Can not send the heartbeat.`;
                }
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to call the heartbeat.';
                const err = new CustomError(APP_PLATFORM.HEARTBEAT, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * @param {*} branchId
     * @override
     */
    openRestaurant(branchId) {
        const dateNow = new Date();
        return new Promise(async (resolve, reject) => {
            try {
                const branch = await branchModel.findOne({ branchId });
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const closedProg = branchModel.findProgClosedToOpen(platformBranch, dateNow);

                if (typeof (closedProg) == 'string') {
                    const msg = `${closedProg} RestaurantCode: ${branch.branchId}.`;
                    logger.error({ message: msg, meta: { dateNow } });
                    return reject(msg);
                }

                const dateFrom = moment(dateNow).add(branch.tzo, 'h').format('YYYY-MM-DDTHH:mm:ss');
                const dateFromUTC = moment(dateNow);
                const idRef = platformBranch.branchIdReference;
                let opened = await this._api.restaurant.open(idRef, dateFrom);

                await branchModel.updateOne({
                    branchId: branch.branchId,
                    'platforms.platform': this._platform._id
                }, {
                    $set: {
                        'platforms.$.progClosed.$[i].open': dateFromUTC
                    }
                }, {
                    arrayFilters: [
                        { 'i._id': closedProg._id }
                    ]
                });
                this.updateLastContact();
                resolve(opened);
            } catch (error) {
                if (!error) error = '';
                error = { error: error.toString() };
                const msg = `Failed to openRestaurant. RestaurantCode: ${branchId}.`;
                logger.error({ message: msg, meta: { error } });
                reject(msg);
            }
        });
    }

    /**
     * 
     * @param {*} branchId 
     * @param {*} timeToClose 
     * @param {*} description 
     * @override
     */
    closeRestaurant(branchId, timeToClose, description) {
        return new Promise(async (resolve, reject) => {
            try {
                const branch = await branchModel.findOne({ branchId });
                let dateNow = new Date();
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const validatedClosed = branchModel.validateNewProgClosed(platformBranch, dateNow, timeToClose);

                const dateFrom = moment(dateNow).add(branch.tzo, 'h').format('YYYY-MM-DDTHH:mm:ss');
                const dateTo = moment(dateNow).add(branch.tzo, 'h').add(timeToClose, 'm').format('YYYY-MM-DDTHH:mm:ss');
                const dateFromUTC = moment(dateNow);
                const dateToUTC = moment(dateNow).add(timeToClose, 'm');

                if (validatedClosed != '')
                    throw `${validatedClosed} RestaurantCode: ${branch.branchId}.`;

                const idRef = platformBranch.branchIdReference;

                let closed = await this._api.restaurant.close(idRef, dateFrom, dateTo, description);

                await branchModel.updateOne({
                    branchId: branch.branchId,
                    'platforms.platform': this._platform._id
                }, {
                    '$push': {
                        'platforms.$.progClosed': {
                            close: dateFromUTC,
                            open: dateToUTC,
                            description
                        }
                    }
                });
                this.updateLastContact;
                resolve(closed);
            } catch (error) {
                if (!error) error = '';
                error = { error: error.toString(), branchId, timeToClose, description };
                const msg = `Failed to closeRestaurant. RestaurantCode: ${branchId}.`;
                logger.error({ message: msg, meta: error });
                reject(msg);
            }
        });
    }

    retriveDriver(order) {
        return new Promise(async (resolve, reject) => {
            let orderTracking = {
                name: 'Sin Informacion',
                driver: null,
                pickupDate: null,
                estimatedDeliveryDate: null
            };
            try {
                let resPY = await this._api.order.tracking(order.id);
                this.updateLastContact();
                if (resPY) {
                    if (!!resPY.driver && !!resPY.driver.name) resPY.name = resPY.driver.name;
                    else resPY.name = orderTracking.name;

                    resPY.driver = null;
                    orderTracking = resPY;
                }
            } catch (error) {
                const msg = 'No se pudo obtener el driver de la orden.';
                new CustomError(APP_PLATFORM.DRIVER, msg, this.uuid, { orderId: order.id, platformError: error.toString() });
            }
            resolve(orderTracking);
        });
    }

}

export default PedidosYa;