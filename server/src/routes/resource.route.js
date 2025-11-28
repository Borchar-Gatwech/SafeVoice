const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resource.controller');

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Find safety resources by location
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         example: "Kenya"
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         example: "Nairobi"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hotline, ngo, legal_aid, shelter, counseling, police, hospital]
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get('/', resourcesController.getResources);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get single resource details
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource details
 *       404:
 *         description: Resource not found
 */
router.get('/:id', resourcesController.getResource);

/**
 * @swagger
 * /api/resources/seed:
 *   post:
 *     summary: Seed database with African resources (Development only)
 *     tags: [Resources]
 *     responses:
 *       201:
 *         description: Resources seeded successfully
 */
router.post('/seed', resourcesController.seedResources);

module.exports = router;