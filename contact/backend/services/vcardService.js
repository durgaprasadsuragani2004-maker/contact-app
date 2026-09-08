const fs = require('fs');
const path = require('path');

/**
 * Escapes characters for vCard standard formatting
 */
function escapeVCard(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .trim();
}

/**
 * Format standard URL
 */
function formatUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url.trim() : `https://${url.trim()}`;
}

/**
 * Helper to embed photo buffer into vCard
 */
function getPhotoVCardLine(imageField) {
  if (!imageField) return null;
  try {
    let imageFilePath = '';
    if (imageField.startsWith('/uploads/')) {
      imageFilePath = path.resolve(__dirname, '..', imageField.substring(1));
    } else if (imageField.startsWith('uploads/')) {
      imageFilePath = path.resolve(__dirname, '..', imageField);
    }

    if (imageFilePath && fs.existsSync(imageFilePath)) {
      const ext = path.extname(imageFilePath).toLowerCase().replace('.', '');
      const imageType = (ext === 'png') ? 'PNG' : (ext === 'webp' ? 'WEBP' : 'JPEG');
      const fileBuffer = fs.readFileSync(imageFilePath);
      // Limit embedded photo size in vCard to under 1.5MB for iOS/Android stability
      if (fileBuffer.length < 1500000) {
        const base64Data = fileBuffer.toString('base64');
        return `PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}`;
      }
    }
  } catch (err) {
    console.warn('Could not embed photo in vCard:', err.message);
  }
  return null;
}

/**
 * Generate standard RFC compliant vCard (Version 3.0) for main Individual or Company profile
 */
function generateVCard(profile, socialLinks = []) {
  const isCompany = profile.account_type === 'company';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'PRODID:-//QRLync//Digital Business Card System//EN'];

  // Names & Organization
  if (isCompany) {
    const compName = profile.official_company_name || profile.company_name || 'Organization';
    lines.push(`FN:${escapeVCard(compName)}`);
    lines.push(`ORG:${escapeVCard(compName)}`);
    lines.push(`N:;;;;`);
    if (profile.contact_person_name) {
      lines.push(`X-CONTACT-PERSON:${escapeVCard(profile.contact_person_name)}`);
      if (profile.designation) {
        lines.push(`TITLE:${escapeVCard(profile.designation)}`);
      }
    }
  } else {
    const fullName = profile.full_name || 'Contact';
    const nameParts = fullName.trim().split(/\s+/);
    let lastName = '';
    let firstName = '';
    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else {
      lastName = nameParts.pop();
      firstName = nameParts.join(' ');
    }

    lines.push(`FN:${escapeVCard(fullName)}`);
    lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

    if (profile.company_name || profile.official_company_name) {
      const orgName = profile.official_company_name || profile.company_name;
      const dept = profile.department || '';
      lines.push(`ORG:${escapeVCard(orgName)}${dept ? ';' + escapeVCard(dept) : ''}`);
    }

    if (profile.designation) {
      lines.push(`TITLE:${escapeVCard(profile.designation)}`);
    }

    if (profile.department) {
      lines.push(`ROLE:${escapeVCard(profile.department)}`);
    }
  }

  // Telephones
  if (profile.phone) {
    const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }
  if (profile.alternate_phone) {
    const cleanAlt = profile.alternate_phone.replace(/[^0-9+]/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanAlt}`);
  }

  // Email
  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${profile.email.trim()}`);
  }

  // Website
  if (profile.website) {
    lines.push(`URL;TYPE=WORK:${formatUrl(profile.website)}`);
  }

  // Social URLs (from flat fields and relational social_links table)
  const addedUrls = new Set();
  if (profile.website) addedUrls.add(formatUrl(profile.website));

  if (profile.linkedin) {
    const url = formatUrl(profile.linkedin);
    if (!addedUrls.has(url)) {
      lines.push(`URL;TYPE=LinkedIn:${url}`);
      addedUrls.add(url);
    }
  }
  if (profile.github) {
    const url = formatUrl(profile.github);
    if (!addedUrls.has(url)) {
      lines.push(`URL;TYPE=GitHub:${url}`);
      addedUrls.add(url);
    }
  }
  if (profile.twitter) {
    const url = formatUrl(profile.twitter);
    if (!addedUrls.has(url)) {
      lines.push(`URL;TYPE=Twitter:${url}`);
      addedUrls.add(url);
    }
  }

  if (Array.isArray(socialLinks)) {
    for (const link of socialLinks) {
      if (link && link.url) {
        const u = formatUrl(link.url);
        if (!addedUrls.has(u)) {
          const type = (link.platform || 'OTHER').toUpperCase();
          lines.push(`URL;TYPE=${escapeVCard(type)}:${u}`);
          addedUrls.add(u);
        }
      }
    }
  }

  // Structured Address
  const streetParts = [profile.address_line_1, profile.address_line_2, profile.address, profile.landmark].filter(Boolean);
  const street = escapeVCard(streetParts.join(', '));
  const city = escapeVCard(profile.city || '');
  const state = escapeVCard(profile.state || '');
  const postal = escapeVCard(profile.pincode || '');
  const country = escapeVCard(profile.country || '');

  if (street || city || state || postal || country) {
    lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${postal};${country}`);
  }

  // Geographic Coordinates (GEO:lat;lng)
  if (profile.latitude && profile.longitude) {
    lines.push(`GEO:${profile.latitude};${profile.longitude}`);
  }

  // Bio / Notes / Company Details
  let notes = [];
  if (profile.bio) notes.push(profile.bio);
  if (profile.about_us) notes.push(`About: ${profile.about_us}`);
  if (profile.mission) notes.push(`Mission: ${profile.mission}`);
  if (profile.industry) notes.push(`Industry: ${profile.industry}`);
  if (profile.gst_number) notes.push(`GST/Registration ID: ${profile.gst_number}`);
  if (notes.length > 0) {
    lines.push(`NOTE:${escapeVCard(notes.join('\n\n'))}`);
  }

  // Photo
  const photoLine = getPhotoVCardLine(isCompany ? (profile.company_logo || profile.profile_photo) : (profile.profile_photo || profile.company_logo));
  if (photoLine) lines.push(photoLine);

  // Metadata
  lines.push(`CATEGORIES:${isCompany ? 'Company, Business' : 'Professional, Contact'}`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  return lines.join('\r\n') + '\r\n';
}

/**
 * Generate standard RFC compliant vCard for an individual Company Representative (company_contacts)
 */
function generatePersonVCard(person, companyProfile) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'PRODID:-//QRLync//Digital Contact Card//EN'];

  const fullName = person.name || 'Contact';
  const nameParts = fullName.trim().split(/\s+/);
  let lastName = '';
  let firstName = '';
  if (nameParts.length === 1) {
    firstName = nameParts[0];
  } else {
    lastName = nameParts.pop();
    firstName = nameParts.join(' ');
  }

  lines.push(`FN:${escapeVCard(fullName)}`);
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`);

  // Organization info
  const orgName = companyProfile ? (companyProfile.official_company_name || companyProfile.company_name || '') : '';
  if (orgName) {
    const dept = person.department || '';
    lines.push(`ORG:${escapeVCard(orgName)}${dept ? ';' + escapeVCard(dept) : ''}`);
  }

  if (person.designation) {
    lines.push(`TITLE:${escapeVCard(person.designation)}`);
  }
  if (person.department) {
    lines.push(`ROLE:${escapeVCard(person.department)}`);
  }

  // Telephones
  if (person.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${person.phone.replace(/[^0-9+]/g, '')}`);
  }
  if (person.alternate_phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${person.alternate_phone.replace(/[^0-9+]/g, '')}`);
  }

  // Email
  if (person.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${person.email.trim()}`);
  }

  // LinkedIn & URLs
  if (person.linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${formatUrl(person.linkedin)}`);
  }
  if (companyProfile && companyProfile.website) {
    lines.push(`URL;TYPE=WORK:${formatUrl(companyProfile.website)}`);
  }

  // Address (Inherited from company)
  if (companyProfile) {
    const streetParts = [companyProfile.address_line_1, companyProfile.address_line_2, companyProfile.address, companyProfile.landmark].filter(Boolean);
    const street = escapeVCard(streetParts.join(', '));
    const city = escapeVCard(companyProfile.city || '');
    const state = escapeVCard(companyProfile.state || '');
    const postal = escapeVCard(companyProfile.pincode || '');
    const country = escapeVCard(companyProfile.country || '');
    if (street || city || state || postal || country) {
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${postal};${country}`);
    }
  }

  // Notes
  if (person.notes) {
    lines.push(`NOTE:${escapeVCard(person.notes)}`);
  }

  // Photo (person photo if exists, otherwise fallback to company logo)
  const photoLine = getPhotoVCardLine(person.photo || (companyProfile ? companyProfile.company_logo : null));
  if (photoLine) lines.push(photoLine);

  lines.push('CATEGORIES:Representative, Contact');
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  return lines.join('\r\n') + '\r\n';
}

module.exports = {
  generateVCard,
  generatePersonVCard
};
