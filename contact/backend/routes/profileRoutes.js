const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadMedia,
  regenerateQR,
  updateQrStyle,
  getLeads,
  exportLeadsCSV
} = require('../controllers/profileController');
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken);

router.get('/', getProfile);
router.get('/analytics', getAnalyticsSummary);
router.get('/leads/export', exportLeadsCSV);
router.get('/leads', getLeads);
router.put('/', updateProfile);
router.put('/qrcode', updateQrStyle);
router.post('/upload', upload.single('media'), uploadMedia);
router.post('/regenerate-qr', regenerateQR);

module.exports = router;
