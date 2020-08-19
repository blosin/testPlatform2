import NewsTypeSingleton from '../../../../utils/newsType';
import NewsStateSingleton from '../../../../utils/newsState';
import NewsTypeStrategy from '../newsTypeStrategy';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';

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
        return !this.findTrace(this.typeId) && !this.savedNew.traces.find((trace) => trace.update.typeId == rejType);
    }

    manageNewType() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('----', this.newToSet);
                this.savedNew = await this.findNew(this.newToSet.id);
                const isValid = this.validateTransition();
                console.log(isValid);

                let platformResult = null;
                if (isValid) {
                    platformResult = await this.platform
                        .viewOrder(
                            this.savedNew.order,
                            this.token);
                }
                console.log(',,,', platformResult);
                const { findQuery, updateQuery, options } =
                    this.createObjectsUpdate(platformResult, isValid);
                console.log({ findQuery, updateQuery, options });
                await this.updateNew(findQuery, updateQuery, options);

                if (!isValid) {
                    const msg = 'La novedad no cumple los requisitos de transición. Visto.';
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

export default ViewStrategy;