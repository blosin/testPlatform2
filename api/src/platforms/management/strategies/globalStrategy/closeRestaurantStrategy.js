import NewsTypeStrategy from '../newsTypeStrategy';

class CloseRestaurantStrategy extends NewsTypeStrategy {
    constructor(newToSet, token) {
        super(newToSet);
        this.token = token;
        this.entity = 'BRANCH';
    }

    manageNewType() {
        this.createPlatform(this.newToSet.platformId);
        return this.platform
            .closeRestaurant(
                this.token,
                this.newToSet.timeToClose,
                this.newToSet.description);
    }
}

export default CloseRestaurantStrategy;