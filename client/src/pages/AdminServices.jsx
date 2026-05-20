import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../style/AdminServices.css';
import {
  ChevronLeft,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const ADMIN_API = `${API}/api/admin/services`;

const CATEGORIES = ['manicure', 'pedicure', 'hair-women', 'hair-men', 'other'];

const EMPTY_FORM = {
  name:        '',
  description: '',
  price:       '',
  duration:    '',
  category:    'manicure',
  image:       '',
  isActive:    true,
  order:       0,
};

const fetchOpts = (method = 'GET', body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

// ── Drag-and-drop image uploader sub-component 
function ImageUploader({ endpoint, initialUrl, onChange }) {
  const {
    url,
    uploading,
    progress,
    error: uploadError,
    dragActive,
    inputProps,
    dragProps,
    clearImage,
    resetToUrl,
  } = useImageUpload({ endpoint, initialUrl });

  const prevUrl = useRef(url);
  useEffect(() => {
    if (url !== prevUrl.current) {
      prevUrl.current = url;
      onChange(url);
    }
  }, [url, onChange]);

  useEffect(() => {
    resetToUrl(initialUrl);
    prevUrl.current = initialUrl;
  
  }, [initialUrl]);

  const handleClear = () => {
    clearImage();
    onChange('');
  };

  return (
    <div className="adm-uploader">
      <div
        {...dragProps}
        className={`adm-drop-zone ${dragActive ? 'adm-drop-zone--active' : ''} ${uploading ? 'adm-drop-zone--uploading' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onKeyDown={(e) => e.key === 'Enter' && inputProps.ref.current?.click()}
      >
        <input {...inputProps} />

        {url ? (
          <div className="adm-uploader-preview">
            <img src={url} alt="Service preview" className="adm-uploader-img" />
            <div className="adm-uploader-overlay">
              <span className="adm-uploader-change">
                <Upload size={16} />
                Change image
              </span>
            </div>
          </div>
        ) : (
          <div className="adm-uploader-placeholder">
            <ImageIcon size={32} className="adm-uploader-icon" />
            <p className="adm-uploader-hint">
              <strong>Drag & drop</strong> or <strong>click</strong> to upload
            </p>
            <p className="adm-uploader-sub">JPG, PNG, WEBP · max 10 MB</p>
          </div>
        )}

        {uploading && (
          <div className="adm-uploader-progress-wrap" aria-live="polite" aria-label={`Uploading ${progress}%`}>
            <div className="adm-uploader-progress-bar" style={{ width: `${progress}%` }} />
            <span className="adm-uploader-progress-label">
              <Loader2 size={14} className="adm-spinner" />
              {progress}%
            </span>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="adm-uploader-error" role="alert">{uploadError}</p>
      )}

      {url && !uploading && (
        <button
          type="button"
          className="adm-uploader-clear"
          onClick={handleClear}
          aria-label="Remove image"
        >
          <X size={14} />
          Remove image
        </button>
      )}
    </div>
  );
}

// ── Main component   ─────────────
export default function AdminServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(ADMIN_API, fetchOpts());

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load services');

      const json = await res.json();
      setServices(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  // ── Modal helpers   ─────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name:        service.name,
      description: service.description,
      price:       service.price,
      duration:    service.duration,
      category:    service.category,
      image:       service.image || '',
      isActive:    service.isActive,
      order:       service.order,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  // ── Save (create / update)   ────
  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.duration.trim()) {
      setFormError('Name, price and duration are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const url    = editingId ? `${ADMIN_API}/${editingId}` : ADMIN_API;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, fetchOpts(method, form));

      if (res.status === 401 || res.status === 403) {
        navigate('/login');
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.message || 'Failed to save service');
        return;
      }

      closeModal();
      fetchServices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active   ─────────────
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}/toggle`, fetchOpts('PATCH'));
      if (!res.ok) throw new Error('Toggle failed');
      const json = await res.json();
      setServices((prev) =>
        prev.map((s) => (s._id === id ? json.data : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ── Delete   ────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}`, fetchOpts('DELETE'));
      if (!res.ok) throw new Error('Delete failed');
      setDeletingId(null);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Render   ────────────────────
  return (
    <div className="adm-page">
      <header className="adm-header">
        <button
          className="adm-back-btn"
          onClick={() => navigate('/home')}
          aria-label="Back to home"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <h1 className="adm-title">Manage Services</h1>

        <div className="adm-header-actions">
          <Link to="/admin/team" className="adm-btn adm-btn--ghost">
            <Users size={16} />
            Manage Team
          </Link>
          <button className="adm-btn adm-btn--primary" onClick={openCreate}>
            <Plus size={16} />
            Add service
          </button>
        </div>
      </header>

      {loading && (
        <div className="adm-loading" aria-live="polite">
          <Loader2 size={24} className="adm-spinner" />
          <p>Loading services…</p>
        </div>
      )}

      {error && (
        <div className="adm-error" role="alert">
          {error}
          <button onClick={fetchServices}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-table-empty">
                    No services yet. Click "Add service" to create one.
                  </td>
                </tr>
              )}
              {services.map((s) => (
                <tr key={s._id} className={s.isActive ? '' : 'adm-row--inactive'}>
                  <td>{s.order}</td>
                  <td className="adm-cell-name">
                    {s.image
                      ? <img src={s.image} alt={s.name} className="adm-thumb" />
                      : <span className="adm-thumb-placeholder"><ImageIcon size={16} /></span>
                    }
                    {s.name}
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${s.category}`}>
                      {s.category}
                    </span>
                  </td>
                  <td>{s.price}</td>
                  <td>{s.duration}</td>
                  <td>
                    <button
                      className={`adm-toggle-btn ${s.isActive ? 'adm-toggle-btn--on' : 'adm-toggle-btn--off'}`}
                      onClick={() => handleToggle(s._id)}
                      title={s.isActive ? 'Hide service' : 'Show service'}
                    >
                      {s.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      {s.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="adm-cell-actions">
                    <button
                      className="adm-icon-btn adm-icon-btn--edit"
                      onClick={() => openEdit(s)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="adm-icon-btn adm-icon-btn--delete"
                      onClick={() => setDeletingId(s._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit / Create Modal   */}
      {modalOpen && (
        <div
          className="adm-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit service' : 'Add service'}
        >
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2>{editingId ? 'Edit service' : 'New service'}</h2>
              <button className="adm-modal-close" onClick={closeModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <p className="adm-form-error" role="alert">{formError}</p>
            )}

            <div className="adm-form">
              <label className="adm-label">Service image</label>
              <ImageUploader
                endpoint={`${ADMIN_API}/upload-image`}
                initialUrl={form.image}
                onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
              />

              <label className="adm-label">
                Service name *
                <input
                  className="adm-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gel Manicure"
                  maxLength={100}
                />
              </label>

              <label className="adm-label">
                Description
                <textarea
                  className="adm-input adm-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown on the homepage card"
                  rows={3}
                  maxLength={500}
                />
              </label>

              <div className="adm-form-row">
                <label className="adm-label">
                  Price *
                  <input
                    className="adm-input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="From $45"
                  />
                </label>
                <label className="adm-label">
                  Duration *
                  <input
                    className="adm-input"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="45 min"
                  />
                </label>
              </div>

              <div className="adm-form-row">
                <label className="adm-label">
                  Category
                  <select
                    className="adm-input adm-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-label">
                  Display order
                  <input
                    className="adm-input"
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label className="adm-label adm-label--checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Visible on homepage
              </label>
            </div>

            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="adm-btn adm-btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 size={16} className="adm-spinner" />}
                {editingId ? 'Save changes' : 'Create service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal    */}
      {deletingId && (
        <div
          className="adm-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div className="adm-modal adm-modal--sm">
            <h2 className="adm-modal-danger-title">Delete service?</h2>
            <p className="adm-modal-danger-text">
              This action cannot be undone. The image will also be removed from Cloudinary.
              If you want to hide it temporarily, use the Active toggle instead.
            </p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button
                className="adm-btn adm-btn--danger"
                onClick={() => handleDelete(deletingId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}