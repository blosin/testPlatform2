import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const newsStateSchema = new Schema({
    stateId: {
        type: Number,
        required: true,
        unique:true
    },
    cod: {
        type: String,
        required: true,
        maxlength: 10,
        unique:true
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        maxlength: 50
    }
}, {
    strict: false,
    timestamps: true
});

newsStateSchema.plugin(uniqueValidator);
newsStateSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('newsState', newsStateSchema, 'newsStates');
