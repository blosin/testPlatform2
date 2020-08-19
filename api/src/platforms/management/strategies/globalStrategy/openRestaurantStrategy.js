import NewsTypeStrategy from '../newsTypeStrategy';

class OpenRestaurantStrategy extends NewsTypeStrategy {
    constructor(newToSet, token) {
        super(newToSet);
        this.token = token;
        this.entity = 'BRANCH';
    }

    manageNewType() {
        this.createPlatform(this.newToSet.platformId);
        return this.platform
            .openRestaurant(
                this.token);
    }
}

export default OpenRestaurantStrategy;