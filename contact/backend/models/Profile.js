const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens'],
    index: {
      unique: true,
      partialFilterExpression: { username: { $type: 'string' } }
    }
  },
  account_type: { type: String, enum: ['individual', 'company'], default: 'individual' },
  full_name: String,
  designation: String,
  department: String,
  company_name: String,
  official_company_name: String,
  profile_photo: String,
  contact_person_name: String,
  company_logo: String,
  gst_number: String,
  industry: String,
  phone: String,
  alternate_phone: String,
  email: String,
  website: String,
  address: String,
  address_line_1: String,
  address_line_2: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  landmark: String,
  latitude: Number,
  longitude: Number,
  bio: String,
  about_us: String,
  mission: String,
  vision: String,
  founded_year: String,
  employee_count: String,
  areas_served: String,
  linkedin: String,
  twitter: String,
  github: String,
  instagram: String,
  youtube: String,
  facebook: String,
  custom_links: String,
  theme_color: { type: String, default: '#4F46E5' },
  theme: {
    primaryColor: { type: String, default: '#4F46E5' },
    cardStyle: { type: String, enum: ['modern', 'glassmorphism', 'minimal'], default: 'modern' },
    fontFamily: { type: String, default: 'Inter' }
  },
  activeMode: { type: String, enum: ['all', 'work', 'personal'], default: 'all' },
  badge_text: String,
  is_public: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = model('Profile', profileSchema);
