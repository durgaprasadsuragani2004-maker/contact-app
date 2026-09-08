const { Schema, model } = require('mongoose');

const businessHourSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  day_of_week: { type: String, required: true },
  is_closed: { type: Boolean, default: false },
  open_time: { type: String, default: '09:00' },
  close_time: { type: String, default: '18:00' },
  display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('BusinessHour', businessHourSchema);
