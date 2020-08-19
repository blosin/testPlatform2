'use strict'
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import logger from '../../../config/logger';
import axios from 'axios';

class Performance extends Platform {
    constructor(platform) {
        super(platform);

        this._platform = platform;
        this.urlRejected = 'CancelarPedido';
        this.urlConfirmed = 'ConfirmarPedido';
        this.urlDispatched = 'EnviarPedido';
        this.urlDelivered = 'EntregarPedido';
        this.urlRejectedType = 'MotivosRechazo';
        this.urlDeliveryTime = 'TiemposEntrega';
        this.init();
        this.cronGetPlatformParameters();
    }

    async init() {
        if (this._platform &&
            this._platform.credentials &&
            this._platform.credentials.data &&
            this._platform.credentials.data.baseUrl &&
            this._platform.credentials.data.token
        ) {
            this.baseUrl = this._platform.credentials.data.baseUrl;
            this.token = this._platform.credentials.data.token;
            console.log(`${this._platform.name}.\t Inicializated.`);
        } else {
            const msg = `[EMAIL-LOG] Can not initializate Performance.`;
            logger.error({ message: msg, meta: { platform: this._platform } });
        }
    }

    /**
     * 
     * @param {*} order 
     * @override
     */
    async confirmOrder(order, deliveryTimeId) {
        return new Promise(async (resolve) => {
            try {
                const state = NewsStateSingleton.stateByCod('confirm');
                await  this.updateOrderState(order, state);
                const body = {
                    Token: this.token,
                    IdPedido: order.id,
                    Demora: deliveryTimeId
                };

                const headers = {
                    'Content-Type': 'application/json'
                }
                const url = `${this.baseUrl}${this.urlConfirmed}`;
                const res = await axios.put(url, body, headers);
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
    async dispatchOrder(order) {
        return new Promise(async (resolve) => {
            try {
                const state = NewsStateSingleton.stateByCod('dispatch');
                await this.updateOrderState(order, state);
                const body = {
                    Token: this.token,
                    IdPedido: order.id,
                };
                const headers = {
                    'Content-Type': 'application/json'
                }

                const url = `${this.baseUrl}${this.urlDispatched}`;
                const res = await axios.put(url, body, headers);
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
                const body = {
                    Token: this.token,
                    IdPedido: order.id,
                };
                const headers = {
                    'Content-Type': 'application/json'
                }

                const url = `${this.baseUrl}${this.urlDelivered}`;
                const res = await axios.put(url, body, headers);
                resolve(res.data);
            } catch (error) {
                if (!error) error = '';
                const msg = 'Failed to send the delivered status.';
                const err = new CustomError(APP_PLATFORM.DELIVERY, msg, this.uuid, { error: error.toString() });
                resolve(err);
            }
        });
    }
}

export default Performance;