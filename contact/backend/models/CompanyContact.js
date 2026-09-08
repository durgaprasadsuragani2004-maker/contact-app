const { Schema, model } = require('mongoose');

const companyContactSchema = new Schema({
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  name: { type: String, required: true },
  photo: String,
  designation: String,
  department: String,
  phone: String,
  alternate_phone: String,
  email: String,
  linkedin: String,
  notes: String,
  display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('CompanyContact', companyContactSchema);
