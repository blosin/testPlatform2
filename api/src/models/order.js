import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const orderSchema = new Schema({
	thirdParty: {
		type: String,
		require: true,
		maxlength: 100,
	},
	internalCode: {
		type: Number,
		require: true
	},
	state: {
		type: String,
		require: true,
		maxlength: 100,
	},
	orderId: {
		type: String,
		require: true,
		maxlength: 100,
	},
	originalId: {
		type: String,
		require: true,
		maxlength: 100,
		default: null
	},
	branchId: {
		type: Number,
		require: true,
		maxlength: 100,
	},
	order: {
		type: Object
	},
	timestamp: {
		type: Date,
		default: Date.now
	},
}, {
	strict: false,
	timestamps: true
});
orderSchema.plugin(uniqueValidator)
orderSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('order', orderSchema);
