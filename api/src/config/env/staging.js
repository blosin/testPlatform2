'use strict';
const path = require('path');

module.exports = {
  token: {
    secret: 'ts$s38*jsjmjnT1',
    expires: '1d', // expires in 24 hours
    noexpires: '100y', // expires in 100 years
  },
  baseUrl: process.env.BASE_URL || 'http://localhost',
  port: process.env.NODE_PORT || 3087,
  url: function () {
    return this.baseUrl + ':' + this.port;
  },
  path: path.normalize(path.join(__dirname, '..')),
  database: {
    username: 'smartfran',
    password: 'abc123.-',
    host: 'pedidosstagingdos.dcejl.mongodb.net',
    name: 'smartfran',
    port: 27017,
  },
  AWS: {
    REGION: 'us-east-2',
    SQS: {
      REGION: 'us-east-2',
      ORDER_PRODUCER: {
        NAME:
          'https://sqs.us-east-2.amazonaws.com/382381053403/##_STG_PlatformMessages.fifo',
      },
      ORDER_CONSUMER: {
        NAME:
          'https://sqs.us-east-2.amazonaws.com/382381053403/STG_BranchMessages.fifo',
      },
    },
  },
};
