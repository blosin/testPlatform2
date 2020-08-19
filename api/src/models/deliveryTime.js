import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const deliveryTimeSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    minMinutes: {
        type: Number,
        required: true,
    },
    maxMinutes: {
        type: Number,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: false,
    },
    platformId: {
        type: Number,
        required: true,
    },
}, {
    strict: false,
    timestamps: true
});

deliveryTimeSchema.plugin(uniqueValidator);
deliveryTimeSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('deliveryTime', deliveryTimeSchema, 'deliveryTimes');
