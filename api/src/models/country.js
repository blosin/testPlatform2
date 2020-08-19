import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const countrySchema = new Schema({
    country: {
        type: String,
        maxlength: 100,
        required: true
    },
    provinces: [
        {
            province: { type: String },
            cities: [
                {
                    city: { type: String }
                }
            ]
        }
    ]
}, {
    strict: false,
    timestamps: true,
    _id: false
});

countrySchema.plugin(uniqueValidator);
countrySchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('country', countrySchema);
