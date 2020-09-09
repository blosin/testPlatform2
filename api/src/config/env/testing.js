'use strict'
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
		return this.baseUrl + ':' + this.port
	},
	path: path.normalize(path.join(__dirname, '..')),
	database: {
		username: 'smartfran',
		password: '9hc7Jm9Y3YhBAmLf',
		host: 'cluster0-a4ki3.mongodb.net',
		name: 'test',
		port: 27017
	},
	AWS: {
		REGION: 'us-east-2',
		SQS: {
			ORDER_PRODUCER: {
				NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/PlatformMessagesTST.fifo'
			},
			ORDER_CONSUMER: {
				NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/BranchMessagesTST.fifo'
			},
		}
	},
};