const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a collision-resistant, URL-friendly token
 */
function generateUniqueToken() {
  return crypto.randomBytes(9).toString('base64url'); // e.g. "k9F_8z1Qm4xP"
}

/**
 * Build the full public URL for the QR code
 */
function getPublicProfileUrl(token, baseUrl) {
  const host = baseUrl || process.env.CLIENT_URL || 'http://localhost:5173';
  return `${host.replace(/\/$/, '')}/profile/${token}`;
}

function parseColorOptions(customColorOrOptions) {
  if (!customColorOrOptions) {
    return { dark: '#000000', light: '#FFFFFF' };
  }
  if (typeof customColorOrOptions === 'string') {
    return { dark: customColorOrOptions || '#000000', light: '#FFFFFF' };
  }
  return {
    dark: customColorOrOptions.darkColor || customColorOrOptions.dark || '#000000',
    light: customColorOrOptions.lightColor || customColorOrOptions.light || '#FFFFFF'
  };
}

/**
 * Generate high-res QR code image data URL (PNG)
 */
async function generateQRCodePNG(url, options = {}) {
  try {
    const colors = parseColorOptions(options);
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H', // High error correction allowing center logos
      type: 'image/png',
      margin: 2,
      width: 512,
      color: colors
    });
  } catch (err) {
    console.error('Error generating QR code PNG:', err);
    throw err;
  }
}

/**
 * Generate SVG string of the QR code
 */
async function generateQRCodeSVG(url, options = {}) {
  try {
    const colors = parseColorOptions(options);
    return await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: colors
    });
  } catch (err) {
    console.error('Error generating QR code SVG:', err);
    throw err;
  }
}

module.exports = {
  generateUniqueToken,
  getPublicProfileUrl,
  generateQRCodePNG,
  generateQRCodeSVG
};
