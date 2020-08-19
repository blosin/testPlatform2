const { createLogger, transports } = require('winston');
require('winston-mongodb').MongoDB;

let logger = createLogger({
    transports: [
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: true,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: function (log) {
        if (!!log) {
            const data = JSON.parse(log);
            logger.http({ meta: data });
        }
    }
};

module.exports = logger;
