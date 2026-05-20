const express = require('express');
const router = express.Router();



const {
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
  uploadServiceImage,
} = require('../../controllers/Servicecontroller');

const { uploadSingle } = require('../../middleware/uploadMiddleware');


router.get('/', getAllServicesAdmin);


router.post('/upload-image', uploadSingle('image', 'services'), uploadServiceImage);

// POST /api/admin/services          — create
router.post('/', createService);

// PUT  /api/admin/services/:id      — update
router.put('/:id', updateService);

// DELETE /api/admin/services/:id    — hard delete
router.delete('/:id', deleteService);

// PATCH /api/admin/services/:id/toggle  — show / hide
router.patch('/:id/toggle', toggleServiceActive);

module.exports = router;