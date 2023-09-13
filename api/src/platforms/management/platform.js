'use strict';
import moment from 'moment';
import cron from 'node-cron';
import logger, { log } from '../../config/logger';
import branchModel from '../../models/branch';
import deliveryTimeModel from '../../models/deliveryTime';
import newsModel from '../../models/news';
import orderModel from '../../models/order';
import platformModel from '../../models/platform';
import rejectedMessageModel from '../../models/rejectedMessage';
import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import RejectedMessagesSingleton from '../../utils/rejectedMessages';
import Aws from '../provider/aws';
import orderFailedModel from '../../models/orderFailed';
import logError from '../../models/logError';

class Platform {
  constructor(platform) {
    this._platform = platform;
    this.doesNotApply = 'n/a';
    this.parser = this.importParser();
    this.aws = new Aws();
  }
  /**
   * This cron is for update platform parameters in DB.
   * Can be overriden.
   */
  cronGetPlatformParameters() {
    const schedule = '55 * * * *';
    cron.schedule(schedule, () => this.getPlatformParameters());
  }

  /**
   * Can be overriden.
   * */
  getDeliveryTimes() {
    return new Promise((resolve) => {
      const data = require('../../assets/deliveryTimes').generic;
      data.forEach((obj) => (obj.platformId = this._platform.internalCode));
      resolve(data);
    });
  }

  /**
   * Can be overriden.
   * */
  getRejectedMessages() {
    return new Promise((resolve) => {
      let data = require('../../assets/rejectedMessages').generic;
      const negatives = require('../../assets/rejectedMessages').negatives;
      data = data.concat(negatives);
      data.forEach((obj) => (obj.platformId = this._platform.internalCode));
      resolve(data);
    });
  }

  /**
   * @override
   * Update platform parameters
   * */
  async getPlatformParameters() {
    try {
      const [rejectedMessages, deliveryTimes] = await Promise.all([
        this.getRejectedMessages(),
        this.getDeliveryTimes()
      ]);
      this.updateRejectedMessage(rejectedMessages);
      this.updateDeliveryTimes(deliveryTimes);
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló getPlatformParameters',
            error:{ error: error.toString(), message: error.message, stack: error.stack, internalCode: this._platform.internalCode}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló getPlatformParameters',
              error: { error: 'Error inesperado en getPlatformParameters' }
          });
      } 
    }
  }

  /**
   * Can be overriden.
   * */
  receiveOrder(order, branchId) {
    try {
      return Promise.resolve(this.doesNotApply);
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló receiveOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branchId: branchId }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló receiveOrder',
              error: { error: 'Error inesperado en receiveOrder' }
          });
      } 
    }
  }

  /**
   * Can be overriden.
   * */
  viewOrder(order, branchId) {
    try {
      return new Promise(async (resolve) => {
        const state = NewsStateSingleton.stateByCod('view');
        await this.updateOrderState(order, state);
        return resolve(this.doesNotApply);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló viewOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branchId: branchId }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló viewOrder',
              error: { error: 'Error inesperado en viewOrder' }
          });
      }
      throw error;     
    }
  }
  /**
   * Can be overriden.
   * */
  confirmOrder(order, branchId, deliveryTimeId) {
    try {
      return new Promise(async (resolve) => {
        const state = NewsStateSingleton.stateByCod('confirm');
        await this.updateOrderState(order, state);
        return resolve(this.doesNotApply);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló confirmOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branchId: branchId }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló confirmOrder',
              error: { error: 'Error inesperado en confirmOrder' }
          });
      }
      throw error;     
    }
  }

  /**
   * Can be overriden.
   * */
  dispatchOrder(order) {
    try {
      return new Promise(async (resolve) => {
        const state = NewsStateSingleton.stateByCod('dispatch');
        await this.updateOrderState(order, state);
        return resolve(this.doesNotApply);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló dispatchOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló dispatchOrder',
              error: { error: 'Error inesperado en dispatchOrder' }
          });
      }
      throw error;
    }
  }

  /**
   * Can be overriden.
   * */
  deliveryOrder(order) {
    try {
      return new Promise(async (resolve) => {
        const state = NewsStateSingleton.stateByCod('delivery');
        await this.updateOrderState(order, state);
        return resolve(this.doesNotApply);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló deliveryOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló deliveryOrder',
              error: { error: 'Error inesperado en deliveryOrder' }
          });
      }
      throw error;    
    }
  }

  /**
   * Can be overriden.
   * */
  branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
    try {
      return new Promise(async (resolve) => {
        const state = NewsStateSingleton.stateByCod('rej');
        await this.updateOrderState(order, state);
        return resolve(this.doesNotApply);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló branchRejectOrder',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló branchRejectOrder',
              error: { error: 'Error inesperado en branchRejectOrder' }
          });
      }
      throw error;
    }
  }

  retriveDriver(order) {
    try {
      return new Promise(async (resolve) => {
        const noDriver = {
          name: 'Sin Informacion',
          driver: null,
          pickupDate: null,
          estimatedDeliveryDate: null
        };
        return resolve(noDriver);
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló retriveDriver',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló retriveDriver',
              error: { error: 'Error inesperado en retriveDriver' }
          });
      }
      throw error;
    }
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
        resolve();
      }
      catch (error) {
        try { 
          logError.create({
              message: 'Falló openRestaurant',
              error:{ error: error.toString(), message: error.message, stack: error.stack, branchId: branchId}
          });
        } catch (ex) {
            logError.create({
                message: 'Falló openRestaurant',
                error: { error: 'Error inesperado en openRestaurant' }
            });
        }   
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
        resolve();
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló closeRestaurant',
              error:{ error: error.toString(), message: error.message, stack: error.stack, branchId: branchId}
          });
        } catch (ex) {
            logError.create({
                message: 'Falló closeRestaurant',
                error: { error: 'Error inesperado en closeRestaurant' }
            });
        } 
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
   *  This function reject automatically a wrong order if
   *  the user intend to receive/view/confirm/dispatch the order
   *  and the platform reject it for some reason.
   * @param {*} order
   */
  async rejectWrongOrderAutomatically(order) {
    try {
      const state = NewsStateSingleton.stateByCod('rej');
      await this.updateOrderState(order, state);
      const statusId = NewsStateSingleton.idByCod('rej');
      const typeId = NewsTypeSingleton.idByCod('rej_ord');
      const rej = RejectedMessagesSingleton.platformRejectedMessages;
      const rejectedExtraData = {
        rejectMessageId: rej.id,
        rejectMessageDescription: rej.name,
        rejectMessageNote: null,
        entity: 'CONCENTRADOR'
      };
      await this.updateNewsState(
        order,
        statusId,
        typeId,
        null,
        'CONCENTRADOR',
        rejectedExtraData
      );
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló rejectWrongOrderAutomatically',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order}
        });
      } catch (ex) {
          logError.create({
              message: 'Falló rejectWrongOrderAutomatically',
              error: { error: 'Error inesperado en rejectWrongOrderAutomatically' }
          });
      } 
      const msg = `Order: ${order.id}. Failed to reject automatically the order.`;
      error = { error: error.toString(), order };
      logger.error({ message: msg, meta: error });
    }
  }

  updateOrderState(order, state) {
    try {
      return orderModel.findOneAndUpdate(
        {
          originalId: order.originalId,
          internalCode: this._platform.internalCode,
          'extraData.rejected.rejectMessageId': {
            $ne: RejectedMessagesSingleton.closedResRejectedMessages.id
          }
        },
        {
          state,
          'order.state': state
        },
        {
          new: true
        }
      );
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló updateOrderState',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, state: state }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló updateOrderState',
              error: { error: 'Error inesperado en updateOrderState' }
          });
      } 
      const msg = 'Failed to update order state.';
      error = { order, state, error: error.toString() };
      logger.error({ message: msg, meta: error });
      return Promise.reject(msg);
    }
  }

  updateNewsState(
    order,
    statusId,
    typeId,
    viewed,
    entity,
    rejectedExtraData = null
  ) {
    try {
      const object = { typeId, orderStatusId: parseInt(statusId, 10) };
      let trace = newsModel.createTrace(object);
      trace.entity = entity;
      return newsModel.findOneAndUpdate(
        {
          'order.id': order.id,
          'order.platformId': this._platform.internalCode,
          typeId: {
            $ne: NewsTypeSingleton.idByCod('rej_closed_ord')
          }
        },
        {
          typeId,
          viewed,
          'extraData.rejected': rejectedExtraData,
          'order.statusId': parseInt(statusId, 10),
          $push: { traces: trace }
        },
        {
          new: true
        }
      );
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló updateNewsState',
            error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló updateNewsState',
              error: { error: 'Error inesperado en updateNewsState' }
          });
      }
      const msg = 'Failed to update news state.';
      const formatError = {
        order,
        statusId,
        typeId,
        viewed,
        entity,
        error: error.toString()
      };
      logger.error({ message: msg, meta: formatError });
      return Promise.reject(msg);
    }
  }

  async updateLastContact() {
    try {
      await platformModel.updateOne(
        {
          internalCode: this._platform.internalCode
        },
        {
          $set: { lastContact: new Date() }
        }
      );
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló updateLastContact',
            error:{ error: error.toString(), message: error.message, stack: error.stack, internalCode: this._platform.internalCode }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló updateLastContact',
              error: { error: 'Error inesperado en updateLastContact' }
          });
      }     
    }
  }

  getOrderById(id) {
    try {
      return orderModel
        .aggregate([
          {
            $match: {
              originalId: id,
              internalCode: this._platform.internalCode
            }
          },
          { $limit: 1 }
        ])
        .project({ order: true, _id: false })
        .then((ordersRes) => ordersRes.pop())
        .then((orderRes) => {
          if (orderRes) return { ...orderRes.order };
          else throw 'Order not found.';
        });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló getOrderById',
            error:{ error: error.toString(), message: error.message, stack: error.stack, id: id }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló getOrderById',
              error: { error: 'Error inesperado en getOrderById' }
          });
      }
    }
  }

  /**
   * Reject order by Platform rejection.
   * @param {*} orderId
   */
  rejectPlatformOrder(orderId) {
    return new Promise(async (resolve, reject) => {
      try {
        const state = NewsStateSingleton.stateByCod('rej');
        try {
          this.updateLastContact();
          await this.updateOrderState({ originalId: orderId }, state);
          resolve({
            id: orderId,
            state
          });
        } catch (error) {
          logger.error({ meta: { error: error.toString() } });
          throw error;
        }
      } catch (message) {
        try { 
          logError.create({
              message: 'Falló rejectPlatformOrder',
              error:{ error: error.toString(), message: error.message, stack: error.stack, orderId: orderId }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló rejectPlatformOrder',
                error: { error: 'Error inesperado en rejectPlatformOrder' }
            });
        }
        logger.error({ message, meta: { originalId } });
        return reject(message);
      }
    });
  }

  findOrder(orderId) {
    this.updateLastContact();
    return new Promise(async (resolve, reject) => {
      try {
        let savedOrder;
        try {
          savedOrder = await orderModel
            .findOne({
              originalId: orderId,
              internalCode: this._platform.internalCode,
              state: { $ne: NewsStateSingleton.stateByCod('rej_closed') }
            })
            .lean();
        } catch (error) {
          throw error;
        }
        if (!savedOrder)
          return reject({
            orderId,
            error: `The order ${orderId} could not be found.`
          });
        return resolve(savedOrder.order);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló findOrder',
              error:{ error: error.toString(), message: error.message, stack: error.stack, orderId: orderId }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló findOrder',
                error: { error: 'Error inesperado en findOrder' }
            });
        }
        const errBody = { orderId, error: error.toString() };
        logger.error({ meta: errBody });
        return reject(errBody);
      }
    });
  }

  /**
    Find the branchPlatform of the branch selected.
    @param platforms branch platforms.
    @returns branchPlatform with its data.
    */
  getBranchPlatform(platforms, platformId) {
    try {
      return platforms.find(
        (p) => p.platform.toString() == platformId.toString()
      );
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló getBranchPlatform',
            error:{ error: error.toString(), message: error.message, stack: error.stack, platformId: platformId,platforms:platforms }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló getBranchPlatform',
              error: { error: 'Error inesperado en getBranchPlatform' }
          });
      }
    }
  }

  /**
    Check if the restaruant is closed now.
    If it's open, return true.
    If it's closed, reject the order automatically and return false.
    @param branchPlatform 
    */
  isClosedRestaurant(branchPlatform, lastGetNew) {
    return new Promise(async (resolve) => {
      try {
        const timeToClose = 3;
        const dateNow = new Date();
        const diffLastGetNews = moment
          .duration(
            moment(dateNow, 'DD/MM/YYYY HH:mm:ss').diff(
              moment(new Date(lastGetNew), 'DD/MM/YYYY HH:mm:ss')
            )
          )
          .asMinutes();
        let closed = false;
        if (branchPlatform.progClosed && !!branchPlatform.progClosed.length) {
          closed =
            branchPlatform.progClosed.some(
              (cp) =>
                new Date(cp.close) <= dateNow && new Date(cp.open) >= dateNow
            ) || diffLastGetNews > timeToClose;
        } else if (diffLastGetNews > timeToClose) closed = true;
        return resolve(!closed);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló isClosedRestaurant',
              error:{ error: error.toString(), message: error.message, stack: error.stack, branchPlatform: branchPlatform, lastGetNew: lastGetNew }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló isClosedRestaurant',
                error: { error: 'Error inesperado en isClosedRestaurant' }
            });
        }
        error = { error: error.toString() };
        const msg = `Can not validate if restaurant is closed.`;
        logger.error({ message: msg, meta: error });
      }
    });
  }

  /**
   * Can be overriden.
   * */
  importParser() {
    try {
      return require('../interfaces/thirdParty');
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló importParser',
            error:{ error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló importParser',
              error: { error: 'Error inesperado en importParser' }
          });
      }
    }
  }

  /**
   * Validate the order before save.
   * */

  validateNewOrders(newOrder) {
    try {
      this.updateLastContact();
      return new Promise(async (resolve, reject) => {
        let orderSaved;
        const minOrders = this.parser.retriveMinimunData(newOrder);
        /* Validate  orders */
        let order = await orderModel
          .find({
            originalId: minOrders.originalId,
            internalCode: this._platform.internalCode,
            state: { $ne: NewsStateSingleton.stateByCod('rej_closed') }
          })
          .lean();

        if (order.length) {
          const error = `Order: ${order[0].originalId} already exists.`;
          logger.error({ message: error, meta: { newOrder } });
          return reject({ error });
        }

        /* Find branch associated to de references given by the platform */
        let foundBranch = await branchModel
          .findOne({
            'platforms.branchReference': minOrders.branchReference.toString(),
            'platforms.platform': this._platform._id.toString()
          })
          .lean();
        if (!foundBranch) {
          const error = `The branch not exists. ${minOrders.branchReference}`;
          logger.error({ message: error, meta: { newOrder } });
          return reject({ error });
        }
        if (foundBranch.autoReply && this._platform.autoReply) {
          this.saveNewOrdersAutomally(newOrder, foundBranch).then((res) => {
            orderSaved = {
              id: res.posId,
              state: res.state,
              branchId: res.order.branchId.toString()
            };
            return resolve(orderSaved);
          });
        } else {
          this.saveNewOrders(newOrder)
            .then((res) => {
              if (!res) throw 'Orders could not been processed.';

              if (foundBranch.branchId == res.order.branchId)
                orderSaved = {
                  id: res.posId,
                  state: res.state,
                  branchId: res.order.branchId.toString()
                };
              return resolve(orderSaved);
            })
            .catch((error) => {
              try { 
                logError.create({
                    message: 'Falló validateNewOrders 2',
                    error:{ error: error.toString(), message: error.message, stack: error.stack, newOrder: newOrder }
                });
              } catch (ex) {
                  logError.create({
                      message: 'Falló validateNewOrders 2',
                      error: { error: 'Error inesperado en validateNewOrders' }
                  });
              }
              reject(error);
            });
        }
      });
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló validateNewOrders',
            error:{ error: error.toString(), message: error.message, stack: error.stack, newOrder: newOrder }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló validateNewOrders',
              error: { error: 'Error inesperado en validateNewOrders' }
          });
      }
    }
  }

  getOrderBranches(branchReference) {
    try {
      const query = {
        'platforms.platform': this._platform._id,
        'platforms.branchReference': branchReference.toString()
      };
      return branchModel.aggregate([
        { $match: query },
        { $unwind: '$platforms' },
        { $match: query },
        {
          $lookup: {
            from: 'chains',
            localField: 'chain',
            foreignField: '_id',
            as: 'joinChains'
          }
        },
        {
          $lookup: {
            from: 'platforms',
            localField: 'platforms.platform',
            foreignField: '_id',
            as: 'joinPlatforms'
          }
        },
        {
          $lookup: {
            from: 'clients',
            localField: 'client',
            foreignField: '_id',
            as: 'joinClients'
          }
        },
        {
          $lookup: {
            from: 'regions',
            localField: 'address.region',
            foreignField: '_id',
            as: 'joinRegions'
          }
        },
        { $unwind: { path: '$joinChains', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$joinClients', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$joinPlatforms', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$joinRegions', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: '$name',
            branchId: '$branchId',
            'chain.chain': '$joinChains.chain',
            'platform.name': '$joinPlatforms.name',
            'platform.platform': '$joinPlatforms._id',
            lastGetNews: '$lastGetNews',
            'platform.progClosed': '$platforms.progClosed',
            'platform.isActive': '$platforms.isActive',
            'client.businessName': '$joinClients.businessName',
            'address.region': '$joinRegions.region',
            smartfran_sw: '$smartfran_sw',
            'address.country': '$address.country'
          }
        },
        {
          $limit: 1
        }
      ]);
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló getOrderBranches',
            error:{ error: error.toString(), message: error.message, stack: error.stack, branchReference: branchReference }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló getOrderBranches',
              error: { error: 'Error inesperado en getOrderBranches' }
          });
      }
    }    
  }

  /**
   *  Generate custom order and new for each one.
   *  Save them to database.
   *  @param order  order received from the platform.
   *   */
  saveNewOrders(order) {
    return new Promise(async (resolve, reject) => {
      let orderProccessed,
        newProccessed,
        promiseOrder,
        promiseNew,
        branch,
        isOpened;

      const { posId, originalId, displayId, branchReference } =
        this.parser.retriveMinimunData(order);
      try {

        let branches = await this.getOrderBranches(branchReference);
        if (branches.length == 0)
          reject({
            error: 'There is no branch for this order'
          });

        branch = branches[0];
        let trace, stateCod, newsCode, orderCreator;
        try {

          /* Check if restaurant is open */
          isOpened = await this.isClosedRestaurant(
            branch.platform,
            branch.lastGetNews
          );
          if (isOpened && branch.platform.isActive) {
            stateCod = 'pend';
            newsCode = 'new_ord';
          } else {
            stateCod = 'rej';
            newsCode = 'rej_closed_ord';
            order.state = NewsStateSingleton.stateByCod('rej_closed');
          }
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló saveNewOrders',
                error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló saveNewOrders',
                  error: { error: 'Error inesperado en saveNewOrders' }
              });
          }
          const msg = `Order: ${originalId} can not check if the restaurant is closed.`;
          logger.error({ message: msg, meta: { error: error.toString() } });
          throw { orderId: originalId, error };
        }
        try {

          orderCreator = {
            thirdParty: this._platform.name,
            internalCode: this._platform.internalCode,
            state: order.state,
            posId,
            displayId,
            originalId,
            branchId: branch.branchId,
            order
          };

          if (order.peya) {
            orderCreator.peya = true;
          }
          const newCreator = await this.parser.newsFromOrders(
            orderCreator,
            this._platform,
            newsCode,
            stateCod,
            branch,
            this.uuid
          );
          if (order.peya) {
            newCreator.peya = true;
          }
          /* If restaurant is closed, mark the new as viewed. */
          if (!isOpened) {

            newCreator.viewed = new Date();
            const rej = RejectedMessagesSingleton.closedResRejectedMessages;
            newCreator.extraData.rejected = {
              rejectMessageId: rej.id,
              rejectMessageDescription: rej.name,
              rejectMessageNote: null,
              entity: 'CONCENTRADOR'
            };
          } else if (!branch.platform.isActive) {
            newCreator.viewed = new Date();
            const rej = RejectedMessagesSingleton.inactiveResRejectedMessages;
            newCreator.extraData.rejected = {
              rejectMessageId: rej.id,
              rejectMessageDescription: rej.name,
              rejectMessageNote: null,
              entity: 'CONCENTRADOR'
            };
          }

          trace = newsModel.createTrace({
            typeId: newCreator.typeId,
            orderStatusId: newCreator.order.statusId
          });
          trace.entity = 'PLATFORM';
          newCreator['traces'] = trace;
          const orderQuery = {
            internalCode: this._platform.internalCode,
            originalId
          };

          const newsQuery = {
            order: {
              id: displayId,
              platformId: this._platform.internalCode
            }
          };
          const options = { new: true, upsert: true };

          promiseOrder = orderModel.findOneAndUpdate(
            orderQuery,
            orderCreator,
            options
          );

          promiseNew = newsModel.findOneAndUpdate(
            newsQuery,
            newCreator,
            options
          );

          orderProccessed = orderCreator;
          newProccessed = newCreator;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló saveNewOrders 2',
                error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló saveNewOrders 2',
                  error: { error: 'Error inesperado en saveNewOrders' }
              });
          }
          const msg = `News: ${originalId} can not be parsed correctly.`;
          const err = logger.error({
            message: msg,
            meta: { error: error.toString() }
          });
          throw err;
        }
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló saveNewOrders 3',
              error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló saveNewOrders 3',
                error: { error: 'Error inesperado en saveNewOrders' }
            });
        }
        const orderFailedCreator = {
          thirdParty: this._platform.name,
          internalCode: this._platform.internalCode,
          state: order.state,
          posId,
          displayId,
          originalId,
          branchId: branch ? branch.branchId : null,
          order
        };
        try {
          const findOrder = await orderFailedModel.findOne({
            internalCode: this._platform.internalCode,
            originalId
          });
          if (!findOrder) await orderFailedModel.create(orderFailedCreator);
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló saveNewOrders 4',
                error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló saveNewOrders 4',
                  error: { error: 'Error inesperado en saveNewOrders' }
              });
          }
          const msg = `OrderFailed: ${originalId} can not be parsed correctly.`;
          logger.error({
            message: msg,
            meta: { error: error.toString() }
          });
        }

        reject({
          orderId: originalId,
          error: `Order: ${originalId} can not be proccessed correctly.`
        });
      }
      /* Save all orders and news generated. */
      try {
        if (promiseNew) {
          //Save all news
          const [saveOrders, savedNews] = await Promise.all([
            promiseOrder,
            promiseNew
          ]);

          if (
            isOpened &&
            branch.platform.isActive &&
            parseFloat(branch.smartfran_sw.agent.installedVersion) > 1.24
          ) {
            //Push all savedNews to the queue
            await this.aws.pushNewToQueue(savedNews);
          }
        }
        return resolve(orderProccessed);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló saveNewOrders 5',
              error:{ error: error.toString(), message: error.message, stack: error.stack, order: order }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló saveNewOrders 5',
                error: { error: 'Error inesperado en saveNewOrders' }
            });
        }
        console.log('error al crear orden');
        const msg = `Failed to create orders.`;
        logger.error({ message: msg, meta: error.toString() });
        reject(msg);
      }
    });
  }

  /**
   *  Generate custom order and response automally.
   *  Save them to database.
   *  @param order  order received from the platform.
   *   */
  saveNewOrdersAutomally(order, branch) {
    return new Promise(async (resolve, reject) => {
      let orderProccessed, promiseOrder, promiseNew;

      const { posId, originalId, displayId, branchReference } =
        this.parser.retriveMinimunData(order);
      try {
        let trace, stateCod, newsCode, orderCreator;

        stateCod = 'pend';
        newsCode = 'new_ord';

        try {
          orderCreator = {
            thirdParty: this._platform.name,
            internalCode: this._platform.internalCode,
            state: order.state,
            posId,
            displayId,
            originalId,
            branchId: branch.branchId,
            order
          };
          const newCreator = await this.parser.newsFromOrders(
            orderCreator,
            this._platform,
            newsCode,
            stateCod,
            branch,
            this.uuid
          );
          trace = newsModel.createTrace({
            typeId: newCreator.typeId,
            orderStatusId: newCreator.order.statusId
          });
          trace.entity = 'PLATFORM';
          newCreator['traces'] = trace;
          const orderQuery = {
            internalCode: this._platform.internalCode,
            originalId
          };
          const newsQuery = {
            order: {
              id: displayId,
              platformId: this._platform.internalCode
            }
          };
          const options = { new: true, upsert: true };
          promiseOrder = orderModel.findOneAndUpdate(
            orderQuery,
            orderCreator,
            options
          );
          promiseNew = newsModel.findOneAndUpdate(
            newsQuery,
            newCreator,
            options
          );
          orderProccessed = orderCreator;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló saveNewOrdersAutomally 1',
                error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branch: branch  }
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló saveNewOrdersAutomally 1',
                  error: { error: 'Error inesperado en saveNewOrdersAutomally' }
              });
          }
          const msg = `News: ${originalId} can not be parsed correctly.`;
          const err = logger.error({
            message: msg,
            meta: { error: error.toString() }
          });
          throw err;
        }
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló saveNewOrdersAutomally 2',
              error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branch: branch  }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló saveNewOrdersAutomally 2',
                error: { error: 'Error inesperado en saveNewOrdersAutomally' }
            });
        }
        reject({
          orderId: originalId,
          error: `Order: ${originalId} can not be proccessed correctly.`
        });
      }
      /* Save all orders and news generated. */
      try {
        if (promiseNew) {
          //Save all news
          const [saveOrders, savedNews] = await Promise.all([
            promiseOrder,
            promiseNew
          ]);

          this.aws.pushAutoReplyToQueue(
            savedNews._id.toString(),
            branch.branchId.toString()
          );
        }
        return resolve(orderProccessed);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló saveNewOrdersAutomally 3',
              error:{ error: error.toString(), message: error.message, stack: error.stack, order: order, branch: branch  }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló saveNewOrdersAutomally 3',
                error: { error: 'Error inesperado en saveNewOrdersAutomally' }
            });
        } 
        const msg = `Failed to create orders.`;
        logger.error({ message: msg, meta: error.toString() });
        reject(msg);
      }
    });
  }

  async updateRejectedMessage(rejectedMessages) {
    try {
      //Update all platform rejectedMessages to false
      await rejectedMessageModel.updateMany(
        {
          platformId: this._platform.internalCode
        },
        {
          isActive: false
        }
      );

      //Upsert each parameter and mark as active
      const promises = rejectedMessages.map((rejectedMessage) => {
        const query = {
          platformId: this._platform.internalCode,
          id: rejectedMessage.id
        };
        const update = {
          $set: {
            name: rejectedMessage.name,
            descriptionES: rejectedMessage.descriptionES,
            descriptionPT: rejectedMessage.descriptionPT,
            forRestaurant: rejectedMessage.forRestaurant
              ? rejectedMessage.forRestaurant
              : true,
            forLogistics: rejectedMessage.forLogistics
              ? rejectedMessage.forLogistics
              : true,
            forPickup: rejectedMessage.forPickup
              ? rejectedMessage.forPickup
              : true,
            id: rejectedMessage.id,
            isActive: true,
            platformId: this._platform.internalCode
          }
        };
        const options = {
          upsert: true
        };
        return rejectedMessageModel.findOneAndUpdate(query, update, options);
      });
      Promise.all(promises);
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló updateRejectedMessage',
            error:{ error: error.toString(), message: error.message, stack: error.stack, rejectedMessages: rejectedMessages }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló updateRejectedMessage',
              error: { error: 'Error inesperado en updateRejectedMessage' }
          });
      }
    }
  }

  async updateDeliveryTimes(deliveryTimes) {
    try {
      //Update all platform deliveryTimes to false
      await deliveryTimeModel.updateMany(
        {
          platformId: this._platform.internalCode
        },
        {
          isActive: false
        }
      );
      //Upsert each parameter and mark as active
      const promises = deliveryTimes.map((deliveryTime) => {
        const query = {
          platformId: this._platform.internalCode,
          id: deliveryTime.id
        };
        const update = {
          $set: {
            name: deliveryTime.name,
            description: deliveryTime.description,
            minMinutes: deliveryTime.minMinutes,
            maxMinutes: deliveryTime.maxMinutes,
            order: deliveryTime.order,
            id: deliveryTime.id,
            isActive: true,
            platformId: this._platform.internalCode
          }
        };
        const options = {
          upsert: true
        };

        return deliveryTimeModel.findOneAndUpdate(query, update, options);
      });
      Promise.all(promises);
    }
    catch (error) {
      try { 
        logError.create({
            message: 'Falló updateDeliveryTimes',
            error:{ error: error.toString(), message: error.message, stack: error.stack, deliveryTimes: deliveryTimes }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló updateDeliveryTimes',
              error: { error: 'Error inesperado en updateDeliveryTimes' }
          });
      }
    }
  }
}


export default Platform;
