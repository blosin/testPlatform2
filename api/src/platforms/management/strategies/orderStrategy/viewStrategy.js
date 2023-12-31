import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import NewsTypeStrategy from '../newsTypeStrategy';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';
import logError from '../../../../models/logError';

class ViewStrategy extends NewsTypeStrategy {
  constructor(newToSet, token) {
    super(newToSet);
    this.token = token;
    this.savedNew = { _id: newToSet.id };
    this.statusId = NewsStateSingleton.idByCod('view');
    this.typeId = NewsTypeSingleton.idByCod('view_ord');
  }

  validateTransition() {
    const rejType = NewsTypeSingleton.idByCod('platform_rej_ord');
    return (
      !this.findTrace(this.typeId) &&
      !this.savedNew.traces.find((trace) => trace.update.typeId == rejType)
    );
  }

  manageNewType() {
    return new Promise(async (resolve, reject) => {
      try {
        this.savedNew = await this.findNew(this.newToSet.id);
        const isValid = this.validateTransition();

        let platformResult = null;
        if (isValid) {
          platformResult = await this.platform.viewOrder(this.savedNew.order);
        }
        const { findQuery, updateQuery, options } = this.createObjectsUpdate(
          platformResult,
          isValid,
        );
        await this.updateNew(findQuery, updateQuery, options);
        if (!isValid) {
          const msg =
            'La novedad no cumple los requisitos de transición. Visto.';
          const meta = {
            ...this.newToSet,
            typeId: this.typeId,
            statusId: this.statusId,
          };
          throw new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
        }
        resolve();
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló manageNewType ViewStrategy',
              error:{ error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló manageNewType ViewStrategy',
                error: { error: 'Error inesperado en manageNewType' }
            });
        } 
        reject(error);
      }
    });
  }
}

export default ViewStrategy;
