const { Schema, model } = require('mongoose');

const leadSchema = new Schema({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  note: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Support profile_id alias
leadSchema.virtual('profile_id').get(function() {
  return this.profileId;
});

module.exports = model('Lead', leadSchema);
