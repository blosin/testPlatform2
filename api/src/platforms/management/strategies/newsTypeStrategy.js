import news from '../../../models/news';
import PlatformFactory from '../factory_platform';
import PlatformSingleton from '../../../utils/platforms';
import { APP_BRANCH, DB } from '../../../utils/errors/codeError';
import CustomError from '../../../utils/errors/customError';
const { ObjectId } = require('mongodb');

class NewsTypeStrategy {
    constructor(newToSet) {
        this.newToSet = newToSet;
        this.typeId = newToSet.typeId;
        this.uuid = '0000';
        this.entity = 'BRANCH';
    }

    createTrace(platformResult, isValid) {
        try {
            this.trace = {
                entity: this.entity,
                update: {
                    typeId: this.typeId,
                    'orderStatusId': this.statusId,
                    'isValid': isValid,
                    'platformResult': platformResult,
                    'updatedAt': new Date()
                }
            }
        } catch (error) {
            const msg = 'No se pudo generar el objeto trace.';
            const meta = { ...this };
            new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
        }
    }

    createObjectsUpdate(platformResult, isValid) {
        try {
            this.createTrace(platformResult, isValid);
            const findQuery = { _id: this.savedNew._id };
            let updateQuery;
            if (isValid) {
                updateQuery = {
                    typeId: this.typeId,
                    'order.statusId': this.statusId,
                    $push: { traces: this.trace }
                };
            } else {
                updateQuery = {
                    $push: { traces: this.trace }
                };
            }
            const options = {};

            return { findQuery, updateQuery, options };
        } catch (error) {
            const msg = 'No se pudo generar el findQuery o updateQuery.';
            const meta = { ...this.newToSet, error: error.toString() };
            new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
        }
    }

    createPlatform(platformId) {
        try {
            const platformFactory = new PlatformFactory();
            this.platform = platformFactory
                .createPlatform(PlatformSingleton.getByCod(platformId), this.uuid);
        } catch (error) {
            const msg = 'No se pudo generar la plataforma.';
            const meta = { ...this };
            new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
        }
    }

    findTrace(typeId) {
        return this.savedNew.traces.find((trace) =>
            trace.update.typeId == typeId &&
            trace.entity == this.entity);
    }

    findNew(idNew) {
        return new Promise(async (resolve, reject) => {
            try {
                this.savedNew = await news
                    .aggregate([
                        { $match: { _id: ObjectId(idNew) } },
                        {
                            $project: {
                                'order.originalId': '$order.originalId',
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
                if (!this.savedNew || !this.savedNew.order)
                    throw ('New not found.');

                this.createPlatform(this.savedNew.order.platformId);
                return resolve(this.savedNew);
            } catch (error) {
                const msg = 'No se pudo obtener la novedad.';
                const meta = { ...this.newToSet, error: error.toString() };
                const err = new CustomError(DB.FINDBYID, msg, this.uuid, meta);
                return reject(err);
            }
        });
    }

    updateNew(findQuery, updateQuery, options) {
        return new Promise(async (resolve, reject) => {
            try {
                const updated = await news.updateOne(
                    findQuery,
                    updateQuery,
                    options)
                    .lean();

                if (updated.ok == 1)
                    return resolve({ message: 'Ok' });
                else {
                    throw 'No se pudo actualizar la novedad. Update.ok != 0.';
                }
            } catch (err) {
                const msg = 'No se pudo actualizar la novedad.';
                const meta = { findQuery, updateQuery, options, err };
                const error = new CustomError(DB.FINDBYID, msg, this.uuid, meta);
                return reject(error);
            }
        });
    }
}

export default NewsTypeStrategy;