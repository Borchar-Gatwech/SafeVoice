const express = require('express');
const router = express.Router();
const { createReport, getReports, markReviewed } = require('../controllers/reportsController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit an anonymous incident report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Online harassment incident"
 *               description:
 *                 type: string
 *                 example: "I experienced harassment on a dating app..."
 *               category:
 *                 type: string
 *                 example: "🚨 Harassment"
 *               location:
 *                 type: string
 *                 example: "Nairobi, Kenya"
 *               contactMethod:
 *                 type: string
 *                 example: "email@example.com"
 *               seekingPeerSupport:
 *                 type: boolean
 *                 example: true
 *               incidentType:
 *                 type: string
 *                 example: "online_harassment"
 *               locationRegion:
 *                 type: string
 *                 example: "kenya"
 *               language:
 *                 type: string
 *                 example: "english"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/', createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: reviewed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reports
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, getReports);

/**
 * @swagger
 * /api/reports/{id}/reviewed:
 *   patch:
 *     summary: Mark a report as reviewed (Admin only)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report marked as reviewed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.patch('/:id/reviewed', auth, markReviewed);

module.exports = router;