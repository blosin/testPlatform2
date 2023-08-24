'use strict';
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import axios from 'axios';
import CustomError from '../../../utils/errors/customError';
import { APP_BRANCH, APP_PLATFORM } from '../../../utils/errors/codeError';

class Rapiboy extends Platform {
  constructor(platform) {
    super(platform);
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
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data &&
      this._platform.credentials.data.baseUrl &&
      this._platform.credentials.data.token
    ) {
      this.baseUrl = this._platform.credentials.data.baseUrl;
      this.token = this._platform.credentials.data.token;
      this.statusResponse = this._platform.statusResponse;
      console.log(`${this._platform.name}.\t Inicializated.`);
    } else {
      const msg = 'Can not initializate PediGrido.';
      new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
        platform: this._platform
      });
    }
  }

  /**
   *
   * @param {*} order
   * @override
   */
  confirmOrder(order, deliveryTimeId) {
    return new Promise(async (resolve) => {
      try {
        const state = NewsStateSingleton.stateByCod('confirm');
        await this.updateOrderState(order, state);
        if (this.statusResponse.confirm) {
          const body = {
            Token: this.token,
            IdPedido: order.id,
            Demora: deliveryTimeId
          };

          const headers = {
            'Content-Type': 'application/json'
          };

          const url = `${this.baseUrl}${this.urlConfirmed}`;
          const res = await axios.put(url, body, headers);
          resolve(res.data);
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the confirmed status.';
        const err = new CustomError(APP_PLATFORM.CONFIRM, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
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
        if (this.statusResponse.dispatch) {
          const body = {
            Token: this.token,
            IdPedido: order.id
          };
          const headers = {
            'Content-Type': 'application/json'
          };

          const url = `${this.baseUrl}${this.urlDispatched}`;
          const res = await axios.put(url, body, headers);
          resolve(res.data);
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the dispatched status.';
        const err = new CustomError(APP_PLATFORM.DISPATCH, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
        resolve(err);
      }
    });
  }

  /**
   *
   * @param {*} order
   * @override
   */
  deliveryOrder(order) {
    return new Promise(async (resolve) => {
      try {
        const state = NewsStateSingleton.stateByCod('delivery');
        await this.updateOrderState(order, state);
        if (this.statusResponse.delivery) {
          const body = {
            Token: this.token,
            IdPedido: order.id
          };
          const headers = {
            'Content-Type': 'application/json'
          };

          const url = `${this.baseUrl}${this.urlDelivered}`;
          const res = await axios.put(url, body, headers);
          resolve(res.data);
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the delivered status.';
        const err = new CustomError(APP_PLATFORM.DELIVERY, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
        resolve(err);
      }
    });
  }

  /**
   *
   * @param {*} order
   * @override
   */
  branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
    return new Promise(async (resolve) => {
      try {
        const state = NewsStateSingleton.stateByCod('rej');
        await this.updateOrderState(order, state);
        if (this.statusResponse.reject) {
          const body = {
            Token: this.token,
            IdPedido: order.id,
            Motivo: rejectMessageId
          };
          const headers = {
            'Content-Type': 'application/json'
          };

          const url = `${this.baseUrl}${this.urlRejected}`;
          const res = await axios.put(url, body, headers);
          resolve(res.data);
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the rejected status.';
        const err = new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
        resolve(err);
      }
    });
  }

  /**
   * @override
   * Get platform rejectedMessages
   * */
  getDeliveryTimes() {
    return new Promise(async (resolve) => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        const url = `${this.baseUrl}${this.urlDeliveryTime}`;
        const deliveryTimesRes = await axios.get(url, {}, headers);
        const deliveryTimes = deliveryTimesRes.data.map((obj, index) => {
          const minutes =
            parseInt(obj.m_Item2.split(':')[0], 10) * 60 +
            parseInt(obj.m_Item2.split(':')[1], 10);
          return {
            name: obj.m_Item2,
            description: obj.m_Item2,
            minMinutes: minutes,
            maxMinutes: minutes,
            order: index + 1,
            id: parseInt(obj.m_Item1, 10),
            platformId: this._platform.internalCode
          };
        });
        resolve(deliveryTimes);
      } catch (error) {
        const msg = 'Can not get parameters of PaD.';
        const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
          platformError: error
        });
        resolve(err);
      }
    });
  }

  /**
   * @override
   * Get platform rejectedMessages
   * */
  getRejectedMessages() {
    return new Promise(async (resolve) => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        const url = `${this.baseUrl}${this.urlRejectedType}`;
        const rejectedMessagesRes = await axios.get(url, {}, headers);

        let data = rejectedMessagesRes.data.map((obj) => {
          return {
            name: obj.m_Item2,
            descriptionES: obj.m_Item2,
            descriptionPT: obj.m_Item2,
            forRestaurant: true,
            forLogistics: true,
            forPickup: true,
            id: parseInt(obj.m_Item1, 10),
            platformId: this._platform.internalCode
          };
        });
        let negatives = require('../../../assets/rejectedMessages').negatives;
        data = data.concat(negatives);
        resolve(data);
      } catch (error) {
        const msg = 'Can not get parameters of PaD.';
        const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
          platformError: error
        });
        resolve(err);
      }
    });
  }
}

export default Rapiboy;
