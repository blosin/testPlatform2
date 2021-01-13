'use strict';
const path = require('path');

module.exports = {
  token: {
    secret: 'ts$s38*jsjmjnT1',
    expires: '1d', // expires in 24 hours
    noexpires: '100y' // expires in 100 years
  },
  baseUrl: process.env.BASE_URL || 'http://localhost',
  port: process.env.NODE_PORT || 3087,
  url: function () {
    return this.baseUrl + ':' + this.port;
  },
  path: path.normalize(path.join(__dirname, '..')),
  database: {
    username: 'pruebaperfomance',
    password: 'performance123.-',
    host: 'pruebaperformance.et7kv.mongodb.net',
    name: 'PruebaPerformance',
    port: 27017
  },
  AWS: {
    REGION: 'us-west-2',
    SQS: {
      REGION: 'us-west-2',
      ORDER_PRODUCER: {
        NAME:
          'https://sqs.us-west-2.amazonaws.com/382381053403/##_PER_PlatformMessages.fifo'
      },
      ORDER_CONSUMER: {
        NAME:
          'https://sqs.us-west-2.amazonaws.com/382381053403/PER_BranchMessages.fifo'
      }
    }
  }
};
