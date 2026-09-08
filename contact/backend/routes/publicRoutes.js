const express = require('express');
const router = express.Router();
const {
  getPublicProfile,
  downloadVCard,
  downloadVCardVCT,
  downloadPersonVCard,
  downloadVCardByUsername,
  trackPublicEvent,
  captureLead
} = require('../controllers/publicController');

// Public profile retrieval by QR token
router.get('/profile/:token', getPublicProfile);

// Dynamic vCard (.vcf) download by username (or QR token fallback)
router.get('/:username/vcard', downloadVCardByUsername);

// Public lead capture ("Exchange Contact") endpoint
router.post('/:username/lead', captureLead);

// Event tracking for page views, QR scans, and link clicks
router.post('/track', trackPublicEvent);
router.post('/:token/track', trackPublicEvent);

// Direct vCard (.vcf) download by token
router.get('/contact/:token', downloadVCard);
router.get('/contact/:token/vct', downloadVCardVCT);
// Direct representative vCard download
router.get('/contact/:token/person/:contactId', downloadPersonVCard);

// Public profile retrieval by username (or token fallback)
router.get('/:username', getPublicProfile);

module.exports = router;
