'use client';

import { useState, useEffect } from 'react';

const EVENT_KINDS = [
  {
    id: 'one-on-one',
    name: 'One-on-one',
    description: '1 host → 1 invitee',
    detail: 'Good for coffee chats, 1:1 interviews, etc.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'group',
    name: 'Group',
    description: '1 host → Multiple invitees',
    detail: 'Webinars, online classes, etc.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'round-robin',
    name: 'Round robin',
    description: 'Rotating hosts → 1 invitee',
    detail: 'Distribute meetings between team members',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23,4 23,10 17,10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    id: 'collective',
    name: 'Collective',
    description: 'Multiple hosts → 1 invitee',
    detail: 'Panel interviews, group sales calls, etc.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const COLORS = ['#006BFF', '#FF6B00', '#00C853', '#7C3AED', '#E91E63', '#00BCD4', '#FF5722', '#607D8B'];

/**
 * Modal dialog for creating or editing an event type.
 * Step 1: Choose event kind (only for new events)
 * Step 2: Event details form
 */
export default function EventTypeModal({ isOpen, onClose, onSave, eventType }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    slug: '',
    color: '#006BFF',
    kind: 'one-on-one',
    maxInvitees: 2,
    coHostEmails: [],
  });
  const [coHostInput, setCoHostInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!eventType;

  useEffect(() => {
    if (eventType) {
      setFormData({
        name: eventType.name,
        duration: eventType.duration,
        slug: eventType.slug,
        color: eventType.color || '#006BFF',
        kind: eventType.kind || 'one-on-one',
        maxInvitees: eventType.maxInvitees || 2,
        coHostEmails: eventType.coHosts?.map((c) => c.user.email) || [],
        locationType: eventType.locationType || 'none',
        locationValue: eventType.locationValue || '',
      });
      setStep(2); // Skip kind selection when editing
    } else {
      setFormData({ name: '', duration: 30, slug: '', color: '#006BFF', kind: 'one-on-one', maxInvitees: 2, coHostEmails: [], locationType: 'none', locationValue: '' });
      setStep(1);
    }
    setCoHostInput('');
  }, [eventType, isOpen]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : slug,
    }));
  };

  const handleKindSelect = (kindId) => {
    setFormData((prev) => ({ ...prev, kind: kindId }));
    setStep(2);
  };

  const handleAddCoHost = () => {
    const email = coHostInput.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (formData.coHostEmails.includes(email)) return;
    setFormData((prev) => ({
      ...prev,
      coHostEmails: [...prev.coHostEmails, email],
    }));
    setCoHostInput('');
  };

  const handleRemoveCoHost = (email) => {
    setFormData((prev) => ({
      ...prev,
      coHostEmails: prev.coHostEmails.filter((e) => e !== email),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const needsCoHosts = formData.kind === 'round-robin' || formData.kind === 'collective';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mx-3 sm:mx-auto" onClick={(e) => e.stopPropagation()} style={{ maxWidth: step === 1 ? '600px' : '480px' }}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 2 && !isEditing && (
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-ghost p-1.5 rounded-lg"
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
              )}
              <h2 className="text-lg font-semibold m-0">
                {step === 1 ? 'Choose Event Type' : (isEditing ? 'Edit Event Type' : 'New Event Type')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost p-1.5 rounded-lg"
              id="close-event-modal"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Step 1: Kind Selection */}
        {step === 1 && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              {EVENT_KINDS.map((kind) => (
                <button
                  key={kind.id}
                  type="button"
                  onClick={() => handleKindSelect(kind.id)}
                  className="flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] bg-white cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                  }}
                  id={`kind-${kind.id}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0 text-[var(--primary)]">
                    {kind.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--primary)] m-0 mb-0.5">{kind.name}</h3>
                    <p className="text-sm text-[var(--text-primary)] m-0 mb-1">{kind.description}</p>
                    <p className="text-xs text-[var(--text-muted)] m-0">{kind.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Event Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="flex flex-col gap-5">

              {/* Selected Kind Badge */}
              <div className="flex items-center gap-2">
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                  {formData.kind.replace('-', ' ')}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[var(--primary)] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Event Name */}
              <div>
                <label className="label" htmlFor="event-name">Event Name</label>
                <input
                  id="event-name"
                  type="text"
                  className="input"
                  placeholder="e.g. 30 Minute Meeting"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  autoFocus
                />
              </div>

              {/* Duration */}
              <div>
                <label className="label" htmlFor="event-duration">Duration (minutes)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`btn btn-sm flex-1 ${
                        formData.duration === d ? 'btn-primary' : 'btn-secondary'
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, duration: d }))}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
                <input
                  id="event-duration"
                  type="number"
                  className="input mt-2"
                  placeholder="Custom duration"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="5"
                  max="480"
                  required
                />
              </div>

              {/* Max Invitees (Group only) */}
              {formData.kind === 'group' && (
                <div>
                  <label className="label" htmlFor="max-invitees">Max Invitees per Slot</label>
                  <input
                    id="max-invitees"
                    type="number"
                    className="input"
                    placeholder="e.g. 10"
                    value={formData.maxInvitees}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxInvitees: Math.max(2, parseInt(e.target.value) || 2) }))}
                    min="2"
                    max="100"
                    required
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    How many people can book the same time slot
                  </p>
                </div>
              )}

              {/* Co-Hosts (Round Robin / Collective) */}
              {needsCoHosts && (
                <div>
                  <label className="label">Co-Hosts</label>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {formData.kind === 'round-robin'
                      ? 'Meetings will rotate between you and your co-hosts'
                      : 'All co-hosts must be available for a slot to appear'}
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="email"
                      className="input flex-1"
                      placeholder="co-host@example.com"
                      value={coHostInput}
                      onChange={(e) => setCoHostInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCoHost();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCoHost}
                      className="btn btn-secondary btn-sm shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {formData.coHostEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.coHostEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)]"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveCoHost(email)}
                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-0"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {formData.coHostEmails.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Add at least one co-host email (must be a registered user)
                    </p>
                  )}
                </div>
              )}

              {/* Meeting Location */}
              <div>
                <label className="label">Meeting Location</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {[
                    { id: 'google-meet', label: 'Google Meet', icon: '🎥', color: '#1a73e8' },
                    { id: 'teams', label: 'Teams', icon: '💬', color: '#5b5fc7' },
                    { id: 'zoom', label: 'Zoom', icon: '📹', color: '#2d8cff' },
                    { id: 'custom', label: 'In-Person', icon: '📍', color: '#059669' },
                    { id: 'none', label: 'None', icon: '—', color: '#6b7280' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, locationType: loc.id, locationValue: loc.id === 'none' ? '' : prev.locationValue }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                        formData.locationType === loc.id
                          ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                          : 'border-[var(--border)] hover:border-[var(--primary)] bg-white'
                      }`}
                      id={`loc-${loc.id}`}
                    >
                      <span>{loc.icon}</span>
                      {loc.label}
                    </button>
                  ))}
                </div>
                {formData.locationType === 'google-meet' && (
                  <input
                    type="url"
                    className="input"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={formData.locationValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, locationValue: e.target.value }))}
                  />
                )}
                {formData.locationType === 'teams' && (
                  <input
                    type="url"
                    className="input"
                    placeholder="https://teams.microsoft.com/l/meetup-join/..."
                    value={formData.locationValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, locationValue: e.target.value }))}
                  />
                )}
                {formData.locationType === 'zoom' && (
                  <input
                    type="url"
                    className="input"
                    placeholder="https://zoom.us/j/1234567890"
                    value={formData.locationValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, locationValue: e.target.value }))}
                  />
                )}
                {formData.locationType === 'custom' && (
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Office Room 301, 123 Main Street"
                    value={formData.locationValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, locationValue: e.target.value }))}
                  />
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="label" htmlFor="event-slug">URL Slug</label>
                <div className="flex items-center gap-0">
                  <span className="px-2 sm:px-3 py-2.5 bg-[var(--bg-tertiary)] border border-r-0 border-[var(--border)] rounded-l-[var(--radius-md)] text-xs sm:text-sm text-[var(--text-muted)] shrink-0">
                    /event/
                  </span>
                  <input
                    id="event-slug"
                    type="text"
                    className="input rounded-l-none"
                    placeholder="my-meeting"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: formData.color === color ? 'var(--text-primary)' : 'transparent',
                        transform: formData.color === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                      onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                id="cancel-event-modal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.name || !formData.slug || !formData.duration}
                id="save-event-type"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Event Type'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
