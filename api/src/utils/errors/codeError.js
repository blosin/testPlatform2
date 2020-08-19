const APP_BRANCH = {
    LOGIN: {
        code: 1000,
        name: 'Processing POST /branches/login',
    },
    GETNEWS: {
        code: 1001,
        name: 'Processing GET /branches/get-news',
    },
    SETNEWS: {
        code: 1002,
        name: 'Processing POST /branches/set-news',
    },
    PARAMS: {
        code: 1003,
        name: 'Processing GET /branches/params',
    },
};

const APP_PLATFORM = {
    LOGIN: {
        code: 1100,
        name: 'Processing POST /thirdParties/login',
    },
    GETORD: {
        code: 1101,
        name: 'Processing GET /thirdParties/orders',
    },
    CREATE: {
        code: 1102,
        name: 'Processing POST /thirdParties/orders',
    },
    REJECT: {
        code: 1103,
        name: 'Processing POST /thirdParties/orders/cancel',
    },
    INIT: {
        code: 1104,
        name: 'Initializating platform',
    },
    DRIVER: {
        code: 1105,
        name: 'Retrieving driver information',
    },
    RECEIVE: {
        code: 1106,
        name: 'Sending received status',
    },
    VIEW: {
        code: 1107,
        name: 'Sending viewed status',
    },
    CONFIRM: {
        code: 1108,
        name: 'Sending confirmed status',
    },
    DISPATCH: {
        code: 1109,
        name: 'Sending dispatched status',
    },
    DELIVERY: {
        code: 1110,
        name: 'Sending delivered status',
    },
    HEARTBEAT: {
        code: 1111,
        name: 'Sending the heartbeat',
    },
};

const DB = {
    FIND: {
        code: 2000,
        name: 'Executing find query.',
    },
    FINDONE: {
        code: 2001,
        name: 'Executing findOne query.',
    },
    FINDBYID: {
        code: 2002,
        name: 'Executing findById query.',
    },
    SAVE: {
        code: 2003,
        name: 'Executing save query.',
    },
    CONN: {
        code: 2004,
        name: 'DatabaseError',
    },
};

const CORE = {
    UNHANDLED: {
        code: 3000,
        name: 'UnhandledError',
    },
    UNCAUGHT: {
        code: 3001,
        name: 'uncaughtException',
    },
    TOKEN: {
        code: 3002,
        name: 'InvalidToken',
    },
    NOTAPI: {
        code: 3003,
        name: 'Not api endpoint',
    },
};


module.exports = {
    APP_BRANCH,
    APP_PLATFORM,
    DB,
    CORE
}
