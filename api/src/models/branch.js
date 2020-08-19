import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import platformSchema from './platform';
import chainSchema from './chain';
import clientSchema from './client';
import regionSchema from './region';

const branchSchema = new Schema({
	branchId: {
		type: Number,
		unique: true,
		required: true
	},
	branchSecret: {
		type: String,
		required: true,
		maxlength: 50
	},
	code: {
		type: Number
	},
	secret: {
		type: String
	},
	name: {
		type: String,
		required: true,
		maxlength: 100
	},
	branchPhone: {
		type: String,
		maxlength: 50
	},
	branchTimeout: {
		type: Number,
		required: true,
		default: 20
	},
	startDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	suspendedDate: {
		type: Date
	},
	address: {
		country: { type: String },
		province: { type: String },
		city: { type: String },
		region: { type: Schema.Types.ObjectId, ref: regionSchema },
		address: { type: String },
		cp: { type: Number },
		coordinates: { type: String }
	},
	platforms: [{
		platform: { type: Schema.Types.ObjectId, ref: platformSchema },
		branchReference: { type: String },
		branchIdReference: { type: Number },
		lastGetNews: { type: Date },
		progClosed: [{ close: Date, open: Date, description: String }]
	}],
	smartfran_sw: {
		agent: {
			installedVersion: {
				type: String,
				maxlength: 50
			},
			installedDate: {
				type: Date,
				default: Date.now
			}
		},
		notificator: {
			installedVersion: {
				type: String,
				maxlength: 50
			},
			installedDate: {
				type: Date,
				default: Date.now
			}
		},
	},
	tzo: {
		type: Number,
		default: -3,
		required: true
	},
	permissions: {
		type: Array,
		default: [
			'/api/branches/news',
			'/api/branches/parameters',
			'/api/branches/smartfran-sw/version'
		]
	},
	chain: {
		type: Schema.Types.ObjectId, ref: chainSchema
	},
	client: {
		type: Schema.Types.ObjectId, ref: clientSchema
	},
	deletedAt: {
		type: Date
	}
}, {
	strict: false,
	timestamps: true
});

branchSchema.index({
	'platforms.platform': 1,
	'platforms.branchReference': 1,
	'platforms.branchIdReference': 1
}, {
	unique: true
});

branchSchema.plugin(uniqueValidator)
branchSchema.plugin(require('@meanie/mongoose-to-json'));

branchSchema.statics.validateNewProgClosed = (platformBranch, dateFrom, timeToClose) => {
	if (!(typeof (timeToClose) == 'number') || !(timeToClose > 0))
		return 'TimeToClose must be greater than 0.';
	if (!platformBranch.progClosed || !platformBranch.progClosed.length) platformBranch.progClosed = [];
	const isOtherProg = platformBranch.progClosed.some((p) => dateFrom <= p.open);

	if (isOtherProg)
		return 'The restaurant is closed now.';
	else
		return '';
}

branchSchema.statics.findProgClosedToOpen = (platformBranch, dateFrom) => {

	if (!platformBranch.progClosed || !platformBranch.progClosed.length) platformBranch.progClosed = [];
	const closedProg = platformBranch.progClosed.find((p) => dateFrom <= p.open);

	if (!closedProg)
		return 'The restaurant has no closed programmed now.';
	else
		return closedProg;
}

//Crea el indice del campo BranchId
//Se deshabilita
/*
branchSchema.pre('validate', function (next) {
	// Only increment when the document is new
	if (this.isNew) {
		const model = mongoose.model('branch', branchSchema);
		model.findOne().select('branchId').sort('-branchId').then(res => {
			let id = (!!res) ? res.branchId : 0;
			this.branchId = (id + 1); // Increment count
			next();
		});
	} else {
		next();
	}
});*/

module.exports = mongoose.model('branch', branchSchema);
