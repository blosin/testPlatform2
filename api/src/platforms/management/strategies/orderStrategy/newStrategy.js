import NewsTypeStrategy from '../newsTypeStrategy';

class NewStrategy extends NewsTypeStrategy {
    constructor(newToSet) {
        super(newToSet);
    }

    validateTransition() {
        return !!this.findTrace(this.savedNew.traces);
    }

    manageNewType() {
        return new Promise(async (resolve, reject) => {
            return resolve({
            });
        });
    }
}

export default NewStrategy;