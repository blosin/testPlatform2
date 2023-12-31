'use strict';
import Platform from '../platform';
import NewsStateSingleton from '../../../utils/newsState';
import NewsTypesSingleton from '../../../utils/newsType';
import RejectedMessagesSingleton from '../../../utils/rejectedMessages';
import orderModel from '../../../models/order';
import branchModel from '../../../models/branch';
import logger, { data } from '../../../config/logger';
import moment from 'moment';
import CustomError from '../../../utils/errors/customError';
import { APP_PLATFORM } from '../../../utils/errors/codeError';
import UUID from '../../../utils/errors/utils';

import Credentials from '../../sdk/pedidosYa/src/lib/http/Credentials';
import ApiClient from '../../sdk/pedidosYa/src/lib/ApiClient';
import PaginationOptions from '../../sdk/pedidosYa/src/lib/utils/PaginationOptions';
import Environments from '../../sdk/pedidosYa/src/lib/http/Environments';
import Aws from '../../../platforms/provider/aws';
import settings from '../../../config/settings';
import cron from 'node-cron';
import axios from 'axios';
import logError from '../../../models/logError';

class PedidosYa extends Platform {
  constructor(platform) {
    super(platform);
    this.urlRejected = 'v2/order/status';
    this.urlConfirmed = 'v2/order/status';
    this.urlDispatchedVendor = 'v2/order/status';
    this.urlDispatched = 'v2/orders';
    this.urlDelivered = 'EntregarPedido';
    this.urlRejectedType = 'v2/order/status';
    this.urlDeliveryTime = 'TiemposEntrega';
    this._platform = platform;
    this.tokenPeya = '';
    this.init();
    this.cronGetPlatformParameters();
  }

  async init() {
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data
    )
      if (
        this._platform.credentials.data.clientId &&
        this._platform.credentials.data.clientSecret &&
        this._platform.credentials.data.environment
      ) {
        try {
          this.credentials = new Credentials();
          this.credentials.clientId = this._platform.credentials.data.clientId;
          this.credentials.clientSecret =
            this._platform.credentials.data.clientSecret;
          this.credentials.environment =
            Environments[this._platform.credentials.data.environment];
          this.statusResponse = this._platform.statusResponse;
          this._api = new ApiClient(this.credentials);
          this.peyaLogin();
          this.getOrders();
          console.log(`${this._platform.name}.\t Inicializated.`);
        } catch (error) {
          const msg = 'Can not initializate PY.';
          new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
            platform: this._platform
          });
        }
      } else {
        const msg = 'Can not initializate PY.';
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
  }

  async peyaLogin() {
    try {
      const dataSend = new URLSearchParams();
      dataSend.append('username', settings.peyaParams.username);
      dataSend.append('password', settings.peyaParams.password);
      dataSend.append('grant_type', settings.peyaParams.grant_type);
      const configData = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      await axios.post(`${this._platform.credentials.data.baseUrl}/v2/login`, dataSend.toString(), configData).then(r => {

        this.tokenPeya = r.data.access_token;

      });
    }
    catch (error) {
      try {
        logError.create({
          message: 'Falló peyaLogin',
          error: { error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló peyaLogin',
          error: { error: 'Error inesperado en peyaLogin' }
        });
      }
    }
  }

  /**
   *
   * @override
   */
  importParser() {
    try {
      return require('../../interfaces/pedidosYa');
    } catch (error) {
      try {
        logError.create({
          message: 'Falló importParser Peya',
          error: { error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló importParser Peya',
          error: { error: 'Error inesperado en importParser Peya' }
        });
      }
      throw error;
    }
  }

  async getOrders() {
    try {
      await this._api.order.getAll(
        null,
        PaginationOptions.create(),
        (data) => {
          this.uuid = UUID();
          this.interactWithOrders(data)

        },
        (error) => {
          const msg = 'Fallo al obtener ordenes de PY.';
          new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
            platformError: error.toString()
          });
        }
      );
    }
    catch (error) {
      try {
        logError.create({
          message: 'Falló getOrders Peya',
          error: { error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló getOrders Peya',
          error: { error: 'Error inesperado en getOrders Peya' }
        });
      }
      throw error;
    }
  }


  /**
   * @override
   * Get platform rejectedMessages
   * */
  getDeliveryTimes() {
    try {
      if (this.statusResponse.deliveryTimes) {
        return this._api.order.deliveryTime.getAll();
      }
      else {
        return new Promise(async (resolve) => {
          try {
            let deliveryTimes = [];
            deliveryTimes = require('../../../assets/deliveryTimes').generic;
            deliveryTimes.forEach(
              (obj) => (obj.platformId = this._platform.internalCode)
            );
            resolve(deliveryTimes);
          } catch (error) {
            try {
              logError.create({
                message: 'Falló getDeliveryTimes Peya',
                error: { error: error.toString(), message: error.message, stack: error.stack }
              });
            } catch (ex) {
              logError.create({
                message: 'Falló getDeliveryTimes Peya',
                error: { error: 'Error inesperado en getDeliveryTimes Peya' }
              });
            }
            const msg = 'Can not get parameters of ThirdParty.';
            const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
              platformError: error
            });
            resolve(err);
          }
        });
      }
    }
    catch (error) {
      try {
        logError.create({
          message: 'Falló getDeliveryTimes Peya 2',
          error: { error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló getDeliveryTimes Peya 2',
          error: { error: 'Error inesperado en getDeliveryTimes Peya' }
        });
      }
    }
  }

  /**
   * @override
   * Get platform rejectedMessages
   * */
  getRejectedMessages() {
    if (this.statusResponse.rejectedMessages) {
      try {
        return new Promise(async (resolve, reject) => {
          let data = await this._api.order.rejectMessage.getAll();
          let negatives = require('../../../assets/rejectedMessages').negatives;
          let peyaRejects = require('../../../assets/rejectedMessages').peyaRejects;
          data = data.concat(negatives);
          data = data.concat(peyaRejects);
          resolve(data);
        });
      } catch (error) {
        try {
          logError.create({
            message: 'Falló getRejectedMessages Peya 1',
            error: { error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló getRejectedMessages Peya 1',
            error: { error: 'Error inesperado en getRejectedMessages Peya' }
          });
        }
      }

    }
    else {
      return new Promise(async (resolve) => {
        try {
          let data = [];
          data = require('../../../assets/rejectedMessages').generic;
          const negatives =
            require('../../../assets/rejectedMessages').negatives;
          let peyaRejects = require('../../../assets/rejectedMessages').peyaRejects;
          data = data.concat(negatives);
          data = data.concat(peyaRejects);
          data.forEach((obj) => (obj.platformId = this._platform.internalCode));
          resolve(data);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló getRejectedMessages Peya 2',
              error: { error: error.toString(), message: error.message, stack: error.stack }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló getRejectedMessages Peya 2',
              error: { error: 'Error inesperado en getRejectedMessages Peya' }
            });
          }
          const msg = 'Can not get parameters of ThirdParty.';
          const err = new CustomError(APP_BRANCH.PARAMS, msg, this.uuid, {
            platformError: error
          });
          resolve(err);
        }
      });
    }

  }

  initRestaurant(idRef) {
    return new Promise(async (resolve, reject) => {
      try {
        const version = {
          os: 'Docker container',
          app: '0.0.1'
        };
        await this._api.event.initialization(version, idRef);
        resolve();
      } catch (error) {
        try {
          logError.create({
            message: 'Falló initRestaurant Peya',
            error: { error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló initRestaurant Peya',
            error: { error: 'Error inesperado en initRestaurant Peya' }
          });
        }
        if (!error) error = '';
        const msg = 'No se pudo inicializar el restaurant.';
        const err = new CustomError(APP_PLATFORM.INIT, msg, this.uuid, {
          idRef,
          platformError: error.toString()
        });
        reject(err);
      }
    });
  }

  async interactWithOrders(data) {
    this.updateLastContact();
    try {
      const savedOrder = await orderModel.findOne({
        'order.id': data.id,
        internalCode: this._platform.internalCode
      });
      if (data.state == NewsStateSingleton.stateByCod('pend')) {
        if (!savedOrder) {
          data.driver = {};
          if (data.logistics) data.driver = await this.retriveDriver(data);
          this.saveNewOrders(data, this._platform);
        } else {
          console.log('La orden ya esta guardada');
        }
      }
      // ------ REJECTED
      else if (
        data.state == NewsStateSingleton.stateByCod('rej') &&
        !!savedOrder &&
        savedOrder.state != NewsStateSingleton.stateByCod('rej') &&
        savedOrder.state != NewsStateSingleton.stateByCod('rej_closed')
      ) {
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
          };
          const result = await this.updateNewsState(
            savedOrder.order,
            statusId,
            typeId,
            viewed,
            'PLATFORM',
            rejectedExtraData
          );
          const aws = new Aws();

          const searchBranch = (
            await branchModel.find({ branchId: savedOrder.branchId }).lean()
          ).pop();

          if (
            searchBranch.platforms[0].isActive &&
            parseFloat(searchBranch.smartfran_sw.agent.installedVersion) > 1.24
          ) {
            result['viewed'] = null;
            //Push all savedNews to the queue
            await aws.pushNewToQueue(result);
          }
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      try {
        logError.create({
          message: 'Falló interactWithOrders Peya',
          error: { error: error.toString(), message: error.message, stack: error.stack, data: data }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló interactWithOrders Peya',
          error: { error: 'Error inesperado en interactWithOrders Peya' }
        });
      }
      const msg = 'No se pudo procesar la orden entrante.';
      new CustomError(APP_PLATFORM.GETORD, msg, this.uuid, {
        orderId: data.id,
        platformError: error.toString()
      });
    }
  }

  /**
   * @param {*} order
   * @override
   */
  async receiveOrder(order) {
    let fullOrder = await orderModel.findOne({
      'order.code': order.id
    });

    if (fullOrder && fullOrder.order.peya) {
      return new Promise(async (resolve) => {
        resolve(false);
      });
    }
    return new Promise(async (resolve) => {
      try {
        console.log('receive');
        if (this.statusResponse.receive) {
          const branch = await branchModel.findOne({
            branchId: order.branchId
          });
          const platformBranch = this.getBranchPlatform(
            branch.platforms,
            this._platform._id
          );
          const idRef = platformBranch.branchReference.toString();
          let res = await this._api.event.reception(order.id, idRef);
          if (!res) res = true;
          return resolve(res);
        } else resolve(false);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló receiveOrder Peya ' + order.id,
            error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló receiveOrder Peya',
            error: { error: 'Error inesperado en receiveOrder Peya' }
          });
        }
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
  async viewOrder(order) {
    let fullOrder = await orderModel.findOne({
      'order.code': order.id
    });
    if (fullOrder && fullOrder.order.peya) {
      return new Promise(async (resolve) => {
        try {
          const state = NewsStateSingleton.stateByCod('view');
          await this.updateOrderState(order, state);
          resolve(false);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló viewOrder Peya ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló viewOrder Peya',
              error: { error: 'Error inesperado en viewOrder Peya' }
            });
          }
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
    return new Promise(async (resolve) => {
      let idRef = '';
      try {
        console.log('view');
        const state = NewsStateSingleton.stateByCod('view');
        await this.updateOrderState(order, state);
        if (this.statusResponse.view) {
          const branch = await branchModel.findOne({
            branchId: order.branchId
          });
          const platformBranch = this.getBranchPlatform(
            branch.platforms,
            this._platform._id
          );
          idRef = platformBranch.branchReference.toString();

          this.updateLastContact();

          let res = await this._api.event.acknowledgement(order.id, idRef);
          if (!res) res = true;
          return resolve(res);
        } else resolve(false);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló viewOrder Peya 2 ' + order.id,
            error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló viewOrder Peya 2',
            error: { error: 'Error inesperado en viewOrder Peya' }
          });
        }
        if (!error) error = '';
        let msg = 'Failed to send the viewed status.';
        new CustomError(APP_PLATFORM.VIEW, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
        try {
          let res = await this._api.event.acknowledgement(order.id, idRef);
          if (!res) res = true;
          return resolve(res);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló viewOrder Peya 3 ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló viewOrder Peya 3',
              error: { error: 'Error inesperado en viewOrder Peya' }
            });
          }
          if (!error) error = '';
          msg = 'Failed to send the viewed status. 2 intento';
          const err = new CustomError(APP_PLATFORM.VIEW, msg, this.uuid, {
            error: error.toString()
          });
          resolve(err);
        }
      }
    });
  }

  /**
   * @param {*} order
   * @param {*} deliveryTimeId
   * @override
   */
  async confirmOrder(order, deliveryTimeId) {

    let fullOrder = await orderModel.findOne({
      'order.code': order.id
    });

    if (fullOrder && fullOrder.order.peya) {
      return new Promise(async (resolve) => {
        try {
          const state = NewsStateSingleton.stateByCod('confirm');
          await this.updateOrderState(order, state);

          const body = {
            acceptanceTime: deliveryTimeId,
            remoteOrderId: order.id,
            status: 'order_accepted'
          };
          const headersConfig = {
            headers: {
              'Authorization': `Bearer ${this.tokenPeya}`,
              'Content-Type': 'application/json'
            }
          };

          const url = `${this._platform.credentials.data.baseUrl}/${this.urlConfirmed}/${fullOrder.order.token}`;

          const res = await axios.post(url, body, headersConfig);
          resolve(true);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló confirmOrder Peya ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order, deliveryTimeId: deliveryTimeId }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló confirmOrder Peya',
              error: { error: 'Error inesperado en confirmOrder Peya' }
            });
          }
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

    return new Promise(async (resolve) => {
      try {
        console.log('confirm');
        this.updateLastContact();
        const state = NewsStateSingleton.stateByCod('confirm');
        await this.updateOrderState(order, state);
        if (this.statusResponse.confirm) {
          let res;
          if (order.preOrder || !order.ownDelivery) {
            res = await this._api.order.confirm(order.id);
          } else {
            res = await this._api.order.confirm(order.id, deliveryTimeId);
          }
          return resolve(res);
        } else resolve(false);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló confirmOrder Peya 2 ' + order.id,
            error: { error: error.toString(), message: error.message, stack: error.stack, order: order, deliveryTimeId: deliveryTimeId }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló confirmOrder Peya 2',
            error: { error: 'Error inesperado en confirmOrder Peya' }
          });
        }
        if (!error) error = '';
        let msg = 'Failed to send the rejected status.';
        new CustomError(APP_PLATFORM.CONFIRM, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });
        try {
          let res;
          //Se envia de nuevo
          if (order.preOrder || !order.ownDelivery) {
            res = await this._api.order.confirm(order.id);
          } else {
            res = await this._api.order.confirm(order.id, deliveryTimeId);
          }
          resolve(res);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló confirmOrder Peya 3 ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order, deliveryTimeId: deliveryTimeId }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló confirmOrder Peya 3',
              error: { error: 'Error inesperado en confirmOrder Peya' }
            });
          }
          if (!error) error = '';
          msg = 'Failed to send the rejected status. 2 intento';
          const err = new CustomError(APP_PLATFORM.CONFIRM, msg, this.uuid, {
            error: error.toString()
          });
          resolve(err);
        }
      }
    });
  }

  /**
   * @param {*} orderId
   * @param {*} rejectMessageId
   * @param {*} rejectMessageNote
   * @override
   */
  async branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
    try {
      let fullOrder = await orderModel.findOne({
        'order.code': order.id
      });

      const peyaRejectsToSearch =
        require('../../../assets/rejectedMessages').peyaRejectsToSearch;
      let message = peyaRejectsToSearch.find(r => r.id == rejectMessageId);
      if (fullOrder && fullOrder.order.peya) {
        let body = undefined;
        if (message)
          body = {
            message: message.message,
            reason: message.reason,
            status: "order_rejected"
          };
        else
          body = {
            message: 'Producto no disponible',//rejectMessageNote,
            reason: 'ITEM_UNAVAILABLE',//rejectMessageNote,
            status: "order_rejected"
          };
        return new Promise(async (resolve) => {
          try {
            const state = NewsStateSingleton.stateByCod('rej');
            await this.updateOrderState(order, state);

            const headersConfig = {
              headers: {
                'Authorization': `Bearer ${this.tokenPeya}`,
                'Content-Type': 'application/json'
              }
            };

            const url = `${this._platform.credentials.data.baseUrl}/${this.urlRejected}/${fullOrder.order.token}`;
            const res = await axios.post(url, body, headersConfig);
            resolve(true);
          } catch (error) {
            try {
              logError.create({
                message: 'Falló branchRejectOrder Peya 1 ' + order.id,
                error: { error: error.toString(), message: error.message, stack: error.stack, order: order, rejectMessageId: rejectMessageId, rejectMessageNote: rejectMessageNote }
              });
            } catch (ex) {
              logError.create({
                message: 'Falló branchRejectOrder Peya 1',
                error: { error: 'Error inesperado en branchRejectOrder Peya' }
              });
            }
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
      return new Promise(async (resolve) => {
        try {

          console.log('reject');
          this.updateLastContact();
          const state = NewsStateSingleton.stateByCod('rej');
          await this.updateOrderState(order, state);
          if (this.statusResponse.reject) {
            let res = undefined;
            if (message)
              res = await this._api.order.reject(
                order.id,
                7,
                'Faltan productos para tu pedido'
              );
            else
              res = await this._api.order.reject(
                order.id,
                rejectMessageId,
                rejectMessageNote
              );
            resolve(res);
          } else resolve(false);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló branchRejectOrder Peya 2 ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order, rejectMessageId: rejectMessageId, rejectMessageNote: rejectMessageNote }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló branchRejectOrder Peya 2',
              error: { error: 'Error inesperado en branchRejectOrder Peya' }
            });
          }
          if (!error) error = '';
          let msg = 'Failed to send the rejected status.';
          new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, {
            orderId: order.id ? order.id.toString() : '-',
            branchId: order.branchId ? order.branchId.toString() : '-',
            platformId: order.platformId ? order.platformId.toString() : '-',
            error: error.toString()
          });

          try {
            //Se envia de nuevo
            const res = await this._api.order.reject(
              order.id,
              rejectMessageId,
              rejectMessageNote
            );
            resolve(res);
          } catch (error) {
            try {
              logError.create({
                message: 'Falló branchRejectOrder Peya 3 ' + order.id,
                error: { error: error.toString(), message: error.message, stack: error.stack, order: order, rejectMessageId: rejectMessageId, rejectMessageNote: rejectMessageNote }
              });
            } catch (ex) {
              logError.create({
                message: 'Falló branchRejectOrder Peya 3',
                error: { error: 'Error inesperado en branchRejectOrder Peya' }
              });
            }
            if (!error) error = '';
            msg = 'Failed to send the rejected status. 2 intento';
            const err = new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, {
              error: error.toString()
            });
            resolve(err);
          }
        }
      });
    } catch (error) {
      try {
        logError.create({
          message: 'Falló branchRejectOrder Peya ' + order.id,
          error: { error: error.toString(), message: error.message, stack: error.stack, order: order, rejectMessageId: rejectMessageId, rejectMessageNote: rejectMessageNote }
        });
      } catch (ex) {
        logError.create({
          message: 'Falló branchRejectOrder Peya',
          error: { error: 'Error inesperado en branchRejectOrder Peya' }
        });
      }
      msg = 'Failed to send the rejected status. 3 intento';
      const err = new CustomError(APP_PLATFORM.REJECT, msg, this.uuid, {
        error: error.toString()
      });
      resolve(err);
    }
  }

  /**
   * @param {*} order
   * @override
   */
  async dispatchOrder(order) {
    let fullOrder = await orderModel.findOne({
      'order.code': order.id
    });

    if (fullOrder && fullOrder.order.peya) {
      // const token = fullOrder.order.token.split('-_-');
      // fullOrder.order.token = `${token[0]}-_-${token[1]}`;

      return new Promise(async (resolve) => {
        try {
          const state = NewsStateSingleton.stateByCod('dispatch');
          await this.updateOrderState(order, state);
          const headersConfig = {
            headers: {
              'Authorization': `Bearer ${this.tokenPeya}`,
              'Content-Type': 'application/json'
            }
          };

          if (fullOrder.order.expeditionType.trim() == 'pickup' || (fullOrder?.order?.delivery?.riderPickupTime === null)) {
            const body = {
              status: 'order_picked_up'
            };
            const url = `${this._platform.credentials.data.baseUrl}/${this.urlDispatchedVendor}/${fullOrder.order.token}`;
            const res = await axios.post(url, body, headersConfig);
            resolve(true);
          }
          else {
            const url = `${this._platform.credentials.data.baseUrl}/${this.urlDispatched}/${fullOrder.order.token}/preparation-completed`
            const res = await axios.post(url, null, headersConfig);
            resolve(true);
          }
        } catch (error) {
          try {
            logError.create({
              message: 'Falló dispatchOrder Peya ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló dispatchOrder Peya',
              error: { error: 'Error inesperado en dispatchOrder Peya' }
            });
          }
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
    return new Promise(async (resolve) => {
      try {
        console.log('dispatch');
        this.updateLastContact();
        const state = NewsStateSingleton.stateByCod('dispatch');
        await this.updateOrderState(order, state);
        if (this.statusResponse.dispatch) {
          let res = {};
          if (order.ownDelivery) {
            res = await this._api.order.dispatch(order);
          }
          return resolve(res);
        } else resolve(false);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló dispatchOrder Peya 2 ' + order.id,
            error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló dispatchOrder Peya 2',
            error: { error: 'Error inesperado en dispatchOrder Peya' }
          });
        }
        if (!error) error = '';
        let msg = 'Failed to send the dispatched status.';
        new CustomError(APP_PLATFORM.DISPATCH, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          error: error.toString()
        });

        try {
          if (order.ownDelivery) {
            await this._api.order.dispatch(order);
          }
          let res = {};
          if (order.ownDelivery) {
            res = await this._api.order.dispatch(order);
          }
          return resolve(res);
        } catch (error) {
          try {
            logError.create({
              message: 'Falló dispatchOrder Peya 3 ' + order.id,
              error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
            logError.create({
              message: 'Falló dispatchOrder Peya 3',
              error: { error: 'Error inesperado en dispatchOrder Peya' }
            });
          }
          if (!error) error = '';
          msg = 'Failed to send the dispatched status. 2 intento';
          const err = new CustomError(APP_PLATFORM.DISPATCH, msg, this.uuid, {
            error: error.toString()
          });
          resolve(err);
        }
      }
    });
  }

  callHeartBeat(branch) {
    return new Promise(async (resolve, reject) => {
      try {
        if (branch && branch.platforms) {
          const platformBranch = this.getBranchPlatform(
            branch.platforms,
            this._platform._id
          );

          if (platformBranch) {
            const hbProm = platformBranch.branchIdReference
              .toString()
              .split(';')
              .map((idRef) => this._api.event.heartBeat(parseInt(idRef, 10)));
            const hb = await Promise.all(hbProm);
            this.updateLastContact();
            console.log('HB sended');
            resolve(hb);
          } else {
            resolve();
          }
        } else {
          throw `Can not send the heartbeat.`;
        }
      } catch (error) {
        // try { 
        //   logError.create({
        //       message: 'Falló callHeartBeat Peya',
        //       error:{ error: error.toString(), message: error.message, stack: error.stack, branch:branch }
        //   });
        // } catch (ex) {
        //     logError.create({
        //         message: 'Falló callHeartBeat Peya',
        //         error: { error: 'Error inesperado en callHeartBeat Peya' }
        //     });
        // }
        if (!error) error = '';
        const msg = 'Failed to call the heartbeat.';
        const err = new CustomError(APP_PLATFORM.HEARTBEAT, msg, this.uuid, {
          branchId: branch ? branch.branchId : 'Sin branch',
          error: error.toString()
        });
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
        const platformBranch = this.getBranchPlatform(
          branch.platforms,
          this._platform._id
        );
        const closedProg = branchModel.findProgClosedToOpen(
          platformBranch,
          dateNow
        );

        if (typeof closedProg == 'string') {
          const msg = `${closedProg} RestaurantCode: ${branch.branchId}.`;
          logger.error({ message: msg, meta: { dateNow } });
          return reject(msg);
        }

        const dateFrom = moment(dateNow)
          .add(branch.tzo, 'h')
          .format('YYYY-MM-DDTHH:mm:ss');
        const dateFromUTC = moment(dateNow);
        const idRef = platformBranch.branchIdReference;
        let opened = await this._api.restaurant.open(idRef, dateFrom);

        await branchModel.updateOne(
          {
            branchId: branch.branchId,
            'platforms.platform': this._platform._id
          },
          {
            $set: {
              'platforms.$.progClosed.$[i].open': dateFromUTC
            }
          },
          {
            arrayFilters: [{ 'i._id': closedProg._id }]
          }
        );

        this.updateLastContact();
        resolve(opened);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló openRestaurant Peya',
            error: { error: error.toString(), message: error.message, stack: error.stack, branchId: branchId }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló openRestaurant Peya',
            error: { error: 'Error inesperado en openRestaurant Peya' }
          });
        }
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
        const platformBranch = this.getBranchPlatform(
          branch.platforms,
          this._platform._id
        );
        const validatedClosed = branchModel.validateNewProgClosed(
          platformBranch,
          dateNow,
          timeToClose
        );

        const dateFrom = moment(dateNow)
          .add(branch.tzo, 'h')
          .format('YYYY-MM-DDTHH:mm:ss');
        const dateTo = moment(dateNow)
          .add(branch.tzo, 'h')
          .add(timeToClose, 'm')
          .format('YYYY-MM-DDTHH:mm:ss');
        const dateFromUTC = moment(dateNow);
        const dateToUTC = moment(dateNow).add(timeToClose, 'm');

        if (validatedClosed != '')
          throw `${validatedClosed} RestaurantCode: ${branch.branchId}.`;

        const idRef = platformBranch.branchIdReference;

        let closed = await this._api.restaurant.close(
          idRef,
          dateFrom,
          dateTo,
          description
        );

        await branchModel.updateOne(
          {
            branchId: branch.branchId,
            'platforms.platform': this._platform._id
          },
          {
            $push: {
              'platforms.$.progClosed': {
                close: dateFromUTC,
                open: dateToUTC,
                description
              }
            }
          }
        );

        this.updateLastContact;
        resolve(closed);
      } catch (error) {
        try {
          logError.create({
            message: 'Falló closeRestaurant Peya',
            error: { error: error.toString(), message: error.message, stack: error.stack, branchId: branchId }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló closeRestaurant Peya',
            error: { error: 'Error inesperado en closeRestaurant Peya' }
          });
        }
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
          if (!!resPY.driver && !!resPY.driver.name)
            resPY.name = resPY.driver.name;
          else resPY.name = orderTracking.name;

          resPY.driver = null;
          orderTracking = resPY;
        }
      } catch (error) {
        try {
          logError.create({
            message: 'Falló retriveDriver Peya',
            error: { error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
          logError.create({
            message: 'Falló retriveDriver Peya',
            error: { error: 'Error inesperado en retriveDriver Peya' }
          });
        }
        const msg = 'No se pudo obtener el driver de la orden.';
        new CustomError(APP_PLATFORM.DRIVER, msg, this.uuid, {
          orderId: order.id ? order.id.toString() : '-',
          branchId: order.branchId ? order.branchId.toString() : '-',
          platformId: order.platformId ? order.platformId.toString() : '-',
          platformError: error.toString()
        });
      }
      resolve(orderTracking);
    });
  }
}

export default PedidosYa;
