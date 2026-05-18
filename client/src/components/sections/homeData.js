import {
  Award,
  Heart,
  Palette,
  Scissors,
  Sparkles,
} from 'lucide-react';

export const SERVICES = [
  {
    title: 'Gel manicure',
    desc: 'Chip-resistant shine and refined finish — weeks of wear.',
    price: 'From $45',
    Icon: Sparkles,
  },
  {
    title: 'Acrylic nails',
    desc: 'Extensions shaped to you — coffin, almond, or stiletto.',
    price: 'From $65',
    Icon: Palette,
  },
  {
    title: 'Hair styling',
    desc: 'Cuts, blowouts, and polished looks for any occasion.',
    price: 'From $55',
    Icon: Scissors,
  },
  {
    title: 'Balayage & color',
    desc: 'Dimension and tone tailored to your skin and style.',
    price: 'From $120',
    Icon: Sparkles,
  },
  {
    title: 'Pedicure spa',
    desc: 'Soak, exfoliation, massage, and flawless polish.',
    price: 'From $50',
    Icon: Heart,
  },
  {
    title: 'Bridal package',
    desc: 'Hair, nails, and touch-ups for you and your party.',
    price: 'From $250',
    Icon: Award,
  },
];

export const GALLERY = [
  { label: 'Salon experience', tag: 'Salon', image: '/imgHome/salonimage.jpeg', position: '50% 45%' },
  { label: 'Nail artistry', tag: 'Nails', image: '/imgHome/nails3.jpeg', position: '50% 50%' },
  { label: 'Studio space', tag: 'Salon', image: '/imgHome/salon2.jpg', position: '50% 40%' },
  { label: 'Hair styling', tag: 'Hair', image: '/imgHome/hair.png', position: '50% 38%' },
  { label: 'Salon details', tag: 'Salon', image: '/imgHome/salon3.png', position: '50% 45%' },
  { label: 'Color & finish', tag: 'Hair', image: '/imgHome/hair2.png', position: '50% 42%' },
];

export const TEAM_PREVIEW = [
  { name: 'Maya Chen', role: 'Lead colorist', initials: 'MC' },
  { name: 'Jordan Lee', role: 'Nail director', initials: 'JL' },
  { name: 'Sofia Reyes', role: 'Bridal specialist', initials: 'SR' },
];
