const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developer.controller');
const apiKeyAuth = require('../middleware/apiKey.middleware');

/**
 * @swagger
 * /api/developer/register:
 *   post:
 *     summary: Register for API key
 *     tags: [Developer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - appName
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "developer@example.com"
 *               appName:
 *                 type: string
 *                 example: "SafetyApp"
 *               appDescription:
 *                 type: string
 *                 example: "A safety app for my platform"
 *     responses:
 *       201:
 *         description: API key created
 *       400:
 *         description: Email already registered
 */
router.post('/register', developerController.register);

/**
 * @swagger
 * /api/developer/regenerate:
 *   post:
 *     summary: Regenerate API key
 *     tags: [Developer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - oldKey
 *             properties:
 *               email:
 *                 type: string
 *               oldKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: API key regenerated
 *       404:
 *         description: API key not found
 */
router.post('/regenerate', developerController.regenerate);

/**
 * @swagger
 * /api/developer/usage:
 *   get:
 *     summary: Check API usage and limits
 *     tags: [Developer]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics
 *       401:
 *         description: Invalid API key
 */
router.get('/usage', apiKeyAuth, developerController.getUsage);

module.exports = router;

