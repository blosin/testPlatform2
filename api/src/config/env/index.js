'use strict'

const _ = require('lodash');
const path = require('path');

if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'development';
module.exports = _.merge(
    require(path.join(__dirname, 'default.js')),
    require(path.join(__dirname, '/', process.env.NODE_ENV + '.js')) || {}
);