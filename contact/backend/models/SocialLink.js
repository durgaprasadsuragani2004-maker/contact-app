const { Schema, model } = require('mongoose');

const socialLinkSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  platform: { type: String, default: 'website' },
  label: { type: String, default: '' },
  url: { type: String, required: true },
  category: { type: String, enum: ['work', 'personal', 'both'], default: 'both' },
  display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('SocialLink', socialLinkSchema);
