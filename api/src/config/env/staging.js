'use strict'
const path = require('path');

module.exports = {
	token: {
		secret: 'ts$s38*jsjmjnT1',
		expires: '1d', // expires in 24 hours
		noexpires: '100y', // expires in 100 years
	},
	baseUrl: process.env.BASE_URL || 'http://localhost',
	port: process.env.NODE_PORT || 3085,
	url: function () {
		return this.baseUrl + ':' + this.port
	},
	path: path.normalize(path.join(__dirname, '..')),
	database: {
		logging: 'console.log',
		timezone: '-03:00',
		username: 'smartfran',
		password: '1BKabcXW3g1d91OD',
		host: 'pedidostaging-wclmn.mongodb.net',
		name: 'smartfran',
		port: 27017
	},
};