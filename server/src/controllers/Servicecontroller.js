const Service = require('../models/Service');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/uploadMiddleware');
const { normalizeCategory } = require('../constants/categories');
const { registerCustomCategory } = require('./siteSettingsController');

const getServices = async (req, res) => {
  try {
    const { category, homepage, featured } = req.query;
    const filter = { isActive: true };

    if (homepage === 'true') {
      filter.showOnHomepage = true;
      const services = await Service.find(filter).sort({ homeOrder: 1, order: 1, createdAt: 1 });
      return res.json({ success: true, count: services.length, data: services });
    }

    if (featured === 'true') {
      filter.featuredOnServicesPage = true;
      const services = await Service.find(filter).sort({ featuredOrder: 1, order: 1, createdAt: 1 });
      return res.json({ success: true, count: services.length, data: services });
    }

    if (category && category !== 'all') filter.category = normalizeCategory(category);
    const services = await Service.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error('SERVICES ERROR FULL:', err); // adaugă asta
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message,
      stack: err.stack  // adaugă asta temporar
    });
  }
};

const uploadServiceImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    return res.status(200).json({
      success:  true,
      url:      req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

const persistServiceCategory = async (category, customCategoryLabel) => {
  const normalized = normalizeCategory(category);
  if (customCategoryLabel || (normalized && normalized !== 'other')) {
    await registerCustomCategory(normalized, customCategoryLabel);
  }
  return normalized;
};

const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      category,
      customCategoryLabel,
      image,
      isActive,
      order,
      showOnHomepage,
      homeOrder,
      featuredOnServicesPage,
      featuredOrder,
    } = req.body;
    const normalizedCategory = await persistServiceCategory(category, customCategoryLabel);
    const service = await Service.create({
      name,
      description,
      price,
      duration,
      category: normalizedCategory,
      image: image || '',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      showOnHomepage: !!showOnHomepage,
      homeOrder: homeOrder || 0,
      featuredOnServicesPage: !!featuredOnServicesPage,
      featuredOrder: featuredOrder || 0,
    });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const existing = await Service.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    if (req.body.image && req.body.image !== existing.image) {
      const oldPublicId = extractPublicId(existing.image);
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
          console.warn('Could not delete old Cloudinary image:', err.message)
        );
      }
    }

    const updates = { ...req.body };
    if (updates.category !== undefined) {
      updates.category = await persistServiceCategory(
        updates.category,
        updates.customCategoryLabel,
      );
    }
    delete updates.customCategoryLabel;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    res.json({ success: true, data: service });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    const publicId = extractPublicId(service.image);
    if (publicId) {
      deleteFromCloudinary(publicId).catch((err) =>
        console.warn('Could not delete Cloudinary image on service delete:', err.message)
      );
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const toggleServiceActive = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).select('isActive');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: !service.isActive },
      { new: true, runValidators: false }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const toggleServicePlacement = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const { field } = req.body;
    if (field === 'showOnHomepage') {
      service.showOnHomepage = !service.showOnHomepage;
    } else if (field === 'featuredOnServicesPage') {
      service.featuredOnServicesPage = !service.featuredOnServicesPage;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }

    await service.save();
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  getAllServicesAdmin,
  uploadServiceImage,
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
  toggleServicePlacement,
};