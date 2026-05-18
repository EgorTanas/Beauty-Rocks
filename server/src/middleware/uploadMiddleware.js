const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER_MAP = {
  services: 'salon/services',
  staff:    'salon/staff',
  gallery:  'salon/gallery',
  blog:     'salon/blog',
  default:  'salon/misc',
};

const buildStorage = (context = 'default', opts = {}) => {
  const folder = FOLDER_MAP[context] || FOLDER_MAP.default;
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      format: async () => 'webp',
      allowed_formats: opts.allowedFormats || ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: opts.transformation || [
        { width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
      ],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const name = file.originalname
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 60);
        return `${name}_${timestamp}`;
      },
    },
  });
};

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed.'), false);
  }
  cb(null, true);
};

const uploadSingle = (fieldName = 'image', context = 'default', opts = {}) => {
  const storage = buildStorage(context, opts);
  const upload  = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  return upload.single(fieldName);
};

const uploadMultiple = (fieldName = 'images', maxCount = 10, context = 'default', opts = {}) => {
  const storage = buildStorage(context, opts);
  const upload  = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
  return upload.array(fieldName, maxCount);
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const withVersion = parts[1];
    const withoutVersion = withVersion.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  deleteFromCloudinary,
  extractPublicId,
};