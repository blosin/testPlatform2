'use strict';
const path = require('path');

module.exports = {
  token: {
    secret: 'ts$s38*jsjmjnT1',
    expires: '1d', // expires in 24 hours
    noexpires: '100y' // expires in 100 years
  },
  peyaParams: {
    username: 'us-plugin-smartfran-001',
    password: 'DQdq6viGNe', 
    grant_type: 'client_credentials',// expires in 1800s
    secret : 'ooHie6eipahnee2i'
  },
  tokenStatic:
    '94c5426e3e001bfaef3563ecb6d3e2503df61684cbda87f3d7b36d66eaaaef245bf90a085f5743a3d70f47a9638c05db189d51d14a4709e177625853b4bc45d6',
  baseUrl: process.env.BASE_URL || 'http://localhost',
  apiUrlLastMile: 'http://localhost:3088/api',
  chainCode: 'Grido', //de momento se usa esta cambiar una vez que se cree el microservicio
  port: process.env.NODE_PORT || 3087,
  url: function () {
    return this.baseUrl + ':' + this.port;
  },
  path: path.normalize(path.join(__dirname, '..')),
  database: {
    username: 'concentrador',
    password: 'concentradoR_123',
    host: 'pedidossmartfran-narx2.mongodb.net',
    name: 'smartfran',
    port: 27017
  },
  AWS: {
    REGION: 'us-east-1',
    SQS: {
      REGION: 'us-east-1',
      ORDER_PRODUCER: {
        NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/##_PRD_PlatformMessages.fifo'
      },
      ORDER_CONSUMER: {
        NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/PRD_BranchMessages.fifo'
      }
    }
  }
};
