const express = require('express');
const router = express.Router();

const { getServices, getServiceById } = require('../controllers/Servicecontroller');

// GET /api/services          — active services (public)
router.get('/', getServices);

// GET /api/services/:id      — single service (public)
router.get('/:id', getServiceById);

module.exports = router;