import NewsTypeStrategy from '../newsTypeStrategy';
import logger from '../../../../config/logger';

class WarningRestaurantStrategy extends NewsTypeStrategy {
    constructor(newToSet) {
        super(newToSet);
        this.entity = 'BRANCH';
    }

    manageNewType() {
        try {
            const msg = `[EMAIL-LOG] Branch Warning.`;
            logger.error({
                message: msg,
                meta: this.newToSet && this.newToSet.error ? this.newToSet.error : 'No error found.'
            });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default WarningRestaurantStrategy;