import NewsTypeStrategy from '../newsTypeStrategy';

class CloseRestaurantStrategy extends NewsTypeStrategy {
    constructor(newToSet, branchId) {
        super(newToSet);
        this.branchId = branchId;
        this.entity = 'BRANCH';
    }

    manageNewType() {
        this.createPlatform(this.newToSet.platformId);
        return this.platform
            .closeRestaurant(
                this.branchId,
                this.newToSet.timeToClose,
                this.newToSet.description);
    }
}

export default CloseRestaurantStrategy;