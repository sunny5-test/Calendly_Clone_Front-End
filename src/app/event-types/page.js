'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import EventTypeCard from '@/components/dashboard/EventTypeCard';
import EventTypeModal from '@/components/dashboard/EventTypeModal';
import Toast from '@/components/layout/Toast';
import { eventTypeAPI } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function EventTypesPageContent() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const res = await eventTypeAPI.getAll();
      setEventTypes(res.data.data);
    } catch (err) {
      setToast({ message: 'Failed to load event types', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEdit = (eventType) => {
    setEditingEvent(eventType);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingEvent) {
      await eventTypeAPI.update(editingEvent.id, formData);
      setToast({ message: 'Event type updated successfully', type: 'success' });
    } else {
      await eventTypeAPI.create(formData);
      setToast({ message: 'Event type created successfully', type: 'success' });
    }
    fetchEventTypes();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event type? All associated bookings will also be deleted.')) {
      return;
    }
    try {
      await eventTypeAPI.delete(id);
      setToast({ message: 'Event type deleted', type: 'success' });
      fetchEventTypes();
    } catch (err) {
      setToast({ message: 'Failed to delete event type', type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <Header
        title="Event Types"
        subtitle="Create and manage the events people can book with you"
        action={
          <button
            onClick={handleCreate}
            className="btn btn-primary"
            id="create-event-type"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Event Type
          </button>
        }
      />

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-4" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && eventTypes.length === 0 && (
        <div className="card glass text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">No event types yet</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-5">
            Create your first event type to start accepting bookings
          </p>
          <button onClick={handleCreate} className="btn btn-primary" id="create-first-event">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Event Type
          </button>
        </div>
      )}

      {/* Event Types Grid */}
      {!loading && eventTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventTypes.map((et, i) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <EventTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        eventType={editingEvent}
      />

      {/* Toast */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function EventTypesPage() {
  return (
    <ProtectedRoute>
      <EventTypesPageContent />
    </ProtectedRoute>
  );
}
