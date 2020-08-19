'use strict'
import Rapiboy from '../rapiboy';

class RapiboySingleton {
    constructor() {
    }

    static getInstance(platform) {
        if (!RapiboySingleton.instance) {
            RapiboySingleton.instance = new Rapiboy(platform);
        }
        return RapiboySingleton.instance;
    }
}

export default RapiboySingleton;