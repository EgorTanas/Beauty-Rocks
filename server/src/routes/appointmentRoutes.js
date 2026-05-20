const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentController');

router.get('/available-slots', getAvailableSlots);

router.use(protect);

router.get('/', getMyAppointments);

router.post('/', createAppointment);

router.get('/:id', getAppointmentById);

router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
