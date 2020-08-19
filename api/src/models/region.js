import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import chainSchema from './chain';

const regionSchema = new Schema({
    region: {
        type: String,
        maxlength: 100,
        required: true
    },
    country: {
        type: String
    },
    chain: {
        type: Schema.Types.ObjectId, ref: chainSchema
    }
}, {
    strict: false,
    timestamps: true
});

regionSchema.plugin(uniqueValidator);
regionSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('region', regionSchema);
