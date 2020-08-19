import NewsTypeStrategy from '../newsTypeStrategy';
import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';

class DispatchStrategy extends NewsTypeStrategy {
    constructor(newToSet) {
        super(newToSet);
        this.savedNew = { _id: newToSet.id };
        this.statusId = NewsStateSingleton.idByCod('dispatch');
        this.typeId = NewsTypeSingleton.idByCod('disp_ord');
    }

    validateTransition() {
        const prevType = NewsTypeSingleton.idByCod('confirm_ord');
        return !!this.findTrace(prevType) && !this.findTrace(this.typeId);
    }

    async manageNewType() {
        return new Promise(async (resolve, reject) => {
            try {
                this.savedNew = await this.findNew(this.newToSet.id);

                const isValid = this.validateTransition();

                let platformResult = null;
                if (isValid) {
                    platformResult = await this.platform
                        .dispatchOrder(
                            this.savedNew.order)

                }
                const { findQuery, updateQuery, options } =
                    this.createObjectsUpdate(platformResult, isValid);
                await this.updateNew(findQuery, updateQuery, options);

                if (!isValid) {
                    const msg = 'La novedad no cumple los requisitos de transición. Despachado.';
                    const meta = { ...this.newToSet, typeId: this.typeId, statusId: this.statusId };
                    throw new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default DispatchStrategy;