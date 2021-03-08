import NewsTypeStrategy from '../newsTypeStrategy';
import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import { APP_BRANCH } from '../../../../utils/errors/codeError';
import CustomError from '../../../../utils/errors/customError';

class DeliveryStrategy extends NewsTypeStrategy {
  constructor(newToSet) {
    super(newToSet);
    this.statusId = NewsStateSingleton.idByCod('delivery');
    this.typeId = NewsTypeSingleton.idByCod('deliv_ord');
    this.savedNew = { _id: newToSet.id };
  }

  validateTransition() {
    const prevType = NewsTypeSingleton.idByCod('disp_ord');
    return !!this.findTrace(prevType) && !this.findTrace(this.typeId);
  }

  async manageNewType() {
    return new Promise(async (resolve, reject) => {
      try {
        this.savedNew = await this.findNew(this.newToSet.id);

        const isValid = this.validateTransition();

        let platformResult = null;
        if (isValid) {
          platformResult = await this.platform.deliveryOrder(
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
            'La novedad no cumple los requisitos de transición. Entregado.';
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

export default DeliveryStrategy;
