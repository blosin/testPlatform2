import news from '../../../models/news';
import PlatformFactory from '../factory_platform';
import PlatformSingleton from '../../../utils/platforms';
import { APP_BRANCH, DB } from '../../../utils/errors/codeError';
import CustomError from '../../../utils/errors/customError';
const { ObjectId } = require('mongodb');
import axios from 'axios';
import config from '../../../config/env';

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
          orderStatusId: this.statusId,
          isValid: isValid,
          platformResult: platformResult,
          updatedAt: new Date()
        }
      };
    } catch (error) {
      const msg = 'No se pudo generar el objeto trace.';
      const meta = { ...this };
      new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
    }
  }

  createObjectsUpdate(platformResult, isValid) {
    try {
      this.createTrace(platformResult, isValid);
      const findQuery = this.savedNew._id;
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
      const options = { new: true };

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
      this.platform = platformFactory.createPlatform(
        PlatformSingleton.getByCod(platformId),
        this.uuid
      );
    } catch (error) {
      const msg = 'No se pudo generar la plataforma.';
      const meta = { ...this };
      new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
    }
  }

  findTrace(typeId) {
    return this.savedNew.traces.find(
      (trace) => trace.update.typeId == typeId && trace.entity == this.entity
    );
  }

  findNew(idNew) {
    return new Promise(async (resolve, reject) => {
      try {
        this.savedNew = await news.aggregate([
          { $match: { _id: ObjectId(idNew) } },
          {
            $project: {
              'order.id': '$order.originalId',
              'order.originalId': '$order.originalId',
              'order.statusId': '$order.statusId',
              'order.platformId': '$order.platformId',
              'order.ownDelivery': '$order.ownDelivery',
              'order.preOrder': '$order.preOrder',
              'order.branchId': '$branchId',
              branchId: '$branchId',
              'extraData.rejected': '$extraData.rejected',
              traces: '$traces'
            }
          },
          { $limit: 1 }
        ]);
        this.savedNew = this.savedNew.pop();
        if (!this.savedNew || !this.savedNew.order) throw 'New not found.';

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
        const updated = await news.findByIdAndUpdate(
          findQuery,
          updateQuery,
          options
        );
        return resolve(updated);
      } catch (err) {
        console.log(err);
        const msg = 'No se pudo actualizar la novedad.';
        const meta = { findQuery, updateQuery, options, err };
        const error = new CustomError(DB.FINDBYID, msg, this.uuid, meta);
        return reject(error);
      }
    });
  }

  requestLastMile(order, extra = {}) {
    try {
      const headers = {
        token: config.tokenStatic
      };
      const data = {
        typeId: this.typeId,
        branchId: order.branchId,
        id: order._id
      };

      axios.post(
        config.apiUrlLastMile + '/delivery/setNews',
        { ...data, ...extra },
        {
          headers
        }
      );
    } catch (error) {
      console.log('No se pudo solicitar delivery.');
    }
  }
}

export default NewsTypeStrategy;
