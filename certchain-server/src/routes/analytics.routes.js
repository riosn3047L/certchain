import express from 'express';
import Certificate from '../models/Certificate.js';
import VerificationLog from '../models/VerificationLog.js';

const router = express.Router();

/**
 * @route GET /api/v1/analytics/overview
 * @desc Summary stats: total issued, active, revoked, verified today
 */
router.get('/overview', async (req, res, next) => {
  try {
    const totalIssued = await Certificate.countDocuments();
    const totalActive = await Certificate.countDocuments({ status: 'active' });
    const totalRevoked = await Certificate.countDocuments({ status: 'revoked' });

    // Verifications today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const verifiedToday = await VerificationLog.countDocuments({
      createdAt: { $gte: startOfDay }
    });

    // Total verifications all-time
    const totalVerifications = await VerificationLog.countDocuments();

    res.json({
      success: true,
      data: {
        totalIssued,
        totalActive,
        totalRevoked,
        verifiedToday,
        totalVerifications
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/analytics/verifications
 * @desc Time-series verification data (last 30 days)
 */
router.get('/verifications', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await VerificationLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/analytics/top-certificates
 * @desc Most verified certificates (top 10)
 */
router.get('/top-certificates', async (req, res, next) => {
  try {
    const topCerts = await Certificate.find()
      .sort({ verificationCount: -1 })
      .limit(10)
      .select('certId student.fullName student.degreeProgramme institutionName verificationCount');

    res.json({ success: true, data: topCerts });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/analytics/employer-categories
 * @desc Verification breakdown by employer/verifier type
 */
router.get('/employer-categories', async (req, res, next) => {
  try {
    const breakdown = await VerificationLog.aggregate([
      { $group: { _id: '$verifierType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/analytics/live-log
 * @desc Recent verification events (paginated)
 */
router.get('/live-log', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await VerificationLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VerificationLog.countDocuments();

    res.json({
      success: true,
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
