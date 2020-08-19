import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import chainSchema from './chain';
import countrySchema from './country';

const clientSchema = new Schema({
    cuit: {
        type: String,
        maxlength: 100,
        required: true
    },
    clientCode: {
        type: String,
        maxlength: 100,
        required: true
    },
    contact: {
        type: String,
        maxlength: 100
    },
    businessName: {
        type: String,
        maxlength: 100,
        required: true
    },
    chainClientCode: {
        type: Number
    },
    franchiseeId: {
        type: String
    },
    email: {
        type: String,
        maxlength: 100,
        required: true
    },
    phone: {
        type: String,
        maxlength: 15
    },
    chain: {
        type: Schema.Types.ObjectId, ref: chainSchema,
        required: true
    },
    country: {
        type: String,
        required: true
    }
}, {
    strict: false,
    timestamps: true
});

clientSchema.plugin(uniqueValidator);
clientSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('client', clientSchema);
