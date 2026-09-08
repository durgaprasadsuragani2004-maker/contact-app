const { Schema, model } = require('mongoose');

const serviceSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  title: { type: String, required: true },
  description: String,
  image: String,
  link_url: String,
  display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('Service', serviceSchema);
