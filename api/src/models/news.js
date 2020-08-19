import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const newsSchema = new Schema({
	typeId: {
		type: Number,
		required: true
	},
	order: {
		type: Object,
		required: true
	},
	branchId: {
		type: Number,
		required: true
	},
	rejectedMessageId: {
		type: Number
	},
	viewed: {
		type: Date
	},
	traces: [{
		update: {
			type: Object
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	}]
}, {
	strict: false,
	timestamps: true
});
newsSchema.plugin(uniqueValidator);
newsSchema.plugin(require('@meanie/mongoose-to-json'));

newsSchema.statics.createTrace = (object) => {
	return {
		update: object
	}
}
module.exports = mongoose.model('news', newsSchema);
