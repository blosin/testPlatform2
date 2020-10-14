'use strict'
import Platform from '../platform';
import logger from '../../../config/logger';
import orderModel from '../../../models/order';
import branchModel from '../../../models/branch';

class Glovo extends Platform {
    constructor(platform) {
        super(platform);
        this.init();
        this.cronGetPlatformParameters();
    }

    async init() {
        if (this._platform &&
            this._platform.credentials &&
            this._platform.credentials.data &&
            this._platform.credentials.data.token
        ) {
            this._token = this._platform.credentials.data.token;
            console.log(`${this._platform.name}.\t\t Inicializated.`);
        } else {
            const msg = `[EMAIL-LOG] Can not initializate Glovo.`;
            logger.error({ message: msg, meta: { platform: this._platform } });
        }
    }

    /**
    * Validate the orders sended.
    * @override
    */

    saveOrders(newOrder) {
        this.updateLastContact();
        return new Promise(async (resolve, reject) => {
            /* Validate orde unicity */
            let savedOrder = await orderModel.findOne({
                $or: [
                    { 'order.order_id': newOrder.order_id },
                    { 'order.order_code': newOrder.order_code }
                ],
                internalCode: 9,
                state: { '$ne': 'CLOSED_RESTAURANT_REJECTED' }
            }).lean();
            if (savedOrder) {
                const error = `Order/s: ${newOrder.orderId} already exists.`;
                logger.error({ message: error, meta: { newOrder } });
                return reject({ error });
            }

            /* Find branches associated to de references given by the platform */
            let savedBranches = await branchModel
                .aggregate([{
                    $match: {
                        'platforms.branchReference': newOrder.branchId.toString(),
                        'platforms.platform': this._platform._id
                    }
                }]);

            if (!savedBranches.length) {
                let error = `Some branches not exists:  ${newOrder.branchId}.`;
                logger.error({ message: '[EMAIL-LOG]. ' + error, meta: newOrder });
                return reject({ error });
            }
            const savedBranch = savedBranches.pop();

            this.saveNewOrders([newOrder])
                .then((res) => {
                    if (!res.length)
                        throw 'Orders could not been processed.'
                    let ordersSaved = res.map((order) => {
                        let branchId = savedBranch.platforms
                            .find((p) => p.platform == this._platform._id.toString()).branchReference;
                        return {
                            id: order.orderId,
                            state: order.state,
                            branchId: branchId
                        }
                    });
                    const set = new Set();
                    ordersSaved = ordersSaved.filter((order) => {
                        if (set.has(order.orderId))
                            return false;
                        set.add(order.orderId);
                        return true;
                    });
                    return resolve(ordersSaved);
                })
                .catch((error) => {
                    reject({ error: error.toString() });
                });
        });
    }


    /**
    * 
    * @override
    */
    importParser() {
        return require('../../interfaces/glovo');
    }

    async saveGlovoOrder(order, tokenAuth) {
        /* Validate Token */
        if (tokenAuth != this._token) {
            const msg = `Failed to push order. Cannot authorize token`;
            const error = logger.error({ message: msg });
            return Promise.reject(error);
        }

        order.orderId = order.order_id;
        order.branchId = order.store_id;

        return this.saveOrders(order);
    }
}

export default Glovo;