'use strict';
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import cron from 'node-cron';
import axios from 'axios';
import CustomError from '../../../utils/errors/customError';
import { APP_PLATFORM } from '../../../utils/errors/codeError';
import UUID from '../../../utils/errors/utils';

class Rappi extends Platform {
  constructor(platform) {
    super(platform);
    this.urlLogin = 'login';
    this.urlGetOrders = '/api/v2/restaurants-integrations-public-api/orders';
    this.urlConfirmOrders =
      '/api/v2/restaurants-integrations-public-api/orders/';
    this.urlRejectOrders =
      '/api/v2/restaurants-integrations-public-api/orders/';
    this.urlAuth =
      process.env.NODE_ENV == 'produccion'
        ? 'https://rests-integrations.auth0.com/oauth/token'
        : 'https://rests-integrations-dev.auth0.com/oauth/token';

    if (process.env.NODE_ENV != 'testing') {
      this.init();
      this.cronGetPlatformParameters();
    }
  }

  async init() {
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data &&
      this._platform.credentials.data.token
    ) {
      this.token = this._platform.credentials.data.token;
      this.baseUrl = JSON.parse(this._platform.credentials.data.baseUrl);
      const schedule = this._platform.credentials.data.schedule;
      this.statusResponse = this._platform.statusResponse;
      this.clientId = this._platform.credentials.data.clientId;
      this.clientSecret = this._platform.credentials.data.clientSecret;
      cron.schedule(schedule, () => {
        this.uuid = UUID();
        this.loginGetOrders();
      });
      console.log(`${this._platform.name}.\t\t Inicializated.`);
    } else {
      const msg = 'Can not initializate Rappi.';
      new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
        platform: this._platform
      });
    }
  }

  async loginGetOrders() {
    this.loginToAuth0()
      .then((xAuth) => {
        for (const property in this.baseUrl) {
          this.getOrders(xAuth, this.baseUrl[property]);
        }
      })
      .catch((error) => {
        if (!error) error = '';
        const msg = 'Failed to login.';
        new CustomError(APP_PLATFORM.LOGIN, msg, this.uuid, {
          error: error.toString()
        });
      });
  }

  async loginToAuth0() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = this.urlAuth;

        const payload = {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          audience: 'https://int-public-api-v2/api'
        };
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        let response = await axios.post(url, JSON.stringify(payload), config);
        if (!response) throw 'Can not login to Rappi.';
        this.updateLastContact();
        resolve(response.data.access_token);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to login. Auth0 Rappi';
        const err = new CustomError(APP_PLATFORM.LOGIN, msg, this.uuid, {
          error: error.toString()
        });
        reject(err);
      }
    });
  }
  /* 
  loginToRappi() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = this.baseUrl + this.urlLogin;
        let response = await axios.post(url, {
          token: this.token
        });
        if (!response) throw 'Can not login to rappi.';
        this.updateLastContact();
        resolve(response['headers']['x-auth-int']);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to login.';
        const err = new CustomError(APP_PLATFORM.LOGIN, msg, this.uuid, {
          error: error.toString()
        });
        reject(err);
      }
    });
  } */

  /**
   * Find Rappi orders using the api.
   * @param xAuth aux-int generated by rappi after login.
   * @external Rappi
   */
  getOrders(xAuth, urlBase) {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          headers: {
            accept: 'application/json',
            'x-authorization': 'bearer ' + xAuth
          }
        };

        let url =
          process.env.NODE_ENV == 'produccion'
            ? urlBase
            : 'https://microservices.dev.rappi.com';

        url += this.urlGetOrders;

        const response = await axios.get(url, options);
        let result, saved;
        console.log('rappi', response.data);
        if (!!response.data[0]) {
          saved = response.data.map((data) =>
            this.saveNewOrders(data, this._platform)
          );
          if (saved) {
            await Promise.allSettled(saved).then((resultProm) => {
              result = resultProm
                .filter((res) => res.status === 'fulfilled')
                .map((res) => res.value);
            });
          }
        }
        resolve(result);
      } catch (error) {
        if (!error) error = '';
        const msg = 'Failed to get orders.';
        const err = new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
          error: error.toString()
        });
        reject(err);
      }
    });
  }

  /**
   *
   * @param {*} order
   * @override
   */
  receiveOrder(order) {
    return new Promise(async (resolve) => {
      try {
        if (this.statusResponse.receive) {
          /* LOGIN  */
          const xAuth = await this.loginToAuth0();

          /* SEND CONFIRMED */
          const options = {
            headers: {
              accept: 'application/json',
              'x-authorization': 'bearer ' + xAuth
            }
          };
          let url =
            process.env.NODE_ENV == 'produccion'
              ? this.baseUrl[order.country] +
                this.urlConfirmOrders +
                order.id +
                '/take'
              : 'https://microservices.dev.rappi.com' +
                this.urlConfirmOrders +
                order.id +
                '/take';

          const res = await axios.put(url, options);
          resolve(true);
        } else resolve(false);
      } catch (error) {
        /* Reject the order automatically. */
        this.rejectWrongOrderAutomatically(order.id);
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
  branchRejectOrder(order, rejectId, rejectDesc) {
    return new Promise(async (resolve) => {
      try {
        /* UPDATE ORDER */
        const state = NewsStateSingleton.stateByCod('rej');
        await this.updateOrderState(order, state);

        if (this.statusResponse.reject) {
          /* LOGIN  */
          const xAuth = await this.loginToAuth0();

          const options = {
            headers: {
              accept: 'application/json',
              'x-authorization': 'bearer ' + xAuth
            }
          };
          /* SEND REJECT */
          let url =
            process.env.NODE_ENV == 'produccion'
              ? this.baseUrl[order.country] +
                this.urlRejectOrders +
                order.id +
                '/reject'
              : 'https://microservices.dev.rappi.com' +
                this.urlRejectOrders +
                order.id +
                '/reject';

          const data = {
            reason: rejectDesc
          };
          const res = await axios.post(url, data, options);
          resolve(res.data);
        } else resolve(false);
      } catch (error) {
        /* Reject the order automatically. */
        this.rejectWrongOrderAutomatically(order.id);
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
   *
   * @override
   */
  importParser() {
    return require('../../interfaces/rappi');
  }
}

export default Rappi;
