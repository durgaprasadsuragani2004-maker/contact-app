const Analytics = require('../models/Analytics');
const Profile = require('../models/Profile');
const QrCode = require('../models/QrCode');

/**
 * Helper to generate an array of YYYY-MM-DD date strings for the last N days
 */
function getLastNDays(n = 30) {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * GET /api/profile/analytics
 * Retrieve comprehensive owner analytics dashboard metrics
 */
async function getAnalyticsSummary(req, res) {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user_id: userId }).lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const qr = await QrCode.findOne({ user_id: userId }).lean();
    const daysCount = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const profileId = profile._id;

    // 1. Overall Lifetime Summary Counts
    const [pageViewsCount, qrScansCount, linkClicksCount, vcardDownloadsCount] = await Promise.all([
      Analytics.countDocuments({ profile_id: profileId, event_type: 'page_view' }),
      Analytics.countDocuments({ profile_id: profileId, event_type: 'qr_scan' }),
      Analytics.countDocuments({ profile_id: profileId, event_type: 'link_click' }),
      Analytics.countDocuments({ profile_id: profileId, event_type: 'vcard_download' })
    ]);

    const totalQrScans = Math.max(qr?.scans_count || 0, qrScansCount);
    const totalEngagements = pageViewsCount + totalQrScans + linkClicksCount + vcardDownloadsCount;

    // 2. Timeline aggregation (daily breakdown for the timeframe)
    const timelineData = await Analytics.aggregate([
      {
        $match: {
          profile_id: profileId,
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            event_type: '$event_type'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Build complete daily timeline map
    const dayLabels = getLastNDays(daysCount);
    const timelineMap = {};
    dayLabels.forEach(date => {
      timelineMap[date] = {
        date,
        page_views: 0,
        qr_scans: 0,
        link_clicks: 0,
        vcard_downloads: 0
      };
    });

    timelineData.forEach(item => {
      const date = item._id.date;
      const type = item._id.event_type;
      if (timelineMap[date]) {
        if (type === 'page_view') timelineMap[date].page_views += item.count;
        else if (type === 'qr_scan') timelineMap[date].qr_scans += item.count;
        else if (type === 'link_click') timelineMap[date].link_clicks += item.count;
        else if (type === 'vcard_download') timelineMap[date].vcard_downloads += item.count;
      }
    });

    const timeline = Object.values(timelineMap);

    // 3. Top Links Clicked Breakdown
    const topLinks = await Analytics.aggregate([
      {
        $match: {
          profile_id: profileId,
          event_type: 'link_click'
        }
      },
      {
        $group: {
          _id: {
            url: '$metadata.link_url',
            platform: '$metadata.platform'
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          url: '$_id.url',
          platform: '$_id.platform',
          clicks: 1
        }
      }
    ]);

    // 4. Device Breakdown
    const deviceAgg = await Analytics.aggregate([
      {
        $match: {
          profile_id: profileId
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$metadata.device_type', 'other'] },
          count: { $sum: 1 }
        }
      }
    ]);

    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      other: 0
    };
    deviceAgg.forEach(item => {
      const dev = item._id in devices ? item._id : 'other';
      devices[dev] += item.count;
    });

    // 5. Recent Activity Feed (Latest 15 events)
    const recentActivity = await Analytics.find({ profile_id: profileId })
      .sort({ created_at: -1 })
      .limit(15)
      .select('event_type metadata created_at')
      .lean();

    return res.json({
      success: true,
      analytics: {
        summary: {
          total_page_views: pageViewsCount,
          total_qr_scans: totalQrScans,
          total_link_clicks: linkClicksCount,
          total_vcard_downloads: vcardDownloadsCount,
          total_engagements: totalEngagements
        },
        timeframe: {
          days: daysCount,
          start_date: startDate.toISOString()
        },
        timeline,
        top_links: topLinks,
        devices,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics summary.' });
  }
}

module.exports = {
  getAnalyticsSummary
};
