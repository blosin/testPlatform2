import NewsTypeStrategy from '../newsTypeStrategy';

class OpenRestaurantStrategy extends NewsTypeStrategy {
    constructor(newToSet, branchId) {
        super(newToSet);
        this.branchId = branchId;
        this.entity = 'BRANCH';
    }

    manageNewType() {
        this.createPlatform(this.newToSet.platformId);

        return this.platform
            .openRestaurant(
                this.branchId);
    }
}

export default OpenRestaurantStrategy;