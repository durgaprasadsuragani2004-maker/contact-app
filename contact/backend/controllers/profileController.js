const { generateUniqueToken, generateQRCodePNG, generateQRCodeSVG, getPublicProfileUrl } = require('../services/qrService');
const Profile = require('../models/Profile');
const QrCode = require('../models/QrCode');
const SocialLink = require('../models/SocialLink');
const CompanyContact = require('../models/CompanyContact');
const Service = require('../models/Service');
const BusinessHour = require('../models/BusinessHour');
const Lead = require('../models/Lead');

function normalizeId(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (plain._id !== undefined && plain.id === undefined) {
    plain.id = String(plain._id);
  }
  return plain;
}

function normalizeArray(items = []) {
  return items.map((item) => normalizeId(item));
}

// Calculate profile completion percentage based on account type
function calculateCompletion(profile, relations = {}) {
  if (!profile) return 0;

  const individualFields = [
    'full_name', 'phone', 'email', 'designation', 'company_name',
    'profile_photo', 'address', 'city', 'country', 'bio'
  ];

  const companyFields = [
    'official_company_name', 'phone', 'email', 'website', 'contact_person_name',
    'designation', 'company_logo', 'address', 'city', 'country', 'industry', 'bio'
  ];

  const fieldsToCheck = profile.account_type === 'company' ? companyFields : individualFields;
  let filled = 0;

  for (const field of fieldsToCheck) {
    if (profile[field] && String(profile[field]).trim().length > 0) {
      filled++;
    }
  }

  if (relations.social_links && relations.social_links.length > 0) filled += 1;
  if (profile.account_type === 'company') {
    if (relations.company_contacts && relations.company_contacts.length > 0) filled += 1;
    if (relations.services && relations.services.length > 0) filled += 1;
  }

  const totalPossible = fieldsToCheck.length + (profile.account_type === 'company' ? 3 : 1);
  return Math.min(100, Math.round((filled / totalPossible) * 100));
}

async function getProfileRelations(profileId) {
  const [social_links, company_contacts, services, business_hours] = await Promise.all([
    SocialLink.find({ profile_id: profileId }).sort({ display_order: 1, _id: 1 }).lean(),
    CompanyContact.find({ profile_id: profileId }).sort({ display_order: 1, _id: 1 }).lean(),
    Service.find({ profile_id: profileId }).sort({ display_order: 1, _id: 1 }).lean(),
    BusinessHour.find({ profile_id: profileId }).sort({ display_order: 1, _id: 1 }).lean()
  ]);

  return {
    social_links: normalizeArray(social_links),
    company_contacts: normalizeArray(company_contacts),
    services: normalizeArray(services),
    business_hours: normalizeArray(business_hours)
  };
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user_id: userId }).lean();
    const qr = await QrCode.findOne({ user_id: userId }).lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const profileData = normalizeId(profile);
    const relations = await getProfileRelations(profile._id);
    const completionPercentage = calculateCompletion(profileData, relations);
    const publicUrl = qr ? getPublicProfileUrl(qr.unique_token, `${req.protocol}://${req.get('host')}`) : '';

    return res.json({
      success: true,
      profile: {
        ...profileData,
        ...relations,
        completionPercentage
      },
      qrCode: qr ? {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        darkColor: qr.darkColor || '#000000',
        lightColor: qr.lightColor || '#ffffff',
        format: qr.format || 'png',
        publicUrl,
        scansCount: qr.scans_count,
        lastScannedAt: qr.last_scanned_at
      } : null
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      username,
      full_name,
      company_name,
      official_company_name,
      designation,
      department,
      contact_person_name,
      phone,
      alternate_phone,
      email,
      website,
      address,
      address_line_1,
      address_line_2,
      city,
      state,
      country,
      pincode,
      landmark,
      latitude,
      longitude,
      gst_number,
      industry,
      bio,
      about_us,
      mission,
      vision,
      founded_year,
      employee_count,
      areas_served,
      linkedin,
      twitter,
      github,
      instagram,
      youtube,
      facebook,
      custom_links,
      theme_color,
      theme,
      activeMode,
      badge_text,
      is_public,
      social_links,
      company_contacts,
      services,
      business_hours
    } = req.body;

    const currentProfile = await Profile.findOne({ user_id: userId }).lean();
    if (!currentProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    const profileId = currentProfile._id;

    const updatePayload = {};
    const assignIfDefined = (field, value) => {
      if (value !== undefined) updatePayload[field] = value;
    };

    if (username !== undefined) {
      if (username === '' || username === null) {
        updatePayload.username = null;
      } else {
        const clean = username.trim().toLowerCase();
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(clean)) {
          return res.status(400).json({
            success: false,
            message: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens.'
          });
        }
        const existing = await Profile.findOne({ username: clean, _id: { $ne: profileId } });
        if (existing) {
          return res.status(409).json({ success: false, message: 'Username is already taken by another profile.' });
        }
        updatePayload.username = clean;
      }
    }

    assignIfDefined('full_name', full_name);
    assignIfDefined('company_name', company_name);
    assignIfDefined('official_company_name', official_company_name);
    assignIfDefined('designation', designation);
    assignIfDefined('department', department);
    assignIfDefined('contact_person_name', contact_person_name);
    assignIfDefined('phone', phone);
    assignIfDefined('alternate_phone', alternate_phone);
    assignIfDefined('email', email);
    assignIfDefined('website', website);
    assignIfDefined('address', address);
    assignIfDefined('address_line_1', address_line_1);
    assignIfDefined('address_line_2', address_line_2);
    assignIfDefined('city', city);
    assignIfDefined('state', state);
    assignIfDefined('country', country);
    assignIfDefined('pincode', pincode);
    assignIfDefined('landmark', landmark);
    if (latitude !== undefined) {
      updatePayload.latitude = latitude !== '' && latitude !== null ? Number(latitude) : null;
    }
    if (longitude !== undefined) {
      updatePayload.longitude = longitude !== '' && longitude !== null ? Number(longitude) : null;
    }
    assignIfDefined('gst_number', gst_number);
    assignIfDefined('industry', industry);
    assignIfDefined('bio', bio);
    assignIfDefined('about_us', about_us);
    assignIfDefined('mission', mission);
    assignIfDefined('vision', vision);
    assignIfDefined('founded_year', founded_year);
    assignIfDefined('employee_count', employee_count);
    assignIfDefined('areas_served', areas_served);
    assignIfDefined('linkedin', linkedin);
    assignIfDefined('twitter', twitter);
    assignIfDefined('github', github);
    assignIfDefined('instagram', instagram);
    assignIfDefined('youtube', youtube);
    assignIfDefined('facebook', facebook);
    assignIfDefined('custom_links', typeof custom_links === 'object' ? JSON.stringify(custom_links) : (custom_links || null));

    if (theme !== undefined && typeof theme === 'object') {
      const primaryColor = theme.primaryColor || theme_color || currentProfile.theme?.primaryColor || currentProfile.theme_color || '#4F46E5';
      const cardStyle = ['modern', 'glassmorphism', 'minimal'].includes(theme.cardStyle) ? theme.cardStyle : (currentProfile.theme?.cardStyle || 'modern');
      const fontFamily = theme.fontFamily || currentProfile.theme?.fontFamily || 'Inter';
      updatePayload.theme = { primaryColor, cardStyle, fontFamily };
      updatePayload.theme_color = primaryColor;
    } else if (theme_color !== undefined) {
      updatePayload.theme_color = theme_color;
      updatePayload.theme = {
        primaryColor: theme_color,
        cardStyle: currentProfile.theme?.cardStyle || 'modern',
        fontFamily: currentProfile.theme?.fontFamily || 'Inter'
      };
    }

    if (activeMode !== undefined && ['all', 'work', 'personal'].includes(activeMode)) {
      updatePayload.activeMode = activeMode;
    }

    assignIfDefined('badge_text', badge_text);
    assignIfDefined('is_public', is_public !== undefined ? Boolean(is_public) : true);

    if (Object.keys(updatePayload).length > 0) {
      await Profile.findByIdAndUpdate(profileId, updatePayload, { new: true, runValidators: true });
    }

    if (Array.isArray(social_links)) {
      await SocialLink.deleteMany({ profile_id: profileId });
      const validLinks = social_links.filter((link) => link && link.url && link.url.trim());
      if (validLinks.length > 0) {
        await SocialLink.insertMany(validLinks.map((link, idx) => ({
          profile_id: profileId,
          platform: link.platform || 'website',
          label: link.label || '',
          url: link.url.trim(),
          category: ['work', 'personal', 'both'].includes(link.category) ? link.category : 'both',
          display_order: idx
        })));
      }
    }

    if (Array.isArray(company_contacts)) {
      await CompanyContact.deleteMany({ profile_id: profileId });
      const validContacts = company_contacts.filter((contact) => contact && contact.name && contact.name.trim());
      if (validContacts.length > 0) {
        await CompanyContact.insertMany(validContacts.map((contact, idx) => ({
          profile_id: profileId,
          name: contact.name.trim(),
          photo: contact.photo || null,
          designation: contact.designation || null,
          department: contact.department || null,
          phone: contact.phone || null,
          alternate_phone: contact.alternate_phone || null,
          email: contact.email || null,
          linkedin: contact.linkedin || null,
          notes: contact.notes || null,
          display_order: idx
        })));
      }
    }

    if (Array.isArray(services)) {
      await Service.deleteMany({ profile_id: profileId });
      const validServices = services.filter((service) => service && service.title && service.title.trim());
      if (validServices.length > 0) {
        await Service.insertMany(validServices.map((service, idx) => ({
          profile_id: profileId,
          title: service.title.trim(),
          description: service.description || null,
          image: service.image || null,
          link_url: service.link_url || null,
          display_order: idx
        })));
      }
    }

    if (Array.isArray(business_hours)) {
      await BusinessHour.deleteMany({ profile_id: profileId });
      const validHours = business_hours.filter((item) => item && item.day_of_week);
      if (validHours.length > 0) {
        await BusinessHour.insertMany(validHours.map((item, idx) => ({
          profile_id: profileId,
          day_of_week: item.day_of_week,
          is_closed: Boolean(item.is_closed),
          open_time: item.open_time || '09:00',
          close_time: item.close_time || '18:00',
          display_order: idx
        })));
      }
    }

    const updatedProfile = await Profile.findById(profileId).lean();
    const relations = await getProfileRelations(profileId);
    const completionPercentage = calculateCompletion(normalizeId(updatedProfile), relations);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: {
        ...normalizeId(updatedProfile),
        ...relations,
        completionPercentage
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

async function uploadMedia(req, res) {
  try {
    const userId = req.user.id;
    const { field = 'profile_photo' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    const profileUpdate = field === 'company_logo' ? { company_logo: relativePath } : { profile_photo: relativePath };
    await Profile.updateOne({ user_id: userId }, profileUpdate);

    const profile = await Profile.findOne({ user_id: userId }).lean();
    const normalizedProfile = profile ? normalizeId(profile) : null;
    const relations = profile ? await getProfileRelations(profile._id) : {};
    const completionPercentage = normalizedProfile ? calculateCompletion(normalizedProfile, relations) : 0;

    return res.json({
      success: true,
      message: 'Media uploaded successfully!',
      url: relativePath,
      field,
      profile: normalizedProfile ? {
        ...normalizedProfile,
        ...relations,
        completionPercentage
      } : null
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload media file.' });
  }
}

async function regenerateQR(req, res) {
  try {
    const userId = req.user.id;
    const existingQr = await QrCode.findOne({ user_id: userId }).lean();
    const darkColor = existingQr?.darkColor || '#000000';
    const lightColor = existingQr?.lightColor || '#ffffff';
    const format = existingQr?.format || 'png';

    const newToken = generateUniqueToken();
    const publicUrl = getPublicProfileUrl(newToken, `${req.protocol}://${req.get('host')}`);
    const qrData = format === 'svg'
      ? await generateQRCodeSVG(publicUrl, { darkColor, lightColor })
      : await generateQRCodePNG(publicUrl, { darkColor, lightColor });

    await QrCode.findOneAndUpdate(
      { user_id: userId },
      { unique_token: newToken, qr_image_data: qrData, darkColor, lightColor, format },
      { new: true, upsert: true }
    );

    const qr = await QrCode.findOne({ user_id: userId }).lean();

    return res.json({
      success: true,
      message: 'QR Code regenerated successfully!',
      qrCode: {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        darkColor: qr.darkColor || '#000000',
        lightColor: qr.lightColor || '#ffffff',
        format: qr.format || 'png',
        publicUrl,
        scansCount: qr.scans_count,
        lastScannedAt: qr.last_scanned_at
      }
    });
  } catch (error) {
    console.error('Error regenerating QR:', error);
    return res.status(500).json({ success: false, message: 'Failed to regenerate QR code.' });
  }
}

async function updateQrStyle(req, res) {
  try {
    const userId = req.user.id;
    const { darkColor = '#000000', lightColor = '#ffffff', format = 'png' } = req.body;

    const qr = await QrCode.findOne({ user_id: userId });
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR Code record not found.' });
    }

    const validFormat = format === 'svg' ? 'svg' : 'png';
    const publicUrl = getPublicProfileUrl(qr.unique_token, `${req.protocol}://${req.get('host')}`);
    const qrData = validFormat === 'svg'
      ? await generateQRCodeSVG(publicUrl, { darkColor, lightColor })
      : await generateQRCodePNG(publicUrl, { darkColor, lightColor });

    qr.darkColor = darkColor;
    qr.lightColor = lightColor;
    qr.format = validFormat;
    qr.qr_image_data = qrData;
    await qr.save();

    return res.json({
      success: true,
      message: 'QR Code styling updated successfully!',
      qrCode: {
        token: qr.unique_token,
        qrImage: qr.qr_image_data,
        darkColor: qr.darkColor,
        lightColor: qr.lightColor,
        format: qr.format,
        publicUrl,
        scansCount: qr.scans_count,
        lastScannedAt: qr.last_scanned_at
      }
    });
  } catch (err) {
    console.error('Error updating QR style:', err);
    return res.status(500).json({ success: false, message: 'Failed to update QR Code styling.' });
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user_id: userId }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const leads = await Lead.find({ profileId: profile._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      leads: normalizeArray(leads)
    });
  } catch (err) {
    console.error('Error fetching leads:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve captured leads.' });
  }
}

async function exportLeadsCSV(req, res) {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user_id: userId }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const leads = await Lead.find({ profileId: profile._id })
      .sort({ createdAt: -1 })
      .lean();

    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '""';
      const str = String(field);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['Name', 'Email', 'Phone', 'Note', 'Date'];
    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const dateVal = lead.createdAt || lead.created_at ? new Date(lead.createdAt || lead.created_at).toISOString() : '';
      const row = [
        escapeCsvField(lead.name || ''),
        escapeCsvField(lead.email || ''),
        escapeCsvField(lead.phone || ''),
        escapeCsvField(lead.note || ''),
        escapeCsvField(dateVal)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const safeName = (profile.username || profile.full_name || 'leads').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `leads_${safeName}_${new Date().toISOString().split('T')[0]}.csv`;

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache'
    });

    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting leads CSV:', err);
    return res.status(500).json({ success: false, message: 'Failed to export leads to CSV.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadMedia,
  regenerateQR,
  updateQrStyle,
  getLeads,
  exportLeadsCSV,
  calculateCompletion,
  getProfileRelations
};
