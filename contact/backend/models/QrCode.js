const { Schema, model } = require('mongoose');

const qrCodeSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  unique_token: { type: String, required: true, unique: true },
  qr_image_data: { type: String },
  darkColor: { type: String, default: '#000000' },
  lightColor: { type: String, default: '#ffffff' },
  format: { type: String, enum: ['png', 'svg'], default: 'png' },
  scans_count: { type: Number, default: 0 },
  last_scanned_at: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('QrCode', qrCodeSchema);
