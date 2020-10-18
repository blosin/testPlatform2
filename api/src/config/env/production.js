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
				NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/PRD_PlatformMessages.fifo'
			},
			ORDER_CONSUMER: {
				NAME: 'https://sqs.us-east-1.amazonaws.com/382381053403/PRD_BranchMessages.fifo'
			},
		}
	}
};