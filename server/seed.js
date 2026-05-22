/**
 * Beauty Rocks — DB Seed Script
 * 
 * Rulare:
 *   node seed.js              → adaugă date (skip dacă există deja)
 *   node seed.js --force      → șterge tot și reîncarcă
 *   node seed.js --only team  → doar team members
 *   node seed.js --only services → doar servicii
 *
 * Asigură-te că ai MONGO_URI în .env (sau setat în env) înainte de rulare.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ─── Models ──────────────────────────────────────────────────────────────────
const TeamMember = require('./src/models/TeamMember');
const Service    = require('./src/models/service');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const TEAM = [
  {
    name: 'Sofia Rusu',
    role: 'Senior Nail Artist',
    bio: 'Specialist cu peste 8 ani experiență în nail art și manichiură clasică. Pasionată de tehnici moderne și designuri personalizate.',
    specialties: ['Gel manicure', 'Nail art', 'Ombre nails', 'Acrylics'],
    workingHours: {
      monday:    { start: '09:00', end: '18:00' },
      tuesday:   { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday:  { start: '09:00', end: '18:00' },
      friday:    { start: '09:00', end: '17:00' },
      saturday:  { start: '10:00', end: '16:00' },
      sunday:    { start: null,    end: null     },
    },
    isActive: true,
    order: 1,
  },
  {
    name: 'Elena Moraru',
    role: 'Hair Stylist',
    bio: 'Coafură profesionistă specializată în tăieturi moderne, colorații și tratamente de îngrijire a părului.',
    specialties: ['Balayage', 'Keratin treatment', 'Hair coloring', 'Brazilian blowout'],
    workingHours: {
      monday:    { start: '10:00', end: '19:00' },
      tuesday:   { start: '10:00', end: '19:00' },
      wednesday: { start: '10:00', end: '19:00' },
      thursday:  { start: '10:00', end: '19:00' },
      friday:    { start: '10:00', end: '18:00' },
      saturday:  { start: '09:00', end: '15:00' },
      sunday:    { start: null,    end: null     },
    },
    isActive: true,
    order: 2,
  },
  {
    name: 'Maria Ionescu',
    role: 'Pedicure Specialist',
    bio: 'Expertă în îngrijirea picioarelor, tratamente spa și pedichiură medicală.',
    specialties: ['Medical pedicure', 'Spa pedicure', 'Gel pedicure', 'Paraffin treatment'],
    workingHours: {
      monday:    { start: '09:00', end: '17:00' },
      tuesday:   { start: '09:00', end: '17:00' },
      wednesday: { start: null,    end: null     },
      thursday:  { start: '09:00', end: '17:00' },
      friday:    { start: '09:00', end: '17:00' },
      saturday:  { start: '10:00', end: '15:00' },
      sunday:    { start: null,    end: null     },
    },
    isActive: true,
    order: 3,
  },
  {
    name: 'Andrei Popa',
    role: 'Barber & Men\'s Hair Specialist',
    bio: 'Frizerie masculină de înaltă calitate — tuns clasic, faduri și îngrijire barbă.',
    specialties: ['Classic cut', 'Fade', 'Beard trim', 'Hot towel shave'],
    workingHours: {
      monday:    { start: '10:00', end: '19:00' },
      tuesday:   { start: '10:00', end: '19:00' },
      wednesday: { start: '10:00', end: '19:00' },
      thursday:  { start: '10:00', end: '19:00' },
      friday:    { start: '10:00', end: '19:00' },
      saturday:  { start: '09:00', end: '16:00' },
      sunday:    { start: null,    end: null     },
    },
    isActive: true,
    order: 4,
  },
];

const SERVICES = [
  // ── Manicure ──────────────────────────────────────────────────────────────
  {
    name: 'Classic Manicure',
    description: 'Manichiură clasică cu lac normal — curățare cuticule, pilire și aplicare lac.',
    price: '150 MDL',
    duration: '45 min',
    category: 'manicure',
    isActive: true,
    order: 1,
  },
  {
    name: 'Gel Manicure',
    description: 'Manichiură cu gel UV — durată 3-4 săptămâni, finisaj lucios sau mat.',
    price: '250 MDL',
    duration: '75 min',
    category: 'manicure',
    isActive: true,
    order: 2,
  },
  {
    name: 'Nail Art Design',
    description: 'Design personalizat pe unghii — motive florale, geometrice sau freestyle.',
    price: '350 MDL',
    duration: '90 min',
    category: 'manicure',
    isActive: true,
    order: 3,
  },
  {
    name: 'Acrylic Extensions',
    description: 'Extensii acrilice cu lungime și formă la alegere.',
    price: '450 MDL',
    duration: '120 min',
    category: 'manicure',
    isActive: true,
    order: 4,
  },
  // ── Pedicure ──────────────────────────────────────────────────────────────
  {
    name: 'Classic Pedicure',
    description: 'Pedichiură clasică — curățare, pilire, lac normal.',
    price: '180 MDL',
    duration: '60 min',
    category: 'pedicure',
    isActive: true,
    order: 5,
  },
  {
    name: 'Spa Pedicure',
    description: 'Pedichiură spa cu baie relaxantă, scrub, masaj și gel UV.',
    price: '320 MDL',
    duration: '90 min',
    category: 'pedicure',
    isActive: true,
    order: 6,
  },
  {
    name: 'Medical Pedicure',
    description: 'Pedichiură medicală — tratament bătături, hiperkeratoze, unghii incarnate.',
    price: '280 MDL',
    duration: '75 min',
    category: 'pedicure',
    isActive: true,
    order: 7,
  },
  // ── Hair Women ────────────────────────────────────────────────────────────
  {
    name: 'Haircut & Styling (Women)',
    description: 'Tuns și coafat feminin — consultanță formă față inclusă.',
    price: '200 MDL',
    duration: '60 min',
    category: 'hair-women',
    isActive: true,
    order: 8,
  },
  {
    name: 'Balayage',
    description: 'Colorație balayage naturală — efect soare, gradație perfectă.',
    price: '800 MDL',
    duration: '180 min',
    category: 'hair-women',
    isActive: true,
    order: 9,
  },
  {
    name: 'Keratin Treatment',
    description: 'Tratament keratină — păr neted, anti-frizz, durată 3-5 luni.',
    price: '650 MDL',
    duration: '150 min',
    category: 'hair-women',
    isActive: true,
    order: 10,
  },
  {
    name: 'Full Color',
    description: 'Colorație integrală cu vopsea profesională Schwarzkopf sau L\'Oréal.',
    price: '400 MDL',
    duration: '120 min',
    category: 'hair-women',
    isActive: true,
    order: 11,
  },
  // ── Hair Men ──────────────────────────────────────────────────────────────
  {
    name: 'Men\'s Haircut',
    description: 'Tuns masculin clasic sau modern — consultanță și styling incluse.',
    price: '120 MDL',
    duration: '30 min',
    category: 'hair-men',
    isActive: true,
    order: 12,
  },
  {
    name: 'Fade + Beard Trim',
    description: 'Fader la mașină cu finisaj foarfecă + tuns și aranjat barbă.',
    price: '180 MDL',
    duration: '45 min',
    category: 'hair-men',
    isActive: true,
    order: 13,
  },
  {
    name: 'Hot Towel Shave',
    description: 'Bărbierit clasic cu prosop cald, spumă premium și lamă dreaptă.',
    price: '150 MDL',
    duration: '45 min',
    category: 'hair-men',
    isActive: true,
    order: 14,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyIdx = args.indexOf('--only');
  const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null; // 'team' | 'services' | null

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const doTeam     = !only || only === 'team';
  const doServices = !only || only === 'services';

  // ── Team Members ──────────────────────────────────────────────────────────
  if (doTeam) {
    if (force) {
      await TeamMember.deleteMany({});
      console.log('🗑  Deleted all team members');
    }

    const existing = await TeamMember.countDocuments();
    if (existing > 0 && !force) {
      console.log(`⚠️  Team members already exist (${existing}). Use --force to reset.`);
    } else {
      const inserted = await TeamMember.insertMany(TEAM);
      console.log(`✅ Inserted ${inserted.length} team members`);
    }
  }

  // ── Services ──────────────────────────────────────────────────────────────
  if (doServices) {
    if (force) {
      await Service.deleteMany({});
      console.log('🗑  Deleted all services');
    }

    const existing = await Service.countDocuments();
    if (existing > 0 && !force) {
      console.log(`⚠️  Services already exist (${existing}). Use --force to reset.`);
    } else {
      const inserted = await Service.insertMany(SERVICES);
      console.log(`✅ Inserted ${inserted.length} services`);
    }
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done!');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
