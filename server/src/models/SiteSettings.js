const mongoose = require('mongoose');

const sectionCopySchema = new mongoose.Schema(
  {
    badge: { type: String, trim: true, maxlength: 80, default: '' },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    lead: { type: String, trim: true, maxlength: 500, default: '' },
    linkText: { type: String, trim: true, maxlength: 80, default: '' },
  },
  { _id: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'main',
      unique: true,
      immutable: true,
    },
    customCategories: {
      type: [String],
      default: [],
    },
    categoryLabels: {
      type: Map,
      of: String,
      default: {},
    },
    homeTeam: {
      type: sectionCopySchema,
      default: () => ({
        badge: 'The studio',
        title: 'Meet the artists',
        lead: 'Precision hands, editorial eyes, and calm energy — the people who make Beauty Rocks feel like home.',
        linkText: 'Meet the full team',
      }),
    },
    homeServices: {
      type: sectionCopySchema,
      default: () => ({
        badge: 'What we offer',
        title: 'Our services',
        linkText: 'View all services',
      }),
    },
    featuredServices: {
      type: sectionCopySchema,
      default: () => ({
        badge: 'Featured services',
        title: 'Our Most Loved',
        linkText: 'View all services',
      }),
    },
  },
  { timestamps: true },
);

siteSettingsSchema.statics.getOrCreate = async function getOrCreate() {
  let doc = await this.findOne({ singletonKey: 'main' });
  if (!doc) {
    doc = await this.create({ singletonKey: 'main' });
  }
  return doc;
};

siteSettingsSchema.methods.toPublicJSON = function toPublicJSON() {
  const labelsObj = {};
  if (this.categoryLabels) {
    for (const [k, v] of this.categoryLabels.entries()) {
      if (v) labelsObj[k] = v;
    }
  }
  return {
    customCategories: this.customCategories || [],
    categoryLabels: labelsObj,
    homeTeam: this.homeTeam,
    homeServices: this.homeServices,
    featuredServices: this.featuredServices,
  };
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
