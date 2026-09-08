const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const QrCode = require('../models/QrCode');
const SocialLink = require('../models/SocialLink');
const CompanyContact = require('../models/CompanyContact');
const Service = require('../models/Service');
const BusinessHour = require('../models/BusinessHour');
const Analytics = require('../models/Analytics');
const { generateQRCodePNG, getPublicProfileUrl } = require('../services/qrService');

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ─────────────────────────────────────────────
    // 1. Individual Account — Rahul Sharma
    // ─────────────────────────────────────────────
    const individualEmail = 'rahul@example.com';
    let user1 = await User.findOne({ email: individualEmail });

    if (!user1) {
      user1 = await User.create({
        email: individualEmail,
        password_hash: passwordHash,
        account_type: 'individual'
      });

      const profile1 = await Profile.create({
        user_id: user1._id,
        username: 'rahul',
        account_type: 'individual',
        full_name: 'Rahul Sharma',
        company_name: 'TechNova Solutions',
        official_company_name: 'TechNova Solutions Pvt Ltd',
        designation: 'Principal Solutions Architect',
        department: 'Cloud Engineering & AI',
        phone: '+91 98765 43210',
        alternate_phone: '+91 80 1234 5678',
        email: 'rahul.sharma@technova.io',
        website: 'https://technova.io',
        address: 'Block B, Tech Park, Outer Ring Road',
        address_line_1: 'Block B, 4th Floor, Tech Park',
        address_line_2: 'Outer Ring Road, Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pincode: '560103',
        landmark: 'Near Ecospace Tech Park',
        latitude: 12.9279,
        longitude: 77.6271,
        bio: 'Passionate cloud architect with 10+ years specializing in distributed systems, high-scale microservices, and AI contact infrastructure. Speaker and open-source contributor.',
        linkedin: 'https://linkedin.com/in/rahul-sharma-architect',
        twitter: 'https://twitter.com/rahul_cloud',
        github: 'https://github.com/rahulsharma-dev',
        theme_color: '#4F46E5',
        badge_text: 'Verified Professional',
        is_public: true
      });

      await SocialLink.insertMany([
        { profile_id: profile1._id, platform: 'linkedin',  label: 'LinkedIn',        url: 'https://linkedin.com/in/rahul-sharma-architect', display_order: 0 },
        { profile_id: profile1._id, platform: 'github',    label: 'GitHub',           url: 'https://github.com/rahulsharma-dev',              display_order: 1 },
        { profile_id: profile1._id, platform: 'twitter',   label: 'X / Twitter',      url: 'https://twitter.com/rahul_cloud',                 display_order: 2 },
        { profile_id: profile1._id, platform: 'whatsapp',  label: 'WhatsApp',         url: 'https://wa.me/919876543210',                       display_order: 3 },
        { profile_id: profile1._id, platform: 'portfolio', label: 'Dev Portfolio',    url: 'https://rahulsharma.dev',                          display_order: 4 }
      ]);

      const token1 = 'rahul-demo-2026';
      const qrData1 = await generateQRCodePNG(getPublicProfileUrl(token1), '#4F46E5');
      await QrCode.create({
        user_id: user1._id,
        unique_token: token1,
        qr_image_data: qrData1,
        scans_count: 42
      });

      console.log('✅ Seeded Individual Account (rahul@example.com / Password123!)');
    } else {
      await Profile.updateOne(
        { user_id: user1._id },
        { $set: { username: 'rahul', latitude: 12.9279, longitude: 77.6271 } }
      );
    }

    // ─────────────────────────────────────────────
    // 2. Company Account — Apex Cloud Solutions
    // ─────────────────────────────────────────────
    const companyEmail = 'contact@apexcloud.com';
    let user2 = await User.findOne({ email: companyEmail });

    if (!user2) {
      user2 = await User.create({
        email: companyEmail,
        password_hash: passwordHash,
        account_type: 'company'
      });

      const profile2 = await Profile.create({
        user_id: user2._id,
        username: 'apexcloud',
        account_type: 'company',
        official_company_name: 'Apex Cloud Solutions Inc.',
        company_name: 'Apex Cloud',
        contact_person_name: 'Sarah Jenkins',
        designation: 'VP of Enterprise Partnerships',
        department: 'Global Growth',
        phone: '+1 (415) 555-0199',
        alternate_phone: '+1 (800) 555-APEX',
        email: 'contact@apexcloud.com',
        website: 'https://apexcloud.com',
        address: '500 Howard Street, Suite 400',
        address_line_1: '500 Howard Street',
        address_line_2: 'Suite 400, SoMa District',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        pincode: '94105',
        landmark: 'Across from Salesforce Transit Center',
        latitude: 37.7885,
        longitude: -122.3995,
        gst_number: 'US-EIN-987654321',
        industry: 'Cloud Infrastructure & Enterprise AI',
        bio: 'Apex Cloud provides state-of-the-art enterprise multi-cloud management, zero-trust security pipelines, and high-performance serverless infrastructure for Fortune 500 enterprises worldwide.',
        about_us: 'Apex Cloud Solutions is an enterprise cloud and artificial intelligence infrastructure company founded by Silicon Valley veterans.',
        mission: 'To empower global enterprises with autonomous, zero-trust cloud infrastructure that scales effortlessly.',
        vision: 'Pioneering the future of secure, self-optimizing multi-cloud systems.',
        founded_year: '2018',
        employee_count: '250+ Engineers & Specialists',
        areas_served: 'Global (Americas, EMEA, APAC)',
        linkedin: 'https://linkedin.com/company/apex-cloud-solutions',
        twitter: 'https://twitter.com/ApexCloudInc',
        youtube: 'https://youtube.com/@ApexCloudTech',
        theme_color: '#0D9488',
        badge_text: 'Enterprise Organization',
        is_public: true
      });

      await SocialLink.insertMany([
        { profile_id: profile2._id, platform: 'linkedin', label: 'Company LinkedIn',      url: 'https://linkedin.com/company/apex-cloud-solutions', display_order: 0 },
        { profile_id: profile2._id, platform: 'twitter',  label: 'Company X / Twitter',   url: 'https://twitter.com/ApexCloudInc',                   display_order: 1 },
        { profile_id: profile2._id, platform: 'github',   label: 'Apex OpenSource',        url: 'https://github.com/apexcloud-org',                   display_order: 2 },
        { profile_id: profile2._id, platform: 'youtube',  label: 'Tech Keynotes',           url: 'https://youtube.com/@ApexCloudTech',                 display_order: 3 },
        { profile_id: profile2._id, platform: 'whatsapp', label: 'WhatsApp Enterprise',    url: 'https://wa.me/14155550199',                           display_order: 4 },
        { profile_id: profile2._id, platform: 'website',  label: 'Official Portal',         url: 'https://apexcloud.com',                              display_order: 5 }
      ]);

      const token2 = 'apex-corp-2026';
      const qrData2 = await generateQRCodePNG(getPublicProfileUrl(token2), '#0D9488');
      await QrCode.create({
        user_id: user2._id,
        unique_token: token2,
        qr_image_data: qrData2,
        scans_count: 128
      });

      console.log('✅ Seeded Company Account (contact@apexcloud.com / Password123!)');
    } else {
      await Profile.updateOne(
        { user_id: user2._id },
        {
          $set: {
            username: 'apexcloud',
            official_company_name: 'Apex Cloud Solutions Inc.'
          }
        }
      );
    }

    const companyProfile = await Profile.findOne({ user_id: user2._id });
    if (companyProfile) {
      // 2a. Contacts (ensure exactly 3 demo contacts)
      const contactsCount = await CompanyContact.countDocuments({ profile_id: companyProfile._id });
      if (contactsCount !== 3) {
        await CompanyContact.deleteMany({ profile_id: companyProfile._id });
        await CompanyContact.insertMany([
          {
            profile_id: companyProfile._id,
            name: 'David Miller',
            designation: 'Chief Technology Officer',
            department: 'Engineering & R&D',
            email: 'david.miller@apexcloud.com',
            phone: '+1 (415) 555-0142',
            display_order: 0
          },
          {
            profile_id: companyProfile._id,
            name: 'Elena Rostova',
            designation: 'VP of Product',
            department: 'Product & Design',
            email: 'elena.rostova@apexcloud.com',
            phone: '+1 (415) 555-0143',
            display_order: 1
          },
          {
            profile_id: companyProfile._id,
            name: 'Marcus Vance',
            designation: 'Head of Global Customer Success',
            department: 'Client Solutions',
            email: 'marcus.vance@apexcloud.com',
            phone: '+1 (415) 555-0144',
            display_order: 2
          }
        ]);
      }

      // 2b. Services (ensure exactly 3 demo services)
      const servicesCount = await Service.countDocuments({ profile_id: companyProfile._id });
      if (servicesCount !== 3) {
        await Service.deleteMany({ profile_id: companyProfile._id });
        await Service.insertMany([
          {
            profile_id: companyProfile._id,
            title: 'Enterprise Multi-Cloud Mesh',
            description: 'Zero-trust cross-cloud interconnectivity with automated failover and SLA management.',
            display_order: 0
          },
          {
            profile_id: companyProfile._id,
            title: 'Autonomous Infrastructure AI',
            description: 'Self-healing Kubernetes clusters and AI-driven autoscaling pipelines.',
            display_order: 1
          },
          {
            profile_id: companyProfile._id,
            title: 'Zero-Trust Security Architecture',
            description: 'Military-grade end-to-end encryption, secret management, and SOC2 compliance.',
            display_order: 2
          }
        ]);
      }

      // 2c. Business Hours
      const hoursCount = await BusinessHour.countDocuments({ profile_id: companyProfile._id });
      if (hoursCount === 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        await BusinessHour.insertMany(days.map((day, idx) => ({
          profile_id: companyProfile._id,
          day_of_week: day,
          is_closed: day === 'Sunday',
          open_time: day === 'Saturday' ? '10:00' : '08:00',
          close_time: day === 'Saturday' ? '16:00' : '19:00',
          display_order: idx
        })));
      }
    }

    // ─────────────────────────────────────────────
    // 3. Seed Demo Analytics Events
    // ─────────────────────────────────────────────
    const analyticsCount = await Analytics.countDocuments();
    if (analyticsCount === 0) {
      const p1 = await Profile.findOne({ username: 'rahul' });
      const p2 = await Profile.findOne({ username: 'apexcloud' });
      const now = Date.now();
      const events = [];

      const devices = ['mobile', 'mobile', 'desktop', 'mobile', 'desktop', 'tablet'];
      const platforms = ['linkedin', 'github', 'twitter', 'whatsapp', 'portfolio'];

      const addEventsForProfile = (prof, count) => {
        if (!prof) return;
        for (let i = 0; i < count; i++) {
          const daysAgo = Math.floor(Math.random() * 14);
          const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000);
          const dev = devices[Math.floor(Math.random() * devices.length)];

          const rand = Math.random();
          let eventType = 'page_view';
          let meta = { device_type: dev };

          if (rand < 0.50) {
            eventType = 'page_view';
          } else if (rand < 0.75) {
            eventType = 'qr_scan';
          } else if (rand < 0.90) {
            eventType = 'link_click';
            const plat = platforms[Math.floor(Math.random() * platforms.length)];
            meta.platform = plat;
            meta.link_url = `https://${plat}.com/${prof.username || 'demo'}`;
          } else {
            eventType = 'vcard_download';
            meta.format = 'vcf';
          }

          events.push({
            profile_id: prof._id,
            user_id: prof.user_id,
            event_type: eventType,
            metadata: meta,
            created_at: timestamp
          });
        }
      };

      addEventsForProfile(p1, 60);
      addEventsForProfile(p2, 90);

      if (events.length > 0) {
        await Analytics.insertMany(events);
        console.log(`✅ Seeded ${events.length} realistic analytics events`);
      }
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const { init } = require('./mongo');
  init().then(() => seed()).then(() => process.exit(0));
}

module.exports = seed;
