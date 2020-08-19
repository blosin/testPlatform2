import mongoose, { Schema } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const chainSchema = new Schema({
    chain: {
        type: String,
        maxlength: 100,
        required: true
    },
    domain: {
        type: String,
        maxlength: 100
    },
    contact: {
        type: String,
        maxlength: 100
    },
    phone: {
        type: String,
        maxlength: 15
    },
    address: {
        type: String
    },
    avatar: {
        type: String
    }
}, {
    strict: false,
    timestamps: true
});

chainSchema.plugin(uniqueValidator);
chainSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('chain', chainSchema);
