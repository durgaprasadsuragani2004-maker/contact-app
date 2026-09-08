const { Schema, model } = require('mongoose');

const analyticsSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  event_type: {
    type: String,
    enum: ['page_view', 'qr_scan', 'link_click', 'vcard_download'],
    required: true,
    index: true
  },
  metadata: {
    link_url: String,
    platform: String,
    user_agent: String,
    device_type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'other'],
      default: 'other'
    },
    referrer: String,
    ip_hash: String
  },
  created_at: { type: Date, default: Date.now, index: true }
});

analyticsSchema.index({ profile_id: 1, created_at: -1 });
analyticsSchema.index({ profile_id: 1, event_type: 1 });

module.exports = model('Analytics', analyticsSchema);
