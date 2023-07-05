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
    this.chainCode = settings.chainCode;
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

  peyaLogin() {
    const dataSend = new URLSearchParams();
    dataSend.append('username', settings.peyaParams.username);
    dataSend.append('password', settings.peyaParams.password);
    dataSend.append('grant_type', settings.peyaParams.grant_type);
    const configData = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    axios.post(`${settings.peya}/v2/login`, dataSend.toString(), configData).then(r => {
      this.tokenPeya = r.access_token;
    });

  }

  /**
* Can be overriden.
* */
  openRestaurant(branchId) {
    return new Promise(async (resolve, reject) => {
      try {
        const dateNow = new Date();
        const branch = await branchModel.findOne({ branchId });
        const platformBranch = this.getBranchPlatform(
          branch.platforms,
          this._platform._id
        );
        const closedProg = branchModel.findProgClosedToOpen(
          platformBranch,
          dateNow
        );

        if (typeof closedProg == 'string')
          throw `${closedProg} RestaurantCode: ${branchId}.`;

        const dateFromUTC = moment(dateNow);

        await branchModel.updateOne(
          {
            branchId,
            'platforms.platform': this._platform._id
          },
          {
            $set: {
              'platforms.$[].progClosed.$[i].open': dateFromUTC
            }
          },
          {
            arrayFilters: [{ 'i._id': closedProg._id }]
          }
        );
        const body = {
          "availabilityState": "OPEN",
          "platformKey": branchId,
          "platformRestaurantId": branchId
        };
        const headers = {
          'Authorization': `Bearer ${this.tokenPeya}`,
          'Content-Type': 'application/json'
        };
        ///v2/chains/{chainCode}/remoteVendors/{posVendorId}/availability
        const url = `${this.baseUrl}/v2/chains/${this.chainCode}/remoteVendores/${branchId}/availability`;
        await axios.put(url, body, headers);
        resolve();
      } catch (error) {
        error = { error: error.toString(), platform: this._platform };
        const msg = `Failed to openRestaurant. RestaurantCode: ${branchId}.`;
        logger.error({ message: msg, meta: error });
        reject(msg);
      }
    });
  }

  /**
   * Can be overriden.
   * */
  closeRestaurant(branchId, timeToClose, description) {
    return new Promise(async (resolve, reject) => {
      try {
        const dateNow = new Date();
        const branch = await branchModel.findOne({ branchId });
        const platformBranch = this.getBranchPlatform(
          branch.platforms,
          this._platform._id
        );
        const validatedClosed = branchModel.validateNewProgClosed(
          platformBranch,
          dateNow,
          timeToClose
        );
        const dateFromUTC = moment(dateNow);
        const dateToUTC = moment(dateNow).add(timeToClose, 'm');

        if (validatedClosed != '')
          throw `${validatedClosed} RestaurantCode: ${branchId}.`;

        await branchModel.updateOne(
          {
            branchId,
            'platforms.platform': this._platform._id
          },
          {
            $push: {
              'platforms.$.progClosed': {
                close: dateFromUTC,
                open: dateToUTC,
                description: description
              }
            }
          }
        );
        const body = {
          "availabilityState": "CLOSED",
          "closedReason": "CLOSED RESTAURANT REJECTED",
          "platformKey": branchId,
          "platformRestaurantId": branchId

        };
        const headers = {
          'Authorization': `Bearer ${this.tokenPeya}`,
          'Content-Type': 'application/json'
        };
        const url = `${this.baseUrl}/v2/chains/${this.chainCode}/remoteVendores/${branchId}/availability`;
        await axios.put(url, body, headers);
        resolve();
      } catch (error) {
        error = {
          error: error.toString(),
          branchId,
          platform: this._platform,
          timeToClose,
          description
        };
        const msg = `Failed to closeRestaurant. RestaurantCode: ${branchId}.`;
        logger.error({ message: msg, meta: error });
        reject(msg);
      }
    });
  }

  /**
   * @param {*} order
   * @override
   */
  receiveOrder(order) {
    return new Promise(async (resolve) => {
      resolve(false);
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
        resolve(false);
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

          const body = {
            acceptanceTime: deliveryTimeId,
            remoteOrderId: order.id,
            status: 'order_accepted'
          };
          const headers = {
            'Authorization': `Bearer ${this.tokenPeya}`,
            'Content-Type': 'application/json'
          };
          const url = `${this.baseUrl}${this.urlConfirmed}/${order.id}`;
          const res = await axios.post(url, body, headers);
          resolve(true);
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
          if (order.expeditionType === 'pickup' || (order?.delivery?.riderPickupTime === null)) {
            const body = {
              status: 'order_picked_up'
            };
            const headers = {
              'Authorization': `Bearer ${this.tokenPeya}`,
              'Content-Type': 'application/json'
            };
            const url = `${this.baseUrl}${this.urlDispatched}/${order.id}`;
            const res = await axios.post(url, body, headers);
            resolve(true);
          }
          else {
            const url = `${this.baseUrl}/v2/orders/${order.Id}/preparation-completed`;
            const res = await axios.post(url, null, headers);
            resolve(true);
          }
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
        resolve(false);
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
        const body = {
          message: rejectMessageNote,
          reason: rejectMessageNote,
          status: "order_rejected"
        };
        const headers = {
          'Authorization': `Bearer ${this.tokenPeya}`,
          'Content-Type': 'application/json'
        };
        const url = `${this.baseUrl}${this.urlRejected}/${order.id}`;
        const res = await axios.post(url, body, headers);
        resolve(true);
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
