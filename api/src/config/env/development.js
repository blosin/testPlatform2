'use strict';
import path from 'path';

module.exports = {
  token: {
    secret: 'ts$s38*jsjmjnT1',
    expires: '1d', // expires in 24 hours
    noexpires: '100y' // expires in 100 years
  },
  tokenStatic:
    '94c5426e3e001bfaef3563ecb6d3e2503df61684cbda87f3d7b36d66eaaaef245bf90a085f5743a3d70f47a9638c05db189d51d14a4709e177625853b4bc45d6',
  baseUrl: process.env.BASE_URL || 'http://localhost',
  apiUrlLastMile: 'http://localhost:3088/api',
  port: process.env.NODE_PORT || 3087,
  url: function () {
    return this.baseUrl + ':' + this.port;
  },
  path: path.normalize(path.join(__dirname, '..')),
  database: {
    username: 'smartfran',
    password: 'smartfraN_123',
    host: 'cluster0-ucici.mongodb.net',
    name: 'smartfran',
    port: 27017
  },
  AWS: {
    REGION: 'us-east-2',
    SQS: {
      REGION: 'us-east-2',
      ORDER_PRODUCER: {
        NAME: 'https://sqs.us-east-2.amazonaws.com/382381053403/##_DEV_PlatformMessages.fifo'
      },
      ORDER_CONSUMER: {
        NAME: 'https://sqs.us-east-2.amazonaws.com/382381053403/DEV_BranchMessages.fifo'
      }
    }
  }
};
