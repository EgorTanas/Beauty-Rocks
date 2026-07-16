const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getAvailableSlots,
  createAppointment,
  getRescheduleRequestByToken,
  submitRescheduleRequest,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentController');

router.get('/available-slots', getAvailableSlots);
router.get('/reschedule/:token', getRescheduleRequestByToken);
router.post('/reschedule/:token', submitRescheduleRequest);

router.use(protect);

router.get('/', getMyAppointments);

router.post('/', createAppointment);

router.get('/:id', getAppointmentById);

router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
