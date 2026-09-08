const QrCode = require('../models/QrCode');
const Profile = require('../models/Profile');
const SocialLink = require('../models/SocialLink');
const CompanyContact = require('../models/CompanyContact');
const Service = require('../models/Service');
const BusinessHour = require('../models/BusinessHour');
const Analytics = require('../models/Analytics');
const Lead = require('../models/Lead');
const { generateVCard, generatePersonVCard } = require('../services/vcardService');

function getDeviceType(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua)) return 'mobile';
  if (/windows|macintosh|linux/i.test(ua)) return 'desktop';
  return 'other';
}

async function recordAnalyticsEvent(profileId, userId, eventType, metadata = {}, req = null) {
  try {
    const userAgent = req?.headers ? (req.headers['user-agent'] || '') : (metadata.user_agent || '');
    const referrer = req?.headers ? (req.headers['referer'] || req.headers['referrer'] || '') : (metadata.referrer || '');
    const deviceType = metadata.device_type || getDeviceType(userAgent);

    await Analytics.create({
      profile_id: profileId,
      user_id: userId,
      event_type: eventType,
      metadata: {
        ...metadata,
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceType
      }
    });
  } catch (err) {
    console.warn('Analytics logging notice:', err.message);
  }
}

function addIdAlias(doc) {
  if (!doc) return doc;
  const normalized = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (normalized._id !== undefined && normalized.id === undefined) {
    normalized.id = String(normalized._id);
  }
  return normalized;
}

function addIdToArray(items = []) {
  return items.map((item) => addIdAlias(item));
}

// Helper to filter social links according to active mode ('all' | 'work' | 'personal')
function filterLinksByMode(links = [], activeMode = 'all') {
  if (!activeMode || activeMode === 'all') return links;
  return links.filter((link) => {
    const cat = link.category || 'both';
    return cat === 'both' || cat === activeMode;
  });
}

// Helper: fetch social links and any relational extensions for a profile
async function getProfileData(token) {
  let qrRecord = await QrCode.findOne({ unique_token: token }).lean();
  let profile = null;

  if (qrRecord) {
    profile = await Profile.findOne({ user_id: qrRecord.user_id }).lean();
  } else {
    // Also support lookup by username directly
    profile = await Profile.findOne({ username: token.toLowerCase().trim() }).lean();
    if (profile) {
      qrRecord = await QrCode.findOne({ user_id: profile.user_id }).lean();
    }
  }

  if (!profile) return { error: 404, message: 'Invalid or expired profile QR code.' };

  const [socialLinks, companyContacts, services, businessHours] = await Promise.all([
    SocialLink.find({ profile_id: profile._id }).sort({ display_order: 1, _id: 1 }).lean(),
    CompanyContact.find({ profile_id: profile._id }).sort({ display_order: 1, _id: 1 }).lean(),
    Service.find({ profile_id: profile._id }).sort({ display_order: 1, _id: 1 }).lean(),
    BusinessHour.find({ profile_id: profile._id }).sort({ display_order: 1, _id: 1 }).lean()
  ]);

  return { qrRecord, profile, socialLinks, companyContacts, services, businessHours };
}

// Get public profile by unique QR token or username
async function getPublicProfile(req, res) {
  try {
    const identifier = req.params.username || req.params.token;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'QR token or username is required.' });
    }

    const { error, message, qrRecord, profile, socialLinks, companyContacts, services, businessHours } = await getProfileData(identifier);
    if (error) return res.status(error).json({ success: false, message });

    if (profile.is_public === false) {
      return res.status(403).json({ success: false, message: 'This digital profile has been marked private by its owner.' });
    }

    // Increment scan count if accessed via QR token
    if (qrRecord) {
      await QrCode.updateOne({ _id: qrRecord._id }, { $inc: { scans_count: 1 }, $set: { last_scanned_at: new Date() } });
    }

    // Track analytics event (detect if visited via QR scan or web visit)
    const isFromQr = req.query.from === 'qr' || req.query.source === 'qr';
    recordAnalyticsEvent(profile._id, profile.user_id, isFromQr ? 'qr_scan' : 'page_view', {}, req);

    // Parse custom_links if stored as string
    let parsedCustomLinks = [];
    if (profile.custom_links) {
      try {
        parsedCustomLinks = typeof profile.custom_links === 'string' ? JSON.parse(profile.custom_links) : profile.custom_links;
      } catch (e) {
        parsedCustomLinks = [];
      }
    }

    // Filter social links based on activeMode (all, work, personal)
    const filteredSocialLinks = filterLinksByMode(socialLinks, profile.activeMode);

    // Build ready-to-use metadata (title, avatar image URL, job title, bio, OG tags)
    const isCompany = profile.account_type === 'company';
    const displayName = isCompany
      ? (profile.official_company_name || profile.company_name || 'Organization')
      : (profile.full_name || 'Contact');

    const jobTitle = isCompany
      ? (profile.industry || 'Company')
      : (profile.designation || profile.job_title || '');

    const bio = profile.bio || profile.about || (isCompany ? `Official digital contact card and company profile for ${displayName}.` : `Digital business card and verified contact profile of ${displayName}.`);

    const avatarUrl = isCompany
      ? (profile.company_logo || profile.profile_photo || '')
      : (profile.profile_photo || profile.company_logo || '');

    const metaTitle = `${displayName}${jobTitle ? ` - ${jobTitle}` : ''} | QRLync`;

    const metadata = {
      title: metaTitle,
      displayName,
      jobTitle,
      bio,
      avatarUrl,
      ogTitle: `${displayName}${jobTitle ? ` - ${jobTitle}` : ''}`,
      ogDescription: bio,
      ogImage: avatarUrl
    };

    return res.json({
      success: true,
      metadata,
      profile: {
        ...addIdAlias(profile),
        metadata,
        social_links: addIdToArray(filteredSocialLinks),
        company_contacts: addIdToArray(companyContacts),
        services: addIdToArray(services),
        business_hours: addIdToArray(businessHours),
        custom_links: parsedCustomLinks,
        token: qrRecord ? qrRecord.unique_token : (profile.username || token)
      }
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving public profile.' });
  }
}

// Build and send vCard response
async function sendVCard(req, res, ext = 'vcf') {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).send('QR token is required.');

    const { error, message, profile, socialLinks } = await getProfileData(token);
    if (error) return res.status(error).send(message);

    const filteredSocialLinks = filterLinksByMode(socialLinks, profile.activeMode);
    const vcardContent = generateVCard(profile, filteredSocialLinks);

    const displayName = profile.account_type === 'company'
      ? (profile.official_company_name || profile.company_name || 'Organization')
      : (profile.full_name || 'Contact');

    const cleanFilename = displayName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    res.set({
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanFilename}.${ext}"`,
      'Cache-Control': 'no-cache'
    });

    recordAnalyticsEvent(profile._id, profile.user_id, 'vcard_download', { format: ext, token }, req);

    return res.send(vcardContent);
  } catch (error) {
    console.error(`Error generating vCard (.${ext}) download:`, error);
    return res.status(500).send('Error generating vCard.');
  }
}

// Generate & Download Main Profile vCard (.vcf) file
async function downloadVCard(req, res) {
  return sendVCard(req, res, 'vcf');
}

// Generate & Download Main Profile vCard (.vct) file
async function downloadVCardVCT(req, res) {
  return sendVCard(req, res, 'vct');
}

// Generate & Download Individual Company Contact Person vCard
async function downloadPersonVCard(req, res) {
  try {
    const { token, contactId } = req.params;
    if (!token || !contactId) {
      return res.status(400).send('Token and Contact Person ID are required.');
    }

    const qrRecord = await QrCode.findOne({ unique_token: token }).lean();
    if (!qrRecord) return res.status(404).send('Invalid or expired profile QR code.');

    const profile = await Profile.findOne({ user_id: qrRecord.user_id }).lean();
    if (!profile) return res.status(404).send('Company profile not found.');

    const person = await CompanyContact.findOne({ _id: contactId, profile_id: profile._id }).lean();

    if (!person) return res.status(404).send('Contact person not found.');

    const vcardContent = generatePersonVCard(person, profile);
    const cleanFilename = (person.name || 'contact_person').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    res.set({
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanFilename}.vcf"`,
      'Cache-Control': 'no-cache'
    });

    return res.send(vcardContent);
  } catch (error) {
    console.error('Error downloading person vCard:', error);
    return res.status(500).send('Error generating representative vCard.');
  }
}

// Generate & Download vCard (.vcf) by username or fallback token
async function downloadVCardByUsername(req, res) {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).send('Username is required.');
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Try finding Profile directly by username
    let profile = await Profile.findOne({ username: cleanUsername }).lean();

    // 2. Fallback: Lookup by QrCode unique_token
    if (!profile) {
      const qrRecord = await QrCode.findOne({ unique_token: username.trim() }).lean();
      if (qrRecord) {
        profile = await Profile.findOne({ user_id: qrRecord.user_id }).lean();
      }
    }

    if (!profile) {
      return res.status(404).send('Profile not found for the requested user.');
    }

    if (profile.is_public === false) {
      return res.status(403).send('This digital profile is private.');
    }

    const socialLinks = await SocialLink.find({ profile_id: profile._id })
      .sort({ display_order: 1, _id: 1 })
      .lean();

    const filteredSocialLinks = filterLinksByMode(socialLinks, profile.activeMode);
    const vcardContent = generateVCard(profile, filteredSocialLinks);

    const displayName = profile.account_type === 'company'
      ? (profile.official_company_name || profile.company_name || 'Organization')
      : (profile.full_name || 'Contact');

    const cleanFilename = displayName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    res.set({
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanFilename}.vcf"`,
      'Cache-Control': 'no-cache'
    });

    // Log vcard_download event
    recordAnalyticsEvent(profile._id, profile.user_id, 'vcard_download', { format: 'vcf', username }, req);

    return res.send(vcardContent);
  } catch (error) {
    console.error('Error downloading vCard by username:', error);
    return res.status(500).send('Error generating vCard.');
  }
}

// Public event tracker endpoint for page views, QR scans, and link clicks
async function trackPublicEvent(req, res) {
  try {
    const identifier = req.params.token || req.body.token || req.body.username;
    const { event_type, metadata = {} } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Profile token or username is required.' });
    }

    const validTypes = ['page_view', 'qr_scan', 'link_click', 'vcard_download'];
    if (!event_type || !validTypes.includes(event_type)) {
      return res.status(400).json({
        success: false,
        message: `Valid event_type (${validTypes.join(', ')}) is required.`
      });
    }

    const clean = identifier.trim().toLowerCase();
    let profile = await Profile.findOne({ username: clean }).lean();
    let qrRecord = null;

    if (!profile) {
      qrRecord = await QrCode.findOne({ unique_token: identifier.trim() }).lean();
      if (qrRecord) {
        profile = await Profile.findOne({ user_id: qrRecord.user_id }).lean();
      }
    } else {
      qrRecord = await QrCode.findOne({ user_id: profile.user_id }).lean();
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found for the requested identifier.' });
    }

    // Increment scan count if event is a QR scan
    if (event_type === 'qr_scan' && qrRecord) {
      await QrCode.updateOne(
        { _id: qrRecord._id },
        { $inc: { scans_count: 1 }, $set: { last_scanned_at: new Date() } }
      );
    }

    await recordAnalyticsEvent(profile._id, profile.user_id, event_type, metadata, req);

    return res.json({
      success: true,
      message: `${event_type} event recorded successfully.`
    });
  } catch (error) {
    console.error('Error tracking public event:', error);
    return res.status(500).json({ success: false, message: 'Failed to record analytics event.' });
  }
}

// Lead Capture / Exchange Contact endpoint
async function captureLead(req, res) {
  try {
    const identifier = req.params.username || req.params.token;
    const { name, email, phone, note } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Profile username or token is required.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Your name is required to exchange contact.' });
    }

    const hasEmail = email && email.trim().length > 0;
    const hasPhone = phone && phone.trim().length > 0;
    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ success: false, message: 'Please provide either an email or phone number.' });
    }

    const clean = identifier.trim().toLowerCase();
    let profile = await Profile.findOne({ username: clean }).lean();

    if (!profile) {
      const qrRecord = await QrCode.findOne({ unique_token: identifier.trim() }).lean();
      if (qrRecord) {
        profile = await Profile.findOne({ user_id: qrRecord.user_id }).lean();
      }
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const newLead = await Lead.create({
      profileId: profile._id,
      name: name.trim(),
      email: hasEmail ? email.trim().toLowerCase() : null,
      phone: hasPhone ? phone.trim() : null,
      note: note ? note.trim() : null
    });

    return res.status(201).json({
      success: true,
      message: 'Contact details exchanged successfully!',
      lead: addIdAlias(newLead)
    });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return res.status(500).json({ success: false, message: 'Failed to exchange contact details.' });
  }
}

module.exports = {
  getPublicProfile,
  downloadVCard,
  downloadVCardVCT,
  downloadPersonVCard,
  downloadVCardByUsername,
  trackPublicEvent,
  captureLead
};
