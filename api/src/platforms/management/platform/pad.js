'use strict'
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import axios from 'axios';
import CustomError from '../../../utils/errors/customError';
import { APP_BRANCH, APP_PLATFORM } from '../../../utils/errors/codeError';

class Pad extends Platform {
    constructor(platform) {
        super(platform);
        this.urlGetProblemas = 'get-tipos-problema';
        this.urlSetState = 'set-pedido-estado';
        this.init();
        this.cronGetPlatformParameters();
    }

    async init() {
        if (this._platform &&
            this._platform.credentials &&
            this._platform.credentials.data &&
            this._platform.credentials.data.clientId &&
            this._platform.credentials.data.clientSecret &&
            this._platform.credentials.data.baseUrl
        ) {
            this.baseUrl = this._platform.credentials.data.baseUrl;
            this.clientId = this._platform.credentials.data.clientId;
            this.clientSecret = this._platform.credentials.data.clientSecret;
            this.authData = { auth: { username: this.clientId, password: this.clientSecret } };
            console.log(`${this._platform.name}.\t\t Inicializated.`);
        } else {
            const msg = 'Can not initializate PaD.';
            new CustomError(APP_PLATFORM.INIT, msg, this.uuid, { platform: this._platform });
        }
    }

    /**
     * 
     * @param {*} order 
     * @override
     */
    confirmOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const state = NewsStateSingleton.stateByCod('confirm');
                await this.updateOrderState(order, state);

                const idPreparando = 2;
                const url = `${this.baseUrl}${this.urlSetState}?pedido=${order.id}&estado=${idPreparando}`;
                const res = await axios.post(url, {}, this.authData);
                resolve(res.data);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the confirmed status.';
                const err = new CustomError(APP_PLATFORM.CONFIRM, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * 
     * @param {*} order 
     * @override
     */
    dispatchOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const state = NewsStateSingleton.stateByCod('dispatch');
                await this.updateOrderState(order, state);

                const idLlevando = 3;
                const url = `${this.baseUrl}${this.urlSetState}?pedido=${order.id}&estado=${idLlevando}`;
                const res = await axios.post(url, {}, this.authData);

                resolve(res.data);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the dispatched status.';
                const err = new CustomError(APP_PLATFORM.DISPATCH, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * 
     * @param {*} order 
     * @override
     */
    async deliveryOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const state = NewsStateSingleton.stateByCod('delivery');
                await this.updateOrderState(order, state);

                const idEntregando = 4;
                const url = `${this.baseUrl}${this.urlSetState}?pedido=${order.id}&estado=${idEntregando}`;
                const res = await axios.post(url, {}, this.authData);
                resolve(res.data);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the delivered status.';
                const err = new CustomError(APP_PLATFORM.DELIVERY, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    /**
     * 
     * @param {*} order 
     * @override
     */
    async branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('rej');
            await this.updateOrderState(order, state);

            const idProblema = 5;
            if (!rejectMessageNote)
                rejectMessageNote = '-';
            try {
                const url = `${this.baseUrl}${this.urlSetState}?pedido=${order.id}&estado=${idProblema}&metadata={"tipo_problema": ${rejectMessageId},"observacion": "${rejectMessageNote}"}`;
                const res = await axios.post(url, {}, this.authData);
                resolve(res.data);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the rejected status.';
                const err = new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }

    getRejectedMessages() {
        return new Promise(async (resolve) => {
            try {
                const rejectedMessagesRes = await axios
                    .post(this.baseUrl + this.urlGetProblemas,
                        {},
                        this.authData);
                let data = Object.keys(rejectedMessagesRes.data)
                    .map((key) => {
                        return {
                            name: rejectedMessagesRes.data[key],
                            descriptionES: rejectedMessagesRes.data[key],
                            descriptionPT: rejectedMessagesRes.data[key],
                            forRestaurant: true,
                            forLogistics: false,
                            forPickup: false,
                            id: parseInt(key, 10),
                            platformId: this._platform.internalCode
                        }
                    });
                let negatives = require('../../../assets/rejectedMessages').negatives;
                data = data.concat(negatives);
                resolve(data);
            } catch (error) {
                const msg = 'Can not get parameters of PaD.';
                new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, { platformError: error });
            }
        });
    }
}

export default Pad;