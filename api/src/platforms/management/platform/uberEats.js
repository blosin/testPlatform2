'use strict';
import Platform from '../platform';
import cron from 'node-cron';
import axios from 'axios';
import CustomError from '../../../utils/errors/customError';
import { APP_PLATFORM } from '../../../utils/errors/codeError';
import UUID from '../../../utils/errors/utils';
import NewsStateSingleton from '../../../utils/newsState';
import logError from '../../../models/logError';

class UberEats extends Platform {
  constructor(platform) {
    super(platform);
    this.urlLogin = 'https://login.uber.com/oauth/v2/token';
    this.urlGetOrders =
      'https://api.uber.com/v1/eats/stores/' +
      this._platform.credentials.data.store_id +
      '/created-orders';
    this.urlGetDetailsOrder = 'https://api.uber.com/v2/eats/order/';
    this.init();
    this.cronGetPlatformParameters();
    console.log(`${this._platform.name}.\t Inicializated.`);
  }

  async init() {
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data
    ) {
      this.clientSecret = this._platform.credentials.data.clientSecret;
      this.clientId = this._platform.credentials.data.clientId;
      this.baseUrl = this._platform.credentials.data.baseUrl;
      const schedule = this._platform.credentials.data.schedule;
      const initialScope = 'eats.store.orders.read';
      cron.schedule(schedule, () => {
        this.uuid = UUID();
        this.loginGetOrders(initialScope);
      });
      // cron.schedule('*/4 * * * * *', () => {
      //     this.uuid = UUID();
      //     this.loginGetOrders(initialScope);
      // });
    } else {
      const msg = 'Can not initializate UberEats.';
      new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
        platform: this._platform
      });
    }
  }

  loginGetOrders(scope) {
    this.loginToUberEats(scope)
      .then((auth) => {
        this.getOrders(auth);
      })
      .catch((error) => {
        try { 
          logError.create({
              message: 'Falló loginGetOrders uberEats',
              error:{ error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló loginGetOrders uberEats',
                error: { error: 'Error inesperado en loginGetOrders uberEats' }
            });
        } 
        if (!error) error = '';
        const msg = 'Failed to login UberEats.';
        new CustomError(APP_PLATFORM.LOGIN, msg, this.uuid, {
          error: error.toString()
        });
      });
  }

  loginToUberEats(scope) {
    return new Promise(async (resolve, reject) => {
      try {
        const qs = require('querystring');
        const url = this.urlLogin;
        const payload = {
          client_id: this._platform.credentials.data.clientId,
          client_secret: this._platform.credentials.data.clientSecret,
          grant_type: 'client_credentials',
          scope: scope
        };
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        let response = await axios.post(url, qs.stringify(payload), config);
        if (!response) throw 'Can not login to uberEats.';
        this.updateLastContact();
        resolve(response.data.access_token);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló loginToUberEats uberEats',
              error:{ error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló loginToUberEats uberEats',
                error: { error: 'Error inesperado en loginToUberEats uberEats' }
            });
        } 
        if (!error) error = '';
        const msg = 'Failed to login. UberEats';
        const err = new CustomError(APP_PLATFORM.LOGIN, msg, this.uuid, {
          error: error.toString()
        });
        reject(err);
      }
    });
  }

  /**
   * Find UberEats orders using the api.
   * @param token
   * @external UberEats
   */
  getOrders(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + token
          }
        };
        const url = this.urlGetOrders;
        const urlDetails = this.urlGetDetailsOrder;
        const response = await axios.get(url, options);
        let ordersDetail = response.data.orders.map((order) => {
          const urlDetails = this.urlGetDetailsOrder + order.id;
          return axios.get(urlDetails, options);
        });
        let ordersDetails = await Promise.all(ordersDetail);
        ordersDetails.forEach((singleOrder) =>
          this.saveNewOrders(singleOrder.data).then((newsOrder) => {
            this.loginToUberEats('eats.order').then((confirmToken) => {
              if (
                newsOrder.state == NewsStateSingleton.stateByCod('rej_closed')
              )
                this.sendPosDeny(singleOrder.data, confirmToken);
              else this.sendPosConfirmation(singleOrder.data, confirmToken);
            });
          })
        );
        resolve();
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló getOrders uberEats',
              error:{ error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló getOrders uberEats',
                error: { error: 'Error inesperado en getOrders uberEats' }
            });
        } 
        if (!error) error = '';
        const msg = 'Failed to get orders.';
        const err = new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
          error: error.toString()
        });
        reject(err);
      }
    });
  }

  async sendPosConfirmation(order, token) {
    try {
      const options = {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + token
        }
      };
      const payload = { reason: 'Order has been accepted.' };
      const urlToConfirm =
        'https://api.uber.com/v1/eats/orders/' + order.id + '/accept_pos_order';
      let ordersConfirmation = await axios.post(urlToConfirm, payload, options);
      return ordersConfirmation;
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló sendPosConfirmation uberEats',
            error:{ error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló sendPosConfirmation uberEats',
              error: { error: 'Error inesperado en sendPosConfirmation uberEats' }
          });
      } 
      if (!error) error = '';
      const msg = 'Failed to confirm orders.';
      const err = new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
        error: error.toString()
      });
      return err;
    }
  }

  async sendPosDeny(order, token) {
    try {
      const options = {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + token
        }
      };
      const payload = {
        reason: {
          explanation: 'Restaurant Close',
          code: 'STORE_CLOSED',
          out_of_stock_items: [],
          invalid_items: []
        }
      };
      const urlToDeny =
        'https://api.uber.com/v1/eats/orders/' + order.id + '/deny_pos_order';
      let ordersDeny = await axios.post(urlToDeny, payload, options);
      return ordersDeny;
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló sendPosDeny uberEats',
            error:{ error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló sendPosDeny uberEats',
              error: { error: 'Error inesperado en sendPosDeny uberEats' }
          });
      }
      if (!error) error = '';
      const msg = 'Failed to confirm orders.';
      const err = new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
        error: error.toString()
      });
      return err;
    }
  }

  /**
   *
   * @override
   */
  importParser() {
    return require('../../interfaces/uberEats');
  }
}

export default UberEats;
