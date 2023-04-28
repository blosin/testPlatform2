import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const enviroment = process.env.NODE_ENV === 'testing' ? 'testing' : 'api';

const platformSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 100,
      required: true,
      unique: true
    },
    active: {
      type: Boolean,     
      required: true,     
    },
    internalCode: {
      type: Number,
      unique: true,
      required: true
    },
    lastContact: {
      type: Date
    },
    credentials: {
      type: {
        String
      },
      data: {
        type: Object
      }
    },
    permissions: {
      type: Array,
      default: [
        `${enviroment}/thirdParties/orders`,
        `${enviroment}/thirdParties/orders/cancel`
      ],
      required: true
    },
    avatar: {
      type: String,
      required: false
    },
    domain: {
      type: String,
      required: false
    },
    contanct: {
      type: String,
      required: false
    },
    comments: {
      type: String,
      required: false
    },
    statusResponse: {
      delivery: {
        type: Boolean,
        required: false
      },
      reject: {
        type: Boolean,
        required: false
      },
      view: {
        type: Boolean,
        required: false
      },
      receive: {
        type: Boolean,
        required: false
      },
      dispatch: {
        type: Boolean,
        required: false
      },
      confirm: {
        type: Boolean,
        required: false
      },
      rejectedMessages: {
        type: Boolean,
        required: false
      },
      deliveryTimes: {
        type: Boolean,
        required: false
      }
    },
    autoReply: {
      type: Boolean,
      required: false
    }
  },
  {
    strict: false,
    timestamps: true
  }
);

platformSchema.plugin(uniqueValidator);
platformSchema.plugin(require('@meanie/mongoose-to-json'));

/*platformSchema.pre('validate', function (next) {
	// Only increment when the document is new
	if (this.isNew) {
		const model = mongoose.model('platform', platformSchema);
		model.findOne().select('internalCode').sort('-internalCode').then(res => {
			let id = (!!res) ? res.internalCode : 0;
			this.internalCode = (id + 1); // Increment count
			next();
		});
	} else {
		next();
	}
});*/

module.exports = mongoose.model('platform', platformSchema);
