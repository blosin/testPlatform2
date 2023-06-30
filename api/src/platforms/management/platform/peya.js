'use strict';
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import axios from 'axios';
import CustomError from '../../../utils/errors/customError';
import { APP_BRANCH, APP_PLATFORM } from '../../../utils/errors/codeError';
import settings from '../../../config/settings';
import cron from 'node-cron';

class Peya extends Platform {
  constructor(platform) {
    super(platform);
    this.urlReceive = '/v2/order/status/';
    this.urlView = 'VistarPedido';
    this.urlRejected = '/v2/order/status/';
    this.urlConfirmed = '/v2/order/status/';
    this.urlDispatched = '/v2/order/status/';
    this.urlDelivered = 'EntregarPedido';
    this.urlRejectedType = 'MotivosRechazo';
    this.urlDeliveryTime = 'TiemposEntrega';
    this.tokenPeya = '';
    this.init();
    this.cronGetPlatformParameters();
  }

  async init() {
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data &&
      this._platform.credentials.data.baseUrl &&
      (this._platform.credentials.data.token ||
        (this._platform.credentials.data.clientId &&
          this._platform.credentials.data.clientSecret))
    ) {
      this.baseUrl = this._platform.credentials.data.baseUrl;
      this.token = this._platform.credentials.data.token
        ? this._platform.credentials.data.token
        : null;
      this.clientId = this._platform.credentials.data.clientId
        ? this._platform.credentials.data.clientId
        : null;
      this.clientSecret = this._platform.credentials.data.clientSecret
        ? this._platform.credentials.data.clientSecret
        : null;
      this.authData = null;
      if (this.clientId && this.clientSecret)
        this.authData = {
          auth: { username: this.clientId, password: this.clientSecret }
        };
      this.statusResponse = this._platform.statusResponse
        ? this._platform.statusResponse
        : {};
      this.autoReply = this._platform.autoReply;
      console.log(`${this._platform.name}.\t\t Inicializated.`);
    } else {
      const msg = 'Can not initializate Peya.';
      new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
        platform: this._platform
      });
    }
  }

    /**
   * This cron is for update platform parameters in DB.
   * Can be overriden.
   */
    cronGetPlatformParameters() {
      const schedule = '55 * * * *';
      const schedulePeyaLogin = '*/25 * * * *';// va con 25
    //  let currentDate = new Date();
     // let currentMinute = currentDate.getMinutes();     
      
      //const schedulePeyaLogin = `*/${currentMinute.toString()} * * * *`
      cron.schedule(schedule, () => this.getPlatformParameters());
      cron.schedule(schedulePeyaLogin, () => this.peyaLogin());
      // mon de login

    }

    peyaLogin () { 
      const dataSend = new URLSearchParams();
      dataSend.append('username',settings.peyaParams.username);
      dataSend.append('password', settings.peyaParams.password);
      dataSend.append('grant_type',settings.peyaParams.grant_type);
      const configData = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      axios.post(`${settings.peya}/v2/login`, dataSend.toString(), configData).then( r => {       
        this.tokenPeya = r.access_token;
      });

    }

  /**
   * @param {*} order
   * @override
   */
  receiveOrder(order) {
    return new Promise(async (resolve) => {
      try {
        if (this.statusResponse.receive) {
          if (this.token) {
            const body = {
              Token: this.token,
              IdPedido: order.id
            };
            const headers = {
              'Content-Type': 'application/json'
            };

            const url = `${this.baseUrl}${this.urlReceive}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          } else if (this.authData) {
            const url = `${this.baseUrl}${this.urlReceive}`;
            const res = await axios.post(
              url,
              { IdPedido: order.id },
              this.authData
            );
            resolve(true);
          }
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the received status.';
        const err = new CustomError(APP_PLATFORM.RECEIVE, msg, this.uuid, {
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
   * @param {*} order
   * @override
   */
  viewOrder(order) {
    return new Promise(async (resolve) => {
      try {
        const state = NewsStateSingleton.stateByCod('view');
        await this.updateOrderState(order, state);
        if (this.statusResponse.view) {
          if (this.token) {
            const body = {
              Token: this.token,
              IdPedido: order.id
            };
            const headers = {
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlView}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          } else if (this.authData) {
            const url = `${this.baseUrl}${this.urlView}`;
            const res = await axios.post(
              url,
              { IdPedido: order.id },
              this.authData
            );
            resolve(true);
          }
        } else resolve(false);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to send the viewed status.';
        const err = new CustomError(APP_PLATFORM.VIEW, msg, this.uuid, {
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
  confirmOrder(order, deliveryTimeId) {
    return new Promise(async (resolve) => {
      try {
        const state = NewsStateSingleton.stateByCod('confirm');
        await this.updateOrderState(order, state);
        if (this.statusResponse.confirm) {
            const body = {
                acceptanceTime: deliveryTimeId,
                remoteOrderId: order.id,
                status: 'order_accepted'
            };
            const headers = {
              'Authorization': `Bearer ${ this.tokenPeya } `,
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlConfirmed}/${order.id}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          
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
          if (this.token) {
            const body = {
              Token: this.token,
              IdPedido: order.id
            };
            const headers = {
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlDispatched}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          } else if (this.authData) {
            const url = `${this.baseUrl}${this.urlDispatched}`;
            const res = await axios.post(
              url,
              { IdPedido: order.id },
              this.authData
            );
            resolve(true);
          }
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
          if (this.token) {
            const body = {
              Token: this.token,
              IdPedido: order.id
            };
            const headers = {
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlDelivered}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          } else if (this.authData) {
            const url = `${this.baseUrl}${this.urlDelivered}`;
            const res = await axios.post(
              url,
              { IdPedido: order.id },
              this.authData
            );
            resolve(true);
          }
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
        console.log('rejectMessageId', rejectMessageId);
        console.log('rejectMessageNote', rejectMessageNote);
        const state = NewsStateSingleton.stateByCod('rej');
        await this.updateOrderState(order, state);
        if (this.statusResponse.reject) {
          if (this.token) {
            const body = {
              Token: this.token,
              IdPedido: order.id,
              IdMotivo: rejectMessageId,
              nota: rejectMessageNote ? rejectMessageNote : ''
            };
            const headers = {
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlRejected}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          } else if (this.authData) {
            const url = `${this.baseUrl}${this.urlRejected}`;
            const res = await axios.post(
              url,
              {
                IdPedido: order.id,
                IdMotivo: rejectMessageId,
                nota: rejectMessageNote ? rejectMessageNote : ''
              },
              this.authData
            );
            resolve(true);
          }
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
        let deliveryTimes = [];         
        deliveryTimes = require('../../../assets/deliveryTimes').generic;
        deliveryTimes.forEach(
          (obj) => (obj.platformId = this._platform.internalCode)
        );
        resolve(deliveryTimes);        
      } catch (error) {
        const msg = 'Can not get parameters of ThirdParty.';
        const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
          platformError: error
        });
        resolve(err);
      }
    });
  }

  /** */
  importParser() {
    return require('../../interfaces/peya');
  }


  /**
   * @override
   * Get platform rejectedMessages
   * */
  getRejectedMessages() {
    return new Promise(async (resolve) => {
      try {
        let data = [];        
        data = require('../../../assets/rejectedMessages').generic;
        const negatives =
          require('../../../assets/rejectedMessages').negatives;
        data = data.concat(negatives);
        data.forEach((obj) => (obj.platformId = this._platform.internalCode));
        resolve(data);        
      } catch (error) {
        const msg = 'Can not get parameters of ThirdParty.';
        const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
          platformError: error
        });
        resolve(err);
      }
    });
  }
}

export default Peya;
