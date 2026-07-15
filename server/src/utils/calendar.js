const { BRAND } = require('../config/brand');

const escapeText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

const pad = (value) => String(value).padStart(2, '0');

const toIcsDateTime = (date, time) => {
  const base = new Date(date);
  const [hours, minutes] = String(time || '00:00').split(':').map((part) => Number(part) || 0);
  const dt = new Date(base);
  dt.setHours(hours, minutes, 0, 0);
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
};

const buildCalendarAttachment = (appointment) => {
  const serviceName = appointment.service?.name || 'Salon appointment';
  const start = toIcsDateTime(appointment.date, appointment.startTime);
  const end = toIcsDateTime(appointment.date, appointment.endTime || appointment.startTime);
  const uid = `${appointment._id}@beauty-rocks.studio`;
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const description = [
    `Service: ${serviceName}`,
    `Specialist: ${appointment.teamMember?.name || 'N/A'}`,
    `Client: ${appointment.user?.username || 'N/A'}`,
    `Phone: ${appointment.user?.phone || 'N/A'}`,
    `Email: ${appointment.user?.email || 'N/A'}`,
  ].join('\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Beauty Rocks//Appointment//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-TIMEZONE:${BRAND.timezone}`,
    'BEGIN:VEVENT',
    `UID:${escapeText(uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${BRAND.timezone}:${start}`,
    `DTEND;TZID=${BRAND.timezone}:${end}`,
    `SUMMARY:${escapeText(`Beauty Rocks: ${serviceName}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(BRAND.address)}`,
    `ORGANIZER;CN=${escapeText(BRAND.shortName)}:mailto:${escapeText(BRAND.email)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`Your ${serviceName} appointment at Beauty Rocks starts in 2 hours.`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    filename: 'beauty-rocks-appointment.ics',
    content: ics,
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
  };
};

module.exports = { buildCalendarAttachment, escapeText };
