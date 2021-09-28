'use strict';
const path = require('path');

module.exports = {
  token: {
    secret: 'ts$s38*jsjmjnT1',
    expires: '1d', // expires in 24 hours
    noexpires: '100y' // expires in 100 years
  },
  tokenStatic:
    '94c5426e3e001bfaef3563ecb6d3e2503df61684cbda87f3d7b36d66eaaaef245bf90a085f5743a3d70f47a9638c05db189d51d14a4709e177625853b4bc45d6',
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
    port: 27017
  },
  AWS: {
    REGION: 'us-east-2',
    SQS: {
      REGION: 'us-east-2',
      ORDER_PRODUCER: {
        NAME: 'https://sqs.us-east-2.amazonaws.com/382381053403/##_STG_PlatformMessages.fifo'
      },
      ORDER_CONSUMER: {
        NAME: 'https://sqs.us-east-2.amazonaws.com/382381053403/STG_BranchMessages.fifo'
      }
    }
  }
};
