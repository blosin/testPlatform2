import NewsTypeStrategy from '../newsTypeStrategy';
import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';

class BranchRejectStrategy extends NewsTypeStrategy {
  constructor(newToSet) {
    super(newToSet);
    this.savedNew = { _id: newToSet.id };
    this.statusId = NewsStateSingleton.idByCod('rej');
    this.typeId = NewsTypeSingleton.idByCod('rej_ord');
  }

  validateTransition() {
    return !this.findTrace(this.typeId);
  }

  createObjectsUpdate(platformResult, isValid) {
    try {
      this.createTrace(platformResult, isValid);
      this.trace.update.rejected = {
        rejectMessageId: this.newToSet.rejectMessageId,
        rejectMessageDescription: this.newToSet.rejectMessageDescription,
        rejectMessageNote: this.newToSet.rejectMessageNote,
        entity: this.entity
      };
      const findQuery = this.savedNew._id;
      let updateQuery;
      if (isValid) {
        updateQuery = {
          typeId: this.typeId,
          'extraData.rejected': { ...this.trace.update.rejected },
          'order.statusId': this.statusId,
          $push: { traces: this.trace }
        };
      } else {
        updateQuery = {
          $push: { traces: this.trace }
        };
      }
      return { findQuery, updateQuery };
    } catch (error) {
      const msg = 'No se pudo generar el findQuery o updateQuery.';
      const meta = { ...this.newToSet, error: error.toString() };
      new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
    }
  }

  async manageNewType() {
    return new Promise(async (resolve, reject) => {
      try {
        this.savedNew = await this.findNew(this.newToSet.id);

        const isValid = this.validateTransition();

        let platformResult = null;
        if (isValid && this.newToSet.rejectMessageId >= 0) {
          platformResult = await this.platform.branchRejectOrder(
            this.savedNew.order,
            this.newToSet.rejectMessageId,
            this.newToSet.rejectMessageNote
          );
        }
        const { findQuery, updateQuery, options } = this.createObjectsUpdate(
          platformResult,
          isValid
        );

        await this.updateNew(findQuery, updateQuery, options);

        if (!isValid) {
          const msg =
            'La novedad no cumple los requisitos de transición. RechazoSucursal.';
          const meta = {
            ...this.newToSet,
            typeId: this.typeId,
            statusId: this.statusId
          };
          throw new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default BranchRejectStrategy;
