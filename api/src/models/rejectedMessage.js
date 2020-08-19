import mongoose, { Schema } from 'mongoose';

const rejectedMessageSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    platformId: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: false,
    },
    descriptionES: {
        type: String,
        required: true,
        maxlength: 50
    },
    descriptionPT: {
        type: String,
        required: true,
        maxlength: 50
    },
    forRestaurant: {
        type: Boolean,
        required: true,
    },
    forLogistics: {
        type: Boolean,
        required: true,
    },
    forPickup: {
        type: Boolean,
        required: true,
    },
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('rejectedMessage', rejectedMessageSchema, 'rejectedMessages');
