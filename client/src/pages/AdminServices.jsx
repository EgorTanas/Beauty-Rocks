import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style/AdminServices.css';
import '../style/AdminDashboard.css';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  Plus,
  Star,
  Home,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import AdminServiceCard from '../components/admin/AdminServiceCard';
import { AdminHeaderActions, AdminNav } from '../components/admin/AdminNav';
import { AdminHeader } from '../components/admin/AdminMotion';
import { adminStagger, adminTableRow } from '../components/admin/adminMotionVariants';
import { buildCategoryOptions, normalizeCategory, slugifyCategory } from '../utils/categories';
import { fetchSiteSettings } from '../utils/siteSettingsApi';
import { API_BASE } from '@/lib/api';

const ADMIN_API = `${API_BASE}/api/admin/services`;

const BUILTIN_IDS = new Set(['manicure', 'pedicure', 'hair-women', 'hair-men', 'beard']);

const EMPTY_FORM = {
  name:        '',
  description: '',
  price:       '',
  duration:    '',
  category:    'manicure',
  customCategoryName: '',
  customCategoryLabel: '',
  image:       '',
  isActive:    true,
  order:       0,
  showOnHomepage: false,
  featuredOnServicesPage: false,
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
            <img src={url} alt="" className="adm-uploader-img" />
            <div className="adm-uploader-overlay adm-uploader-overlay--mobile">
              <span className="adm-uploader-change">
                <Upload size={16} />
                Tap to change
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

// ── Appointment Tester ───────────────────────────────────────────────────────
function AppointmentTester({ services }) {
  const [open,       setOpen]       = useState(false);
  const [workers,    setWorkers]    = useState([]);
  const [slots,      setSlots]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [booking,    setBooking]    = useState(false);
  const [result,     setResult]     = useState(null); // { ok, message, data }

  const [tService,   setTService]   = useState('');
  const [tWorker,    setTWorker]    = useState('');
  const [tDate,      setTDate]      = useState('');
  const [tSlot,      setTSlot]      = useState('');

  // Load workers once panel opens
  useEffect(() => {
    if (!open || workers.length) return;
    fetch(`${API_BASE}/api/team`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setWorkers(j.data || []))
      .catch(console.error);
  }, [open]);

  // Fetch slots when worker + date + service are all set
  useEffect(() => {
    setSlots([]);
    setTSlot('');
    setResult(null);
    if (!tWorker || !tDate || !tService) return;

    setLoading(true);
    fetch(
      `${API_BASE}/api/appointments/available-slots?worker=${tWorker}&date=${tDate}&service=${tService}`,
      { credentials: 'include' }
    )
      .then((r) => r.json())
      .then((j) => setSlots(j.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tWorker, tDate, tService]);

  const handleBook = async () => {
    if (!tService || !tWorker || !tDate || !tSlot) {
      setResult({ ok: false, message: 'Complete all fields first.' });
      return;
    }
    setBooking(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/appointments`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service:    tService,
          teamMember: tWorker,
          date:       tDate,
          startTime:  tSlot,
          notes:      'Test booking from admin panel',
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult({
          ok:      true,
          message: `✅ Appointment created!`,
          data:    json.data,
        });
        setSlots((prev) => prev.filter((s) => s !== tSlot));
        setTSlot('');
      } else {
        setResult({ ok: false, message: `❌ ${json.message}` });
      }
    } catch (err) {
      setResult({ ok: false, message: `❌ ${err.message}` });
    } finally {
      setBooking(false);
    }
  };

  const reset = () => {
    setTService(''); setTWorker(''); setTDate(''); setTSlot('');
    setSlots([]); setResult(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="apt-tester">
      <button
        className="apt-tester-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <FlaskConical size={16} />
        Appointment Tester
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="apt-tester-body">
          <p className="apt-tester-desc">
            Test the full booking flow — select a service, worker and date to see available slots, then book one.
          </p>

          <div className="apt-tester-grid">
            {/* Service */}
            <label className="apt-tester-label">
              1. Service
              <select
                className="adm-input adm-select"
                value={tService}
                onChange={(e) => { setTService(e.target.value); setTSlot(''); }}
              >
                <option value="">— pick a service —</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.duration})
                  </option>
                ))}
              </select>
            </label>

            {/* Worker */}
            <label className="apt-tester-label">
              2. Team member
              <select
                className="adm-input adm-select"
                value={tWorker}
                onChange={(e) => { setTWorker(e.target.value); setTSlot(''); }}
              >
                <option value="">— pick a worker —</option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} — {w.role}</option>
                ))}
              </select>
            </label>

            {/* Date */}
            <label className="apt-tester-label">
              3. Date
              <input
                type="date"
                className="adm-input"
                min={todayStr}
                value={tDate}
                onChange={(e) => { setTDate(e.target.value); setTSlot(''); }}
              />
            </label>

            {/* Slots */}
            <div className="apt-tester-label">
              4. Available slots
              {loading && (
                <span className="apt-tester-loading">
                  <Loader2 size={14} className="adm-spinner" /> Fetching…
                </span>
              )}
              {!loading && tWorker && tDate && tService && slots.length === 0 && (
                <p className="apt-tester-empty">No slots available for this day.</p>
              )}
              {slots.length > 0 && (
                <div className="apt-slots">
                  {slots.map((s) => (
                    <button
                      key={s}
                      className={`apt-slot ${tSlot === s ? 'apt-slot--active' : ''}`}
                      onClick={() => setTSlot(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="apt-tester-actions">
            <button className="adm-btn adm-btn--ghost" onClick={reset}>
              <X size={14} /> Reset
            </button>
            <button
              className="adm-btn adm-btn--primary"
              onClick={handleBook}
              disabled={booking || !tSlot}
            >
              {booking && <Loader2 size={14} className="adm-spinner" />}
              Book {tSlot || '…'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`apt-tester-result ${result.ok ? 'apt-tester-result--ok' : 'apt-tester-result--err'}`}>
              <strong>{result.message}</strong>
              {result.data && (
                <pre className="apt-tester-json">
                  {JSON.stringify({
                    id:        result.data._id,
                    service:   result.data.service?.name,
                    worker:    result.data.teamMember?.name,
                    date:      result.data.date,
                    startTime: result.data.startTime,
                    endTime:   result.data.endTime,
                    status:    result.data.status,
                  }, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component   ─────────────
export default function AdminServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const TableRow = reduceMotion ? 'tr' : motion.tr;

  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState(buildCategoryOptions());

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setCategoryOptions(buildCategoryOptions(data.categories || [])))
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate();
      navigate('/admin/services', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openCreate]);

  const openEdit = (service) => {
    setEditingId(service._id);
    const cat = normalizeCategory(service.category);
    const isCustom = !cat || cat === 'other' || !BUILTIN_IDS.has(cat);
    setForm({
      name:        service.name,
      description: service.description,
      price:       service.price,
      duration:    service.duration,
      category:    isCustom ? '__custom__' : cat,
      customCategoryName: isCustom ? cat : '',
      customCategoryLabel: '',
      image:       service.image || '',
      isActive:    service.isActive,
      order:       service.order,
      showOnHomepage: !!service.showOnHomepage,
      featuredOnServicesPage: !!service.featuredOnServicesPage,
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
    if (!form.name.trim() || !form.description.trim() || !form.price.trim() || !form.duration.trim()) {
      setFormError('Name, description, price and duration are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const url    = editingId ? `${ADMIN_API}/${editingId}` : ADMIN_API;
      const method = editingId ? 'PUT' : 'POST';

      let category = form.category;
      let customCategoryLabel = '';
      if (form.category === '__custom__') {
        const slug = slugifyCategory(form.customCategoryName);
        if (!slug) {
          setFormError('Enter a name for the new category (e.g. beard, bridal).');
          return;
        }
        category = slug;
        customCategoryLabel = form.customCategoryLabel?.trim() || form.customCategoryName.trim();
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        duration: form.duration,
        category,
        customCategoryLabel,
        image: form.image,
        isActive: form.isActive,
        order: form.order,
        showOnHomepage: form.showOnHomepage,
        featuredOnServicesPage: form.featuredOnServicesPage,
      };

      const res = await fetch(url, fetchOpts(method, payload));

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

  const handlePlacementToggle = async (id, field) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}/placement`, fetchOpts('PATCH', { field }));
      if (!res.ok) throw new Error('Update failed');
      const json = await res.json();
      setServices((prev) => prev.map((s) => (s._id === id ? json.data : s)));
    } catch (err) {
      console.error(err);
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
    <div className="adm-page adm-dash">
      <AdminHeader className="adm-dash-header adm-dash-header--sub">
        <button
          type="button"
          className="adm-dash-back"
          onClick={() => navigate('/admin')}
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={18} />
          Overview
        </button>

        <div className="adm-dash-header__copy">
          <p className="adm-dash-header__eyebrow">Salon dashboard</p>
          <h1 className="adm-dash-header__title">Manage Services</h1>
          <p className="adm-dash-header__subtitle">
            Curate the studio menu — pricing, duration, and categories clients see when booking.
          </p>
        </div>

        <AdminHeaderActions>
          <AdminNav />
          <button type="button" className="adm-btn adm-btn--primary adm-dash-header__cta" onClick={openCreate}>
            <Plus size={16} aria-hidden />
            Add service
          </button>
        </AdminHeaderActions>
      </AdminHeader>

      {/* ── Appointment Tester ── */}
      <AppointmentTester services={services} />

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
        <>
        <div className="adm-table-wrap adm-dash-table">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Home</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan={9} className="adm-table-empty">
                    No services yet. Click "Add service" to create one.
                  </td>
                </tr>
              )}
              {services.map((s, i) => (
                <TableRow
                  key={s._id}
                  className={s.isActive ? '' : 'adm-row--inactive'}
                  {...(reduceMotion ? {} : { variants: adminTableRow, custom: i, initial: 'hidden', animate: 'visible' })}
                >
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
                      type="button"
                      className={`adm-pin-btn ${s.showOnHomepage ? 'adm-pin-btn--on' : ''}`}
                      onClick={() => handlePlacementToggle(s._id, 'showOnHomepage')}
                      title={s.showOnHomepage ? 'On homepage' : 'Add to homepage'}
                    >
                      <Home size={16} />
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`adm-pin-btn ${s.featuredOnServicesPage ? 'adm-pin-btn--on' : ''}`}
                      onClick={() => handlePlacementToggle(s._id, 'featuredOnServicesPage')}
                      title={s.featuredOnServicesPage ? 'In Our Most Loved' : 'Add to Our Most Loved'}
                    >
                      <Star size={16} />
                    </button>
                  </td>
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
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div
          className="adm-dash-cards"
          variants={reduceMotion ? undefined : adminStagger}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          {services.map((s) => (
            <AdminServiceCard
              key={s._id}
              service={s}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={setDeletingId}
              onToggleHome={(id) => handlePlacementToggle(id, 'showOnHomepage')}
              onToggleFeatured={(id) => handlePlacementToggle(id, 'featuredOnServicesPage')}
            />
          ))}
        </motion.div>
        </>
      )}

      {/* ── Edit / Create Modal   */}
      {modalOpen && (
        <div
          className="adm-overlay adm-dash-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit service' : 'Add service'}
          onClick={closeModal}
        >
          <div
            className="adm-modal adm-form-modal adm-dash-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <h2>{editingId ? 'Edit service' : 'New service'}</h2>
              <button type="button" className="adm-modal-close" onClick={closeModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="adm-form-modal__scroll">
              {formError ? (
                <p className="adm-form-error" role="alert">{formError}</p>
              ) : null}

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
                Description *
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
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 35"
                  />
                </label>
                <label className="adm-label">
                  Duration *
                  <input
                    className="adm-input"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 45 min"
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
                    {categoryOptions
                      .filter((c) => c.id !== 'other')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    <option value="__custom__">Other…</option>
                  </select>
                </label>
                {form.category === '__custom__' && (
                  <>
                    <label className="adm-label">
                      New category slug
                      <input
                        className="adm-input"
                        value={form.customCategoryName}
                        onChange={(e) => setForm({ ...form, customCategoryName: e.target.value })}
                        placeholder="e.g. beard, bridal, lashes"
                      />
                    </label>
                    <label className="adm-label">
                      Display label <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                      <input
                        className="adm-input"
                        value={form.customCategoryLabel}
                        onChange={(e) => setForm({ ...form, customCategoryLabel: e.target.value })}
                        placeholder="e.g. Beard & grooming"
                      />
                    </label>
                  </>
                )}
                <label className="adm-label">
                  Display order
                  <input
                    className="adm-input"
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                  <span className="adm-label-hint">
                    Lower number = appears first in admin and on the public Services page (0, 1, 2…).
                  </span>
                </label>
              </div>

              <label className="adm-label adm-label--checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active on site
              </label>
              <label className="adm-label adm-label--checkbox">
                <input
                  type="checkbox"
                  checked={form.showOnHomepage}
                  onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                />
                Show on homepage (Our services)
              </label>
              <label className="adm-label adm-label--checkbox">
                <input
                  type="checkbox"
                  checked={form.featuredOnServicesPage}
                  onChange={(e) => setForm({ ...form, featuredOnServicesPage: e.target.checked })}
                />
                Show in “Our Most Loved”
              </label>
              </div>
            </div>

            <div className="adm-modal-footer adm-form-modal__footer">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
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