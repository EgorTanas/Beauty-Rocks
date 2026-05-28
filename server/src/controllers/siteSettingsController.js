const SiteSettings = require('../models/SiteSettings');
const { mergeCategoryList, normalizeCategory, slugifyCategory } = require('../constants/categories');

const getPublicSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getOrCreate();
    const labelsObj = settings.categoryLabels ? Object.fromEntries(settings.categoryLabels) : {};
    res.json({
      success: true,
      data: {
        ...settings.toPublicJSON(),
        categories: mergeCategoryList(settings.customCategories, labelsObj),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getOrCreate();
    const {
      homeTeam,
      homeServices,
      featuredServices,
      customCategories,
      categoryLabels,
    } = req.body;

    if (homeTeam) settings.homeTeam = { ...settings.homeTeam.toObject?.() ?? settings.homeTeam, ...homeTeam };
    if (homeServices) {
      settings.homeServices = { ...settings.homeServices.toObject?.() ?? settings.homeServices, ...homeServices };
    }
    if (featuredServices) {
      settings.featuredServices = {
        ...settings.featuredServices.toObject?.() ?? settings.featuredServices,
        ...featuredServices,
      };
    }
    if (Array.isArray(customCategories)) {
      settings.customCategories = [...new Set(customCategories.map(normalizeCategory))];
    }
    if (categoryLabels && typeof categoryLabels === 'object') {
      for (const [key, label] of Object.entries(categoryLabels)) {
        const slug = normalizeCategory(key);
        if (label) settings.categoryLabels.set(slug, String(label).trim());
      }
    }

    await settings.save();
    const labelsObj = Object.fromEntries(settings.categoryLabels);
    res.json({
      success: true,
      data: {
        ...settings.toPublicJSON(),
        categories: mergeCategoryList(settings.customCategories, labelsObj),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/** Register a new custom category slug when saving a service */
async function registerCustomCategory(slug, label) {
  const normalized = normalizeCategory(slug);
  if (!normalized || normalized === 'other') return;
  const settings = await SiteSettings.getOrCreate();
  const builtins = ['manicure', 'pedicure', 'hair-women', 'hair-men', 'beard', 'other'];
  if (builtins.includes(normalized)) return;
  if (!settings.customCategories.includes(normalized)) {
    settings.customCategories.push(normalized);
  }
  if (label) {
    settings.categoryLabels.set(normalized, String(label).trim());
  }
  await settings.save();
}

module.exports = {
  getPublicSiteSettings,
  updateSiteSettings,
  registerCustomCategory,
  slugifyCategory,
};
