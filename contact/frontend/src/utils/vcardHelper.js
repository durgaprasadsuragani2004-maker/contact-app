/**
 * Helper to download vCard from either backend URL or client blob
 */
export function downloadVCardFile(token, profile) {
  // Option 1: Direct backend download link (best for standard headers & attachments)
  if (token) {
    const link = document.createElement('a');
    link.href = `/api/contact/${token}`;
    link.setAttribute('download', `${(profile?.full_name || profile?.company_name || 'contact').replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Option 2: Direct client-side vCard synthesis
  if (!profile) return;

  const isCompany = profile.account_type === 'company';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'PRODID:-//QRLync//Digital Contact Card//EN'];

  if (isCompany) {
    const compName = profile.official_company_name || profile.company_name || 'Organization';
    lines.push(`FN:${compName}`);
    lines.push(`ORG:${compName}`);
    if (profile.contact_person_name) {
      lines.push(`X-CONTACT-PERSON:${profile.contact_person_name}`);
      if (profile.designation) lines.push(`TITLE:${profile.designation}`);
    }
  } else {
    const fullName = profile.full_name || 'Contact';
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts.pop() : '';
    const firstName = parts.join(' ');
    lines.push(`FN:${fullName}`);
    lines.push(`N:${lastName};${firstName};;;`);

    if (profile.company_name || profile.official_company_name) {
      lines.push(`ORG:${profile.official_company_name || profile.company_name}`);
    }
    if (profile.designation) lines.push(`TITLE:${profile.designation}`);
    if (profile.department) lines.push(`ROLE:${profile.department}`);
  }

  if (profile.phone) lines.push(`TEL;TYPE=CELL,VOICE:${profile.phone.replace(/[^0-9+]/g, '')}`);
  if (profile.alternate_phone) lines.push(`TEL;TYPE=WORK,VOICE:${profile.alternate_phone.replace(/[^0-9+]/g, '')}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${profile.email}`);
  if (profile.website) lines.push(`URL;TYPE=WORK:${profile.website}`);
  if (profile.linkedin) lines.push(`URL;TYPE=LinkedIn:${profile.linkedin}`);
  
  if (profile.address || profile.city || profile.state || profile.country || profile.pincode) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address || ''};${profile.city || ''};${profile.state || ''};${profile.pincode || ''};${profile.country || ''}`);
  }

  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, '\\n')}`);
  lines.push('END:VCARD');

  const vcardText = lines.join('\r\n') + '\r\n';
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const fileName = `${(isCompany ? (profile.official_company_name || profile.company_name) : profile.full_name) || 'contact'}.vcf`;
  a.download = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
