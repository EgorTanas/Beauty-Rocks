const express = require('express');
const router  = express.Router();

const {
  getAllAppointmentsAdmin,
  createAppointmentAdmin,
  updateAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment,
} = require('../../controllers/appointmentController');

router.get('/', getAllAppointmentsAdmin);

router.post('/', createAppointmentAdmin);

router.patch('/:id/status', updateAppointmentStatus);

router.put('/:id', rescheduleAppointment);

router.delete('/:id', deleteAppointment);

module.exports = router;
