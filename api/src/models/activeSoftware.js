import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const activeSoftwareSchema = new Schema(
  {
    agent: {
      actualVersion: {
        type: String,
        required: true,
        maxlength: 50
      },
      releaseUrl: {
        type: String,
        required: true,
        maxlength: 250
      },
      releaseDate: {
        type: Date,
        required: true
      }
    },
    notificator: {
      actualVersion: {
        type: String,
        required: true,
        maxlength: 50
      },
      releaseUrl: {
        type: String,
        required: true,
        maxlength: 250
      },
      releaseDate: {
        type: Date,
        required: true
      }
    },
    updaterVersion: {
      type: String,
      maxlength: 50
    }
  },
  {
    strict: false,
    timestamps: true
  }
);

activeSoftwareSchema.plugin(uniqueValidator);
activeSoftwareSchema.plugin(require('@meanie/mongoose-to-json'));

module.exports = mongoose.model(
  'activeSoftware',
  activeSoftwareSchema,
  'activeSoftware'
);
