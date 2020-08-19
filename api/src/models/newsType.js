import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const newsTypeSchema = new Schema({
    typeId: {
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
    newsType: {
        type: String,
        enum : ['order','global'],
        default: 'order'
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

newsTypeSchema.plugin(uniqueValidator);
newsTypeSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model('newsType', newsTypeSchema, 'newsTypes');
