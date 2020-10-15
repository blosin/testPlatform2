'use strict'
import moment from 'moment';
import cron from 'node-cron';

import logger from '../../config/logger';
import orderModel from '../../models/order';
import newsModel from '../../models/news';
import branchModel from '../../models/branch';
import platformModel from '../../models/platform';
import rejectedMessageModel from '../../models/rejectedMessage';
import deliveryTimeModel from '../../models/deliveryTime';
import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import RejectedMessagesSingleton from '../../utils/rejectedMessages';
import Aws from '../provider/aws';

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
        const schedule = '6 * * * *';
        cron.schedule(schedule, () =>
            this.getPlatformParameters()
        );
    }

    /**
     * Can be overriden.
     * */
    getDeliveryTimes() {
        return new Promise((resolve) => {
            let data = require('../../assets/deliveryTimes').generic;
            data.forEach((obj) =>
                obj.platformId = this._platform.internalCode);
            resolve(data);
        });
    }

    /**
     * Can be overriden.
     * */
    getRejectedMessages() {
        return new Promise((resolve) => {
            let data = require('../../assets/rejectedMessages').generic;
            let negatives = require('../../assets/rejectedMessages').negatives;
            data = data.concat(negatives);
            data.forEach((obj) =>
                obj.platformId = this._platform.internalCode);
            resolve(data);
        });
    }

    /**
    * @override
    * Update platform parameters
    * */
    async getPlatformParameters() {
        const [rejectedMessages, deliveryTimes] = await Promise.all([
            this.getRejectedMessages(),
            this.getDeliveryTimes()
        ]);
        this.updateRejectedMessage(rejectedMessages);
        this.updateDeliveryTimes(deliveryTimes);
    }

    /**
     * Can be overriden.
     * */
    receiveOrder(order, branchId) {
        return Promise.resolve(this.doesNotApply);
    }

    /**
     * Can be overriden.
     * */
    viewOrder(order, branchId) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('view');
            await this.updateOrderState(order, state);
            return resolve(this.doesNotApply);
        });
    }

    /**
     * Can be overriden.
     * */
    confirmOrder(order, branchId, deliveryTimeId) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('confirm');
            await this.updateOrderState(order, state);
            return resolve(this.doesNotApply);
        });
    }

    /**
     * Can be overriden.
     * */
    dispatchOrder(order) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('dispatch');
            await this.updateOrderState(order, state);
            return resolve(this.doesNotApply);
        });
    }

    /**
     * Can be overriden.
     * */
    deliveryOrder(order) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('delivery');
            await this.updateOrderState(order, state);
            return resolve(this.doesNotApply);
        });
    }

    /**
     * Can be overriden.
     * */
    branchRejectOrder(order, rejectMessageId, rejectMessageNote) {
        return new Promise(async (resolve) => {
            const state = NewsStateSingleton.stateByCod('rej');
            await this.updateOrderState(order, state);
            return resolve(this.doesNotApply);
        });
    }

    retriveDriver(order) {
        return new Promise(async (resolve) => {
            const noDriver = {
                name: 'Sin Informacion',
                driver: null,
                pickupDate: null,
                estimatedDeliveryDate: null
            }
            return resolve(noDriver);
        });
    }
    /**
     * Can be overriden.
     * */
    openRestaurant(branchId) {
        return new Promise(async (resolve, reject) => {
            try {
                let dateNow = new Date();
                const branch = await branchModel.findOne({ branchId });
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const closedProg = branchModel.findProgClosedToOpen(platformBranch, dateNow);

                if (typeof (closedProg) == 'string')
                    throw `${closedProg} RestaurantCode: ${branchId}.`;

                const dateFromUTC = moment(dateNow);

                await branchModel.updateOne({
                    branchId,
                    'platforms.platform': this._platform._id
                },
                    {
                        $set: {
                            'platforms.$[].progClosed.$[i].open': dateFromUTC
                        }
                    }, {
                    arrayFilters: [
                        { 'i._id': closedProg._id }
                    ]
                });
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
                let dateNow = new Date();
                const branch = await branchModel.findOne({ branchId });
                const platformBranch = this.getBranchPlatform(branch.platforms, this._platform._id);
                const validatedClosed = branchModel.validateNewProgClosed(platformBranch, dateNow, timeToClose);
                const dateFromUTC = moment(dateNow);
                const dateToUTC = moment(dateNow).add(timeToClose, 'm');

                if (validatedClosed != '')
                    throw `${validatedClosed} RestaurantCode: ${branchId}.`;

                await branchModel.updateOne({
                    branchId,
                    'platforms.platform': this._platform._id
                }, {
                    '$push': {
                        'platforms.$.progClosed': {
                            close: dateFromUTC,
                            open: dateToUTC,
                            description: description
                        }
                    }
                });
                resolve();
            } catch (error) {
                error = { error: error.toString(), branchId, platform: this._platform, timeToClose, description };
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
            }
            await this.updateNewsState(order, statusId, typeId, null, 'CONCENTRADOR', rejectedExtraData);
        }
        catch (error) {
            const msg = `Order: ${order.id}. Failed to reject automatically the order.`;
            error = { error: error.toString(), order };
            logger.error({ message: msg, meta: error });
        }
    }

    updateOrderState(order, state) {
        try {
            return orderModel.findOneAndUpdate({
                originalId: order.originalId,
                internalCode: this._platform.internalCode,
                'extraData.rejected.rejectMessageId': {
                    $ne: RejectedMessagesSingleton.closedResRejectedMessages.id
                }
            }, {
                state: state,
                'order.state': state
            }, {
                new: true
            });
        } catch (error) {
            const msg = 'Failed to update order state.';
            error = { order, state, error: error.toString() };
            logger.error({ message: msg, meta: error });
            return Promise.reject(msg);
        }
    }

    updateNewsState(order, statusId, typeId, viewed, entity, rejectedExtraData = null) {
        try {
            const object = { typeId, 'orderStatusId': parseInt(statusId, 10) };
            let trace = newsModel.createTrace(object);
            trace.entity = entity;
            return newsModel.findOneAndUpdate({
                'order.id': order.id,
                'order.platformId': this._platform.internalCode,
                typeId: {
                    $ne: NewsTypeSingleton.idByCod('rej_closed_ord')
                },
            }, {
                typeId,
                viewed,
                'extraData.rejected': rejectedExtraData,
                'order.statusId': parseInt(statusId, 10),
                '$push': { traces: trace }
            }, {
                new: true
            });
        } catch (error) {
            const msg = 'Failed to update news state.';
            error = { order, statusId, typeId, viewed, entity, error: error.toString() };
            logger.error({ message: msg, meta: error });
            return Promise.reject(msg);
        }
    }

    async updateLastContact() {
        await platformModel.updateOne({
            internalCode: this._platform.internalCode
        }, {
            $set: { lastContact: new Date() }
        });
    }

    getOrderById(id) {
        return orderModel
            .aggregate([{
                $match: {
                    originalId: id,
                    internalCode: this._platform.internalCode
                }
            },
            { $limit: 1 }])
            .project({ order: true, _id: false })
            .then((ordersRes) => ordersRes.pop())
            .then((orderRes) => {
                if (orderRes) return { ...orderRes.order };
                else throw 'Order not found.';
            })

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
                        'id': orderId,
                        'state': state
                    });
                } catch (error) {
                    logger.error({ meta: { error: error.toString() } });
                    throw error;
                }
            } catch (message) {
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
                    savedOrder = await orderModel.findOne({
                        'originalId': orderId,
                        internalCode: this._platform.internalCode,
                        state: { $ne: NewsStateSingleton.stateByCod('rej_closed') },
                    }).lean();
                } catch (error) {
                    throw error;
                }
                if (!savedOrder)
                    return reject({ orderId, error: `The order ${orderId} could not be found.` });
                return resolve(savedOrder.order);
            } catch (error) {
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
        return platforms.find((p) =>
            p.platform.toString() == platformId.toString());
    }

    /**
    Check if the restaruant is closed now.
    If it's open, return true.
    If it's closed, reject the order automatically and return false.
    @param branchPlatform 
    */
    isClosedRestaurant(branchPlatform) {
        return new Promise(async (resolve) => {
            try {
                const timeToClose = 3;
                const dateNow = new Date();
                const diffLastGetNews = moment.duration(moment(dateNow, 'DD/MM/YYYY HH:mm:ss')
                    .diff(moment(new Date(branchPlatform.lastGetNews), 'DD/MM/YYYY HH:mm:ss'))).asMinutes();

                let closed = false;
                if (branchPlatform.progClosed && !!branchPlatform.progClosed.length)
                    closed = branchPlatform.progClosed.some((cp) =>
                        new Date(cp.close) <= dateNow &&
                        new Date(cp.open) >= dateNow)
                        ||
                        diffLastGetNews > timeToClose;
                else if (diffLastGetNews > timeToClose)
                    closed = true;
                return resolve(!closed);
            } catch (error) {
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
        return require('../interfaces/thirdParty');
    }

    /**
     * Validate the orders before save.
     * */
    validateNewOrders(newOrders) {
        this.updateLastContact();
        return new Promise(async (resolve, reject) => {
            let ordersSaved = [];
            const minOrders = newOrders
                .map((newOrd) => this.parser.retriveMinimunData(newOrd));
            /* Validate  orders */
            let orders = await orderModel.find({
                originalId: { $in: minOrders.map((order) => order.originalId) },
                internalCode: this._platform.internalCode,
                state: { $ne: NewsStateSingleton.stateByCod('rej_closed') },
            }).lean();

            if (!!orders.length) {
                const set = new Set();
                orders = orders.filter((order) => {
                    if (set.has(order.originalId)) {
                        return false;
                    }
                    set.add(order.originalId);
                    return true;
                });
                const ids = Array.from(orders.map((o) => o.originalId));
                const error = `Order/s: ${ids} already exists.`;
                logger.error({ message: error, meta: { newOrders } });
                return reject({ error });
            }

            /* Validate Branches */
            let idsBranch = minOrders
                .map((order) => order.branchReference);
            let uniqueIdsBranch = idsBranch.filter((elem, pos) =>
                idsBranch.indexOf(elem) == pos);

            /* Find branches associated to de references given by the platform */
            let savedBranches = [];
            for (let uniqueId of uniqueIdsBranch) {
                let foundBranches = await branchModel.find({
                    'platforms.branchReference': uniqueId,
                    'platforms.platform': this._platform._id
                }).lean();
                savedBranches = savedBranches.concat(foundBranches);
            }

            let refSavedBranches = [];
            savedBranches.forEach((b) => {
                let ids = b.platforms.map((p) => p.branchReference);
                refSavedBranches = refSavedBranches.concat(ids);
            });

            /* 
            Check if all unique branches have its corresponden Branch
            */
            let diff = uniqueIdsBranch.filter((i) =>
                !refSavedBranches.find((r) => r == i.toString()));

            if (!!diff.length) {
                let error = `Some branches not exists:  ${diff}.`;
                logger.error({ message: error, meta: { newOrders } });
                return reject({ error });
            }

            this.saveNewOrders(newOrders)
                .then((res) => {
                    if (!res.length)
                        throw 'Orders could not been processed.'
                    ordersSaved = res.map((order) => {
                        let branchId = savedBranches
                            .find((b) => b.branchId == order.branchId).platforms
                            .find((p) => p.platform == this._platform._id.toString()).branchReference;
                        return {
                            id: order.posId,
                            state: order.state,
                            branchId: branchId
                        }
                    });
                    const set = new Set();
                    ordersSaved = ordersSaved.filter((order) => {
                        if (set.has(order.id)) {
                            return false;
                        }
                        set.add(order.id);
                        return true;
                    });
                    return resolve(ordersSaved);
                })
                .catch((error) => {
                    reject({ error: error.toString() });
                });
        });
    }

    getOrderBranches(branchReference) {
        const query = {
            'platforms.platform': this._platform._id,
            'platforms.branchReference': branchReference.toString()
        };

        return branchModel
            .aggregate([
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
                        'name': '$name',
                        'branchId': '$branchId',
                        'name': '$name',
                        'chain.chain': '$joinChains.chain',
                        'platform.name': '$joinPlatforms.name',
                        'platform.platform': '$joinPlatforms._id',
                        'platform.lastGetNews': '$platforms.lastGetNews',
                        'platform.progClosed': '$platforms.progClosed',
                        'client.businessName': '$joinClients.businessName',
                        'address.region': '$joinRegions.region'
                    }
                }
            ]);
    }

    /**
     *  Generate custom order and new for each one.
     *  Save them to database.
     *  @param orders List of orders received from the platform.
     *   */
    saveNewOrders(orders) {
        return new Promise(async (resolve, reject) => {
            let ordersProccessed = [];
            let newsProccessed = [];
            let promisesOrders = [];
            let promisesNews = [];
            let branches = [];

            for (let data of orders) {
                const {
                    posId,
                    originalId,
                    displayId,
                    branchReference
                } = this.parser.retriveMinimunData(data);
                try {
                    branches = await this.getOrderBranches(branchReference);
                    if (!branches.length)
                        throw 'There is no branches for this order';
                    for (let branch of branches) {
                        let trace, stateCod, newsCode, isOpened, orderCreator;
                        try {
                            /* Check if restaurant is open */
                            isOpened = await this.isClosedRestaurant(branch.platform);

                            if (isOpened) {
                                stateCod = 'pend';
                                newsCode = 'new_ord';
                            } else {
                                stateCod = 'rej';
                                newsCode = 'rej_closed_ord';
                                data.state = NewsStateSingleton.stateByCod('rej_closed');
                            }
                        } catch (error) {
                            const msg = `Order: ${originalId} can not check if the restaurant is closed.`;
                            logger.error({ message: msg, meta: { error: error.toString() } });
                            throw { orderId: id, error };
                        }

                        try {
                            orderCreator = {
                                thirdParty: this._platform.name,
                                internalCode: this._platform.internalCode,
                                state: data.state,
                                posId,
                                displayId,
                                originalId,
                                branchId: branch.branchId,
                                order: data
                            };
                            const newCreator = await this.parser.newsFromOrders(orderCreator, this._platform, newsCode, stateCod, branch, this.uuid);
                            /* If restaurant is closed, mark the new as viewed. */
                            if (!isOpened) {
                                newCreator.viewed = new Date();
                                const rej = RejectedMessagesSingleton.closedResRejectedMessages;
                                newCreator.extraData.rejected = {
                                    rejectMessageId: rej.id,
                                    rejectMessageDescription: rej.name,
                                    rejectMessageNote: null,
                                    entity: 'CONCENTRADOR'
                                }
                            }
                            trace = newsModel.createTrace({
                                typeId: newCreator.typeId,
                                orderStatusId: newCreator.order.statusId
                            });
                            trace.entity = 'PLATFORM';

                            newCreator['traces'] = trace;
                            const orderQuery = {
                                internalCode: this._platform.internalCode,
                                originalId,
                            };
                            const newsQuery = {
                                order: {
                                    id: displayId,
                                    platformId: this._platform.internalCode
                                }
                            };
                            const options = { new: true, upsert: true };

                            promisesOrders.push(
                                orderModel.findOneAndUpdate(orderQuery, orderCreator, options)
                            );
                            promisesNews.push(
                                newsModel.findOneAndUpdate(newsQuery, newCreator, options)
                            );
                            ordersProccessed.push(
                                orderCreator
                            );
                            newsProccessed.push(
                                newCreator
                            );
                        } catch (error) {
                            const msg = `News: ${originalId} can not be parsed correctly.`;
                            const err = logger.error({ message: msg, meta: { error: error.toString() } });
                            throw err;
                        }
                    }
                } catch (error) {
                    throw { orderId: error.id, error: `Order: ${error.id} can not be proccessed correctly.` };
                }
            }

            /* Save all orders and news generated. */
            try {
                if (!!promisesNews.length) {
                    await Promise.all(promisesOrders);

                    //Save all news
                    const savedNews = await Promise.all(promisesNews);

                    //Push all savedNews to the queue
                    // await Promise.all(savedNews
                    //     .map((savedNew) =>
                    //         this.aws.pushNewToQueue(savedNew)));
                }
                return resolve(ordersProccessed);
            } catch (error) {
                const msg = `Failed to create orders.`;
                logger.error({ message: msg, meta: error.toString() });
                reject(error.toString());
            }
        }).catch((error) => {
            reject(error.toString());
        });
    }

    async updateRejectedMessage(rejectedMessages) {
        //Update all platform rejectedMessages to false
        await rejectedMessageModel.updateMany({
            platformId: this._platform.internalCode
        }, {
            isActive: false
        });
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
                    forRestaurant: rejectedMessage.forRestaurant,
                    forLogistics: rejectedMessage.forLogistics,
                    forPickup: rejectedMessage.forPickup,
                    id: rejectedMessage.id,
                    isActive: true,
                    platformId: this._platform.internalCode,
                }
            }
            const options = {
                upsert: true
            };
            return rejectedMessageModel.
                findOneAndUpdate(query, update, options);
        });
        Promise.all(promises);
    }

    async updateDeliveryTimes(deliveryTimes) {
        //Update all platform deliveryTimes to false
        await deliveryTimeModel.updateMany({
            platformId: this._platform.internalCode,
        }, {
            isActive: false
        });
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
                    platformId: this._platform.internalCode,
                }
            }
            const options = {
                upsert: true
            };

            return deliveryTimeModel.
                findOneAndUpdate(query, update, options);
        });
        Promise.all(promises);
    }
}

export default Platform;
