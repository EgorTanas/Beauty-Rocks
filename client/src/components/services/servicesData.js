
export const CATEGORY_FILTERS = [
  { id: 'all',      label: 'All Services' },
  { id: 'nails',    label: 'Nails' },
  { id: 'hair',     label: 'Hair' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'bridal',   label: 'Bridal' },
  { id: 'other',    label: 'Other' },
];

// Folosit în ServicesGrid pentru titluri și lead text per categorie
export const CATEGORY_META = {
  nails:    { label: 'Nails',    lead: 'Manicure, pedicure, gel, extensions și nail art.' },
  hair:     { label: 'Hair',     lead: 'Tunsori, culoare, styling, keratin și bridal.' },
  skincare: { label: 'Skincare', lead: 'Tratamente faciale și îngrijire profesională a pielii.' },
  bridal:   { label: 'Bridal',   lead: 'Pachete complete pentru mirese și ocazii speciale.' },
  other:    { label: 'Other',    lead: 'Servicii și pachete curate.' },
};