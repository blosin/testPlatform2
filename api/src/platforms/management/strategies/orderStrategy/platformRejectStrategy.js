import NewsTypeStrategy from '../newsTypeStrategy';
import RejectedMessagesSingleton from '../../../../utils/rejectedMessages';
import NewsStateSingleton from '../../../../utils/newsState';
import news from '../../../../models/news';
import NewsTypeSingleton from '../../../../utils/newsType';

class PlatformRejectStrategy extends NewsTypeStrategy {
    constructor(newToSet, token) {
        super(newToSet);
        this.order = newToSet.order;
        this.token = token;
        this.entity = 'PLATFORM';
        this.typeId = NewsTypeSingleton.idByCod('platform_rej_ord');
        this.statusId = NewsStateSingleton.idByCod('rej');
    }

    validateTransition() {
        const posiblePrevStatus = [
            NewsStateSingleton.idByCod('pend'),
            NewsStateSingleton.idByCod('view'),
            NewsStateSingleton.idByCod('confirm'),
            NewsStateSingleton.idByCod('dispatch'),
        ];
        const prevStatusOk = posiblePrevStatus.some((s) => s === this.savedNew.order.statusId);
        return prevStatusOk && !this.findTrace(this.typeId)
    }

    async manageNewType() {
        return new Promise(async (resolve, reject) => {
            try {
                const closed_rejId = RejectedMessagesSingleton.closedResRejectedMessages.id;

                this.savedNew = await news
                    .aggregate([
                        { $match: { 'order.id': this.newToSet.order.id } },
                        {
                            $project: {
                                'order.id': '$order.id',
                                'order.statusId': '$order.statusId',
                                'order.platformId': '$order.platformId',
                                'order.ownDelivery': '$order.ownDelivery',
                                'order.preOrder': '$order.preOrder',
                                'branchId': '$branchId',
                                'extraData.rejected': '$extraData.rejected',
                                'traces': '$traces'
                            }
                        },
                        { $limit: 1 }
                    ]);
                this.savedNew = this.savedNew.pop();

                if (!!this.savedNew &&
                    !!this.savedNew.extraData &&
                    !!this.savedNew.extraData.rejected &&
                    this.savedNew.extraData.rejected.rejectMessageId !== closed_rejId)
                    throw { orderId: this.order.id, error: `The order ${this.order.id} could not be found.` };

                this.createPlatform(this.savedNew.order.platformId);
                const isValid = this.validateTransition();

                let platformResult = null;
                if (isValid) {
                    platformResult = await this.platform
                        .rejectPlatformOrder(
                            this.savedNew.order.id);
                }
                const { findQuery, updateQuery, options } =
                    this.createObjectsUpdate(platformResult, isValid);

                const rej = RejectedMessagesSingleton.platformRejectedMessages;

                const rejectedExtraData = {
                    rejectMessageId: rej.id,
                    rejectMessageDescription: rej.name,
                    rejectMessageNote: null,
                    entity: 'PLATFORM'
                }
                if (isValid) {
                    updateQuery.viewed = null;
                    updateQuery['extraData.rejected'] = rejectedExtraData;
                }
                await this.updateNew(findQuery, updateQuery, options);
                if (!isValid)
                    return reject({ orderId: this.order.id, error: `The order ${this.order.id} has reached it final status.` });
                return resolve(platformResult);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default PlatformRejectStrategy;