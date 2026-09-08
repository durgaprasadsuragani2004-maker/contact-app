// Auth controller using Mongoose
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { generateUniqueToken, generateQRCodePNG, getPublicProfileUrl } = require('../services/qrService');
const { calculateCompletion, getProfileRelations } = require('./profileController');

// Mongoose models
const User = require('../models/User');
const Profile = require('../models/Profile');
const QrCode = require('../models/QrCode');

function addIdAlias(doc) {
  if (!doc) return doc;
  const normalized = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (normalized._id !== undefined && normalized.id === undefined) {
    normalized.id = String(normalized._id);
  }
  return normalized;
}

// Register a new user (Individual or Company)
async function register(req, res) {
  try {
    const {
      email,
      password,
      username,
      account_type = 'individual',
      full_name,
      company_name,
      official_company_name,
      phone,
      designation,
      contact_person_name,
      city,
      country
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (!['individual', 'company'].includes(account_type)) {
      return res.status(400).json({ success: false, message: 'Invalid account type specified.' });
    }

    let cleanUsername = null;
    if (username) {
      cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens.'
        });
      }
      const existingUsername = await Profile.findOne({ username: cleanUsername }).exec();
      if (existingUsername) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password_hash,
      account_type
    });
    const userId = newUser._id;

    // Create initial profile
    const initialProfileData = {
      user_id: userId,
      account_type,
      full_name: account_type === 'individual' ? (full_name || 'My Name') : '',
      company_name: company_name || official_company_name || '',
      official_company_name: official_company_name || company_name || '',
      designation: designation || '',
      contact_person_name: account_type === 'company' ? (contact_person_name || full_name || '') : '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      city: city || '',
      country: country || ''
    };
    if (cleanUsername) {
      initialProfileData.username = cleanUsername;
    }
    await Profile.create(initialProfileData);

    // Generate unique token for QR code
    const uniqueToken = generateUniqueToken();
    const publicUrl = getPublicProfileUrl(uniqueToken, `${req.protocol}://${req.get('host')}`);
    const qrDataUrl = await generateQRCodePNG(publicUrl);

    await QrCode.create({
      user_id: userId,
      unique_token: uniqueToken,
      qr_image_data: qrDataUrl,
      scans_count: 0
    });

    // Generate JWT
    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), account_type }, JWT_SECRET, {
      expiresIn: '30d'
    });

    // Fetch created profile & QR
    const profile = await Profile.findOne({ user_id: userId }).lean().exec();
    const qr = await QrCode.findOne({ user_id: userId }).lean().exec();

    let enrichedProfile = null;
    if (profile) {
      const relations = await getProfileRelations(profile._id);
      const profilePayload = addIdAlias(profile);
      const completionPercentage = calculateCompletion(profilePayload, relations);
      enrichedProfile = {
        ...profilePayload,
        ...relations,
        completionPercentage
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: String(userId),
        email: email.toLowerCase().trim(),
        account_type
      },
      profile: enrichedProfile,
      qrCode: {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        publicUrl,
        scansCount: qr.scans_count
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
}

// User login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email, account_type: user.account_type }, JWT_SECRET, {
      expiresIn: '30d'
    });

    // Fetch profile & QR code
    const profile = await Profile.findOne({ user_id: user._id }).lean().exec();
    let qr = await QrCode.findOne({ user_id: user._id }).lean().exec();

    // If QR code doesn't exist or is missing image, generate it
    if (!qr) {
      const uniqueToken = generateUniqueToken();
      const publicUrl = getPublicProfileUrl(uniqueToken, `${req.protocol}://${req.get('host')}`);
      const qrDataUrl = await generateQRCodePNG(publicUrl);
      await QrCode.create({ user_id: user._id, unique_token: uniqueToken, qr_image_data: qrDataUrl, scans_count: 0 });
      qr = { unique_token: uniqueToken, qr_image_data: qrDataUrl, scans_count: 0 };
    }

    const publicUrl = getPublicProfileUrl(qr.unique_token, `${req.protocol}://${req.get('host')}`);

    let enrichedProfile = null;
    if (profile) {
      const relations = await getProfileRelations(profile._id);
      const profilePayload = addIdAlias(profile);
      const completionPercentage = calculateCompletion(profilePayload, relations);
      enrichedProfile = {
        ...profilePayload,
        ...relations,
        completionPercentage
      };
    }

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: String(user._id),
        email: user.email,
        account_type: user.account_type,
        created_at: user.created_at
      },
      profile: enrichedProfile,
      qrCode: {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        publicUrl,
        scansCount: qr.scans_count
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// Get authenticated user's current session & full data
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('_id email account_type created_at').lean().exec();
    const profile = await Profile.findOne({ user_id: userId }).lean().exec();
    const qr = await QrCode.findOne({ user_id: userId }).lean().exec();

    const publicUrl = qr ? getPublicProfileUrl(qr.unique_token, `${req.protocol}://${req.get('host')}`) : '';

    let enrichedProfile = null;
    if (profile) {
      const relations = await getProfileRelations(profile._id);
      const profilePayload = addIdAlias(profile);
      const completionPercentage = calculateCompletion(profilePayload, relations);
      enrichedProfile = {
        ...profilePayload,
        ...relations,
        completionPercentage
      };
    }

    return res.json({
      success: true,
      user: addIdAlias(user),
      profile: enrichedProfile,
      qrCode: qr ? {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        publicUrl,
        scansCount: qr.scans_count,
        lastScannedAt: qr.last_scanned_at
      } : null
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user data.' });
  }
}

// Update password
async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ _id: userId }, { password_hash: newHash, updated_at: new Date() }).exec();

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};
