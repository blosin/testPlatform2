import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const logErrorSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    error: {
        type: Object,
    }
}, {
    strict: false,
    timestamps: true
});

logErrorSchema.plugin(uniqueValidator);
logErrorSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('logError', logErrorSchema);
