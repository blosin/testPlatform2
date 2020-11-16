import NewsTypeStrategy from '../newsTypeStrategy';
import NewsTypeSingleton from '../../../../utils/newsType';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';

class RetrieveDriverStrategy extends NewsTypeStrategy {
  constructor(newToSet) {
    super(newToSet);
    this.savedNew = { _id: newToSet.id };
  }

  validateTransition() {
    return this.savedNew.ownDelivery === false;
  }

  createObjectsUpdate(platformResult, isValid) {
    try {
      this.createTrace(platformResult, isValid);
      const findQuery = this.savedNew._id;
      const updateQuery = {
        typeId: this.typeId,
        viewed: null,
        'order.driver': driver,
        $push: { traces: this.trace }
      };
      const options = {};

      if (!isValid) delete updateQuery.typeId;
      return { findQuery, updateQuery, options };
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
        this.typeId = NewsTypeSingleton.idByCod('upd_ord');

        const isValid = this.validateTransition();

        let platformResult = null;
        if (isValid) {
          platformResult = await this.platform.retriveDriver(
            this.savedNew.order
          );
        }

        const { findQuery, updateQuery, options } = this.createObjectsUpdate(
          platformResult,
          isValid
        );
        await this.updateNew(findQuery, updateQuery, options);

        if (!isValid) {
          const msg =
            'La novedad no cumple los requisitos de transición. ConsultaDelivery.';
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

export default RetrieveDriverStrategy;
