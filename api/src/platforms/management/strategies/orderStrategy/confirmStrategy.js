import NewsTypeStrategy from '../newsTypeStrategy';
import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';

class ConfirmStrategy extends NewsTypeStrategy {
    constructor(newToSet) {
        super(newToSet);
        this.savedNew = { _id: newToSet.id };
        this.statusId = NewsStateSingleton.idByCod('confirm');
        this.typeId = NewsTypeSingleton.idByCod('confirm_ord');
    }

    validateTransition() {
        const prevType = NewsTypeSingleton.idByCod('view_ord');
        return !!this.findTrace(prevType) && !this.findTrace(this.typeId);
    }

    createObjectsUpdate(platformResult, isValid) {
        try {
            this.createTrace(platformResult, isValid);
            this.trace.update.deliveryTimeId = this.newToSet.deliveryTimeId;
            const findQuery = { _id: this.savedNew._id };
            const updateQuery = {
                typeId: this.typeId,
                'order.statusId': this.statusId,
                $push: { traces: this.trace }
            };
            const options = {};

            if (!isValid)
                delete updateQuery['typeId'], updateQuery['order.statusId'];
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
                const isValid = this.validateTransition();
                let platformResult = null;
                if (isValid) {
                    platformResult = await this.platform
                        .confirmOrder(
                            this.savedNew.order,
                            this.newToSet.deliveryTimeId);
                }

                const { findQuery, updateQuery, options } =
                    this.createObjectsUpdate(platformResult, isValid);
                await this.updateNew(findQuery, updateQuery, options);

                if (!isValid) {
                    const msg = 'La novedad no cumple los requisitos de transición. Confirmado.';
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

export default ConfirmStrategy;