import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new Schema({
    firstname: {
        type: String,
        maxlength: 100,
        required: true
    },
    lastname: {
        type: String,
        maxlength: 100,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    email: {
        type: String,
        maxlength: 100,
        required: true
    },
    dni: {
        type: Number
    },
    address: {
        type: String,
        maxlength: 100
    },
    user: {
        type: String,
        maxlength: 50,
        unique: true
    },
    password: {
        type: String,
        maxlength: 50,
    },
    permissions: {
        type: Array,
        default: [],
        required: true
    }
}, {
    strict: false,
    timestamps: true
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('user', userSchema);
