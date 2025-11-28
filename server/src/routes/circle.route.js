const express = require('express');
const router = express.Router();
const circlesController = require('../controllers/circle.controller');
const apiKeyAuth = require('../middleware/apiKey.middleware');

/**
 * @swagger
 * /api/circles/match:
 *   post:
 *     summary: Find or create matching peer support circle
 *     tags: [Circles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - incidentType
 *               - locationRegion
 *             properties:
 *               incidentType:
 *                 type: string
 *                 example: "online_harassment"
 *               locationRegion:
 *                 type: string
 *                 example: "kenya"
 *               language:
 *                 type: string
 *                 default: "english"
 *               displayName:
 *                 type: string
 *                 example: "Brave Survivor"
 *               reportId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Match found or circle created
 */
router.post('/match', circlesController.findMatch);

/**
 * @swagger
 * /api/circles/{circleId}:
 *   get:
 *     summary: Get circle details
 *     tags: [Circles]
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Circle details
 *       404:
 *         description: Circle not found
 */
router.get('/:circleId', circlesController.getCircle);

/**
 * @swagger
 * /api/circles/{circleId}/messages:
 *   get:
 *     summary: Get messages from a circle
 *     tags: [Circles]
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/:circleId/messages', circlesController.getMessages);

/**
 * @swagger
 * /api/circles/{circleId}/messages:
 *   post:
 *     summary: Send message to circle
 *     tags: [Circles]
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anonymousId
 *               - message
 *             properties:
 *               anonymousId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       403:
 *         description: Not a member of this circle
 */
router.post('/:circleId/messages', circlesController.sendMessage);

/**
 * @swagger
 * /api/circles/{circleId}/leave:
 *   post:
 *     summary: Leave a circle
 *     tags: [Circles]
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anonymousId
 *             properties:
 *               anonymousId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Left circle successfully
 */
router.post('/:circleId/leave', circlesController.leaveCircle);

/**
 * @swagger
 * /api/circles/stats:
 *   get:
 *     summary: Get circle statistics (Developer API)
 *     tags: [Circles]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 *       401:
 *         description: Invalid API key
 */
router.get('/stats', apiKeyAuth, circlesController.getStats);

module.exports = router;