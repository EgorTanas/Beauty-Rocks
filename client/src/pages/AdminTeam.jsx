import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../style/AdminServices.css';
import '../style/AdminDashboard.css';
import { useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Edit2,
  Eye,
  EyeOff,
  Home,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  Clock,
  User,
} from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import AdminTeamCard from '../components/admin/AdminTeamCard';
import { AdminHeaderActions, AdminNav } from '../components/admin/AdminNav';
import { AdminHeader } from '../components/admin/AdminMotion';
import { adminStagger, adminTableRow } from '../components/admin/adminMotionVariants';
import { buildCategoryOptions, getCategoryLabel, slugifyCategory } from '../utils/categories';
import { fetchSiteSettings } from '../utils/siteSettingsApi';

const API        = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');
const ADMIN_API  = `${API}/api/admin/team`;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EMPTY_WORKING_HOURS = DAYS.reduce((acc, d) => {
  acc[d] = { start: '', end: '' };
  return acc;
}, {});

const EMPTY_FORM = {
  name:         '',
  role:         '',
  bio:          '',
  avatar:       '',
  email:        '',
  phone:        '',
  specialties:  '',   // comma-separated string → array on save
  serviceCategories: [],
  workingHours: EMPTY_WORKING_HOURS,
  daysOff:      [],   // array of ISO date strings
  isActive:     true,
  order:        0,
  showOnHomepage: false,
  customCategoryName: '',
};

const fetchOpts = (method = 'GET', body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

// ─── Avatar uploader (same pattern as AdminServices ImageUploader) ───────────
function AvatarUploader({ endpoint, initialUrl, onChange }) {
  const {
    url, uploading, progress,
    error: uploadError,
    dragActive, inputProps, dragProps,
    clearImage, resetToUrl,
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

  return (
    <div className="adm-uploader">
      <div
        {...dragProps}
        className={`adm-drop-zone ${dragActive ? 'adm-drop-zone--active' : ''} ${uploading ? 'adm-drop-zone--uploading' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload avatar"
        onKeyDown={(e) => e.key === 'Enter' && inputProps.ref.current?.click()}
      >
        <input {...inputProps} />

        {url ? (
          <div className="adm-uploader-preview">
            <img src={url} alt="Avatar preview" className="adm-uploader-img" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <div className="adm-uploader-overlay">
              <span className="adm-uploader-change">
                <Upload size={16} /> Change avatar
              </span>
            </div>
          </div>
        ) : (
          <div className="adm-uploader-placeholder">
            <User size={32} className="adm-uploader-icon" />
            <p className="adm-uploader-hint"><strong>Drag & drop</strong> or <strong>click</strong></p>
            <p className="adm-uploader-sub">JPG, PNG, WEBP · max 10 MB</p>
          </div>
        )}

        {uploading && (
          <div className="adm-uploader-progress-wrap" aria-live="polite">
            <div className="adm-uploader-progress-bar" style={{ width: `${progress}%` }} />
            <span className="adm-uploader-progress-label">
              <Loader2 size={14} className="adm-spinner" /> {progress}%
            </span>
          </div>
        )}
      </div>

      {uploadError && <p className="adm-uploader-error" role="alert">{uploadError}</p>}

      {url && !uploading && (
        <button type="button" className="adm-uploader-clear" onClick={() => { clearImage(); onChange(''); }} aria-label="Remove avatar">
          <X size={14} /> Remove avatar
        </button>
      )}
    </div>
  );
}

// ─── Working hours row for one day ──────────────────────────────────────────
function DayRow({ day, value, onChange }) {
  const enabled = !!(value.start || value.end);

  const toggle = () => {
    if (enabled) {
      onChange(day, { start: '', end: '' });
    } else {
      onChange(day, { start: '09:00', end: '18:00' });
    }
  };

  return (
    <div className="adm-day-row">
      <label className="adm-day-toggle">
        <input type="checkbox" checked={enabled} onChange={toggle} />
        <span className="adm-day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
      </label>
      {enabled ? (
        <div className="adm-day-times">
          <input
            type="time"
            className="adm-input adm-input--time"
            value={value.start || ''}
            onChange={(e) => onChange(day, { ...value, start: e.target.value })}
          />
          <span className="adm-day-sep">–</span>
          <input
            type="time"
            className="adm-input adm-input--time"
            value={value.end || ''}
            onChange={(e) => onChange(day, { ...value, end: e.target.value })}
          />
        </div>
      ) : (
        <span className="adm-day-off-label">Day off</span>
      )}
    </div>
  );
}

// ─── Days-off picker ─────────────────────────────────────────────────────────
function DaysOffPicker({ daysOff, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const date = new Date(trimmed);
    if (isNaN(date)) return;
    const iso = date.toISOString().split('T')[0];
    if (!daysOff.includes(iso)) onChange([...daysOff, iso].sort());
    setInput('');
  };

  const remove = (d) => onChange(daysOff.filter((x) => x !== d));

  return (
    <div className="adm-daysoff">
      <div className="adm-daysoff-input-row">
        <input
          type="date"
          className="adm-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={add}>
          <Plus size={14} /> Add
        </button>
      </div>
      {daysOff.length > 0 && (
        <div className="adm-daysoff-tags">
          {daysOff.map((d) => (
            <span key={d} className="adm-daysoff-tag">
              {d}
              <button type="button" onClick={() => remove(d)} aria-label={`Remove ${d}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminTeam() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const TableRow = reduceMotion ? 'tr' : motion.tr;

  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState(null);
  const [activeTab,  setActiveTab]  = useState('info'); // 'info' | 'schedule'

  const [deletingId, setDeletingId] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState(buildCategoryOptions());
  const [categoryPicker, setCategoryPicker] = useState('');

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setCategoryOptions(buildCategoryOptions(data.categories || [])))
      .catch(() => {});
  }, []);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(ADMIN_API, fetchOpts());
      if (res.status === 401 || res.status === 403) { navigate('/login'); return; }
      if (!res.ok) throw new Error('Failed to load team');
      const json = await res.json();
      setMembers(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  // ── Modal helpers ─────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCategoryPicker('');
    setFormError(null);
    setActiveTab('info');
    setModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate();
      navigate('/admin/team', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openCreate]);

  const openEdit = (m) => {
    setEditingId(m._id);
    // merge stored workingHours with empty defaults so all days exist
    const wh = DAYS.reduce((acc, d) => {
      acc[d] = m.workingHours?.[d] || { start: '', end: '' };
      return acc;
    }, {});
    setForm({
      name:         m.name,
      role:         m.role,
      bio:          m.bio          || '',
      avatar:       m.avatar       || '',
      email:        m.email        || '',
      phone:        m.phone        || '',
      specialties:  (m.specialties || []).join(', '),
      serviceCategories: Array.isArray(m.serviceCategories) ? [...m.serviceCategories] : [],
      workingHours: wh,
      daysOff:      (m.daysOff || []).map((d) => new Date(d).toISOString().split('T')[0]),
      isActive:     m.isActive,
      order:        m.order,
      showOnHomepage: !!m.showOnHomepage,
      customCategoryName: '',
    });
    setCategoryPicker('');
    setFormError(null);
    setActiveTab('info');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); setFormError(null); };

  // ── Working hours helper ──────────────────────────────────
  const setDayHours = (day, value) => {
    setForm((prev) => ({ ...prev, workingHours: { ...prev.workingHours, [day]: value } }));
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setFormError('Name and role are required.');
      setActiveTab('info');
      return;
    }

    if (!form.serviceCategories?.length) {
      setFormError('Add at least one service category (e.g. Manicure or Pedicure).');
      setActiveTab('info');
      return;
    }

    const payload = {
      name: form.name,
      role: form.role,
      bio: form.bio,
      avatar: form.avatar,
      email: form.email,
      phone: form.phone,
      specialties: form.specialties
        ? form.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      serviceCategories: form.serviceCategories,
      workingHours: form.workingHours,
      daysOff: form.daysOff,
      isActive: form.isActive,
      order: form.order,
      showOnHomepage: form.showOnHomepage,
    };

    try {
      setSaving(true);
      setFormError(null);
      const url    = editingId ? `${ADMIN_API}/${editingId}` : ADMIN_API;
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, fetchOpts(method, payload));
      if (res.status === 401 || res.status === 403) { navigate('/login'); return; }
      const json = await res.json();
      if (!res.ok) { setFormError(json.message || 'Failed to save'); return; }
      closeModal();
      fetchMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────
  const handleToggleHomepage = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}/homepage`, fetchOpts('PATCH'));
      if (!res.ok) throw new Error('Toggle failed');
      const json = await res.json();
      setMembers((prev) => prev.map((m) => (m._id === id ? json.data : m)));
    } catch (err) {
      console.error(err);
    }
  };

  const addServiceCategory = () => {
    if (categoryPicker === '__custom__') {
      const slug = slugifyCategory(form.customCategoryName);
      if (!slug) {
        setFormError('Type a name for the custom category (e.g. lashes, bridal).');
        return;
      }
      setForm((prev) => {
        const list = prev.serviceCategories || [];
        if (list.includes(slug)) return prev;
        return {
          ...prev,
          serviceCategories: [...list, slug],
          customCategoryName: '',
        };
      });
      setCategoryPicker('');
      setFormError(null);
      return;
    }

    if (!categoryPicker) return;
    setForm((prev) => {
      const list = prev.serviceCategories || [];
      if (list.includes(categoryPicker)) return prev;
      return { ...prev, serviceCategories: [...list, categoryPicker] };
    });
    setCategoryPicker('');
    setFormError(null);
  };

  const removeServiceCategory = (categoryId) => {
    setForm((prev) => ({
      ...prev,
      serviceCategories: (prev.serviceCategories || []).filter((c) => c !== categoryId),
    }));
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}/toggle`, fetchOpts('PATCH'));
      if (!res.ok) throw new Error('Toggle failed');
      const json = await res.json();
      setMembers((prev) => prev.map((m) => (m._id === id ? json.data : m)));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/${id}`, fetchOpts('DELETE'));
      if (!res.ok) throw new Error('Delete failed');
      setDeletingId(null);
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="adm-page adm-dash">
      <AdminHeader className="adm-dash-header adm-dash-header--sub">
        <button type="button" className="adm-dash-back" onClick={() => navigate('/admin')}>
          <ChevronLeft size={16} /> Overview
        </button>
        <div className="adm-dash-header__copy">
          <p className="adm-dash-header__eyebrow">Salon dashboard</p>
          <h1 className="adm-dash-header__title">Manage Team</h1>
          <p className="adm-dash-header__subtitle">
            Artists, schedules, and specialties shown on the team page and booking flow.
          </p>
        </div>
        <AdminHeaderActions>
          <AdminNav />
          <button type="button" className="adm-btn adm-btn--primary adm-dash-header__cta" onClick={openCreate}>
            <Plus size={16} aria-hidden />
            Add member
          </button>
        </AdminHeaderActions>
      </AdminHeader>

      {loading && (
        <div className="adm-loading" aria-live="polite">
          <Loader2 size={24} className="adm-spinner" />
          <p>Loading team…</p>
        </div>
      )}

      {error && (
        <div className="adm-error" role="alert">
          {error} <button onClick={fetchMembers}>Retry</button>
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
                <th>Role</th>
                <th>Categories</th>
                <th>Home</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-table-empty">
                    No team members yet. Click "Add member" to create one.
                  </td>
                </tr>
              )}
              {members.map((m, i) => (
                <TableRow
                  key={m._id}
                  className={m.isActive ? '' : 'adm-row--inactive'}
                  {...(reduceMotion ? {} : { variants: adminTableRow, custom: i, initial: 'hidden', animate: 'visible' })}
                >
                  <td>{m.order}</td>
                  <td className="adm-cell-name">
                    {m.avatar
                      ? <img src={m.avatar} alt={m.name} className="adm-thumb" style={{ borderRadius: '50%' }} />
                      : <span className="adm-thumb-placeholder"><User size={16} /></span>
                    }
                    {m.name}
                  </td>
                  <td>{m.role}</td>
                  <td>
                    {(m.serviceCategories || []).slice(0, 3).map((cat) => (
                      <span key={cat} className="adm-badge adm-badge--other" style={{ marginRight: 4 }}>
                        {getCategoryLabel(cat)}
                      </span>
                    ))}
                    {(m.serviceCategories || []).length === 0 && (
                      <span className="adm-badge" style={{ opacity: 0.5 }}>Not set</span>
                    )}
                    {(m.serviceCategories || []).length > 3 && (
                      <span className="adm-badge adm-badge--other">+{m.serviceCategories.length - 3}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`adm-pin-btn ${m.showOnHomepage ? 'adm-pin-btn--on' : ''}`}
                      onClick={() => handleToggleHomepage(m._id)}
                      title={m.showOnHomepage ? 'On homepage' : 'Add to homepage'}
                    >
                      <Home size={16} />
                    </button>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle-btn ${m.isActive ? 'adm-toggle-btn--on' : 'adm-toggle-btn--off'}`}
                      onClick={() => handleToggle(m._id)}
                      title={m.isActive ? 'Hide member' : 'Show member'}
                    >
                      {m.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      {m.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="adm-cell-actions">
                    <button className="adm-icon-btn adm-icon-btn--edit" onClick={() => openEdit(m)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="adm-icon-btn adm-icon-btn--delete" onClick={() => setDeletingId(m._id)} title="Delete">
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
          {members.map((m) => (
            <AdminTeamCard
              key={m._id}
              member={m}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={setDeletingId}
              onToggleHomepage={handleToggleHomepage}
            />
          ))}
        </motion.div>
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div
          className="adm-overlay adm-dash-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit member' : 'Add member'}
          onClick={closeModal}
        >
          <div
            className="adm-modal adm-modal--wide adm-form-modal adm-dash-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <h2>{editingId ? 'Edit member' : 'New member'}</h2>
              <button type="button" className="adm-modal-close" onClick={closeModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="adm-form-modal__scroll">
            {/* Tabs */}
            <div className="adm-tabs">
              <button
                className={`adm-tab ${activeTab === 'info' ? 'adm-tab--active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <User size={14} /> Info
              </button>
              <button
                className={`adm-tab ${activeTab === 'schedule' ? 'adm-tab--active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <Clock size={14} /> Schedule
              </button>
            </div>

            {formError && <p className="adm-form-error" role="alert">{formError}</p>}

            {/* ── Info tab ── */}
            {activeTab === 'info' && (
              <div className="adm-form">
                <label className="adm-label">Avatar</label>
                <AvatarUploader
                  endpoint={`${ADMIN_API}/upload-image`}
                  initialUrl={form.avatar}
                  onChange={(url) => setForm((prev) => ({ ...prev, avatar: url }))}
                />

                <div className="adm-form-row">
                  <label className="adm-label">
                    Name *
                    <input
                      className="adm-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Ana Popescu"
                      maxLength={100}
                    />
                  </label>
                  <label className="adm-label">
                    Role *
                    <input
                      className="adm-input"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Senior Nail Artist"
                      maxLength={100}
                    />
                  </label>
                </div>

                <label className="adm-label">
                  Bio
                  <textarea
                    className="adm-input adm-textarea"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Short bio shown on the team page"
                    rows={3}
                    maxLength={1000}
                  />
                </label>

                <div className="adm-form-row">
                  <label className="adm-label">
                    Email
                    <input
                      className="adm-input"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ana@salon.com"
                    />
                  </label>
                  <label className="adm-label">
                    Phone
                    <input
                      className="adm-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+373 79 000 000"
                    />
                  </label>
                </div>

                <label className="adm-label">
                  Specialties <span style={{ fontWeight: 400, opacity: .6 }}>(comma-separated)</span>
                  <input
                    className="adm-input"
                    value={form.specialties}
                    onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                    placeholder="Gel nails, Nail art, Pedicure"
                  />
                </label>

                <div className="adm-fieldset">
                  <p className="adm-section-label">Service categories they perform *</p>
                  <p className="adm-fieldset-hint">
                    Choose from the list — at booking, only members with the same category as the service are shown.
                  </p>

                  <div className="adm-category-picker-row">
                    <label className="adm-label" style={{ flex: '1 1 200px', margin: 0 }}>
                      Add category
                      <select
                        className="adm-input adm-select"
                        value={categoryPicker}
                        onChange={(e) => setCategoryPicker(e.target.value)}
                      >
                        <option value="">— select —</option>
                        {categoryOptions
                          .filter(
                            (c) =>
                              c.id !== 'all' &&
                              c.id !== 'other' &&
                              !(form.serviceCategories || []).includes(c.id),
                          )
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        <option value="__custom__">Other…</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      onClick={addServiceCategory}
                      disabled={!categoryPicker}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {categoryPicker === '__custom__' && (
                    <label className="adm-label" style={{ marginTop: 10 }}>
                      Category name
                      <input
                        className="adm-input"
                        value={form.customCategoryName}
                        onChange={(e) => setForm({ ...form, customCategoryName: e.target.value })}
                        placeholder="e.g. lashes, bridal makeup"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceCategory())}
                      />
                    </label>
                  )}

                  {(form.serviceCategories || []).length > 0 ? (
                    <div className="adm-category-tags">
                      {form.serviceCategories.map((catId) => (
                        <span key={catId} className="adm-category-tag">
                          {getCategoryLabel(catId)}
                          <button
                            type="button"
                            onClick={() => removeServiceCategory(catId)}
                            aria-label={`Remove ${getCategoryLabel(catId)}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="adm-fieldset-hint" style={{ marginTop: 8 }}>
                      No categories yet — add Manicure, Pedicure, etc.
                    </p>
                  )}
                </div>

                <div className="adm-form-row">
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
                      Lower number = appears first on the Team page and in admin lists (0, 1, 2…).
                    </span>
                  </label>
                  <label className="adm-label adm-label--checkbox" style={{ justifyContent: 'flex-end', paddingTop: 28 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Active on site
                  </label>
                </div>
                <label className="adm-label adm-label--checkbox">
                  <input
                    type="checkbox"
                    checked={form.showOnHomepage}
                    onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                  />
                  Show on homepage (Meet the artists)
                </label>
              </div>
            )}

            {/* ── Schedule tab ── */}
            {activeTab === 'schedule' && (
              <div className="adm-form">
                <p className="adm-section-label">Working hours</p>
                <div className="adm-schedule-grid">
                  {DAYS.map((day) => (
                    <DayRow
                      key={day}
                      day={day}
                      value={form.workingHours[day]}
                      onChange={setDayHours}
                    />
                  ))}
                </div>

                <p className="adm-section-label" style={{ marginTop: 20 }}>Days off / holidays</p>
                <DaysOffPicker
                  daysOff={form.daysOff}
                  onChange={(daysOff) => setForm((prev) => ({ ...prev, daysOff }))}
                />
              </div>
            )}
            </div>

            <div className="adm-modal-footer adm-form-modal__footer">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={16} className="adm-spinner" />}
                {editingId ? 'Save changes' : 'Create member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deletingId && (
        <div className="adm-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="adm-modal adm-modal--sm">
            <h2 className="adm-modal-danger-title">Delete member?</h2>
            <p className="adm-modal-danger-text">
              This cannot be undone. The avatar will also be removed from Cloudinary.
              Use the Active toggle to hide them temporarily instead.
            </p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeletingId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={() => handleDelete(deletingId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}