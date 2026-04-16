'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { profileAPI } from '@/services/api';
import { getUser, getToken, setToken } from '@/utils/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageCropModal from '@/components/profile/ImageCropModal';

function ProfileContent() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [toast, setToast] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null); // Data URL for crop modal
  const fileInputRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileAPI.get();
      setProfile(res.data.data);
      setName(res.data.data.name || '');
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Re-fetch the user from /api/auth/me and issue a fresh JWT
   * so that getUser() on the client (which reads the JWT payload)
   * reflects the latest name / avatar without requiring a re-login.
   */
  const refreshToken = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/profile/refresh-token`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
      }
    } catch {
      // non-critical – token will be refreshed on next login
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await profileAPI.update({ name: name.trim() });
      setProfile(res.data.data);
      await refreshToken();
      showToast('Name updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update name', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * When user selects a file, validate it, read it as a data URL,
   * and open the crop modal — NOT upload immediately.
   */
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, WebP, and GIF images are allowed', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }

    // Read file as data URL and open crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Called when user confirms the crop in the modal.
   * Receives a cropped Blob, converts it to a File, and uploads.
   */
  const handleCropConfirm = useCallback(async (croppedBlob) => {
    setCropImageSrc(null); // close modal immediately
    try {
      setUploading(true);
      // Convert Blob to File for the FormData upload
      const croppedFile = new File([croppedBlob], 'avatar.png', { type: 'image/png' });
      const res = await profileAPI.uploadAvatar(croppedFile);
      setProfile(res.data.data);
      await refreshToken();
      showToast('Profile picture updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Called when user cancels the crop modal.
   */
  const handleCropCancel = useCallback(() => {
    setCropImageSrc(null);
  }, []);

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      const res = await profileAPI.removeAvatar();
      setProfile(res.data.data);
      await refreshToken();
      showToast('Profile picture removed');
    } catch (err) {
      showToast('Failed to remove profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
        <div className="animate-fade-in">
          {/* Header skeleton */}
          <div className="skeleton h-8 w-48 mb-2 rounded-lg" />
          <div className="skeleton h-4 w-72 mb-8 rounded-lg" />
          {/* Avatar skeleton */}
          <div className="card mb-6">
            <div className="flex items-center gap-6">
              <div className="skeleton w-24 h-24 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-5 w-40 mb-2 rounded-lg" />
                <div className="skeleton h-4 w-56 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Form skeleton */}
          <div className="card">
            <div className="skeleton h-5 w-32 mb-4 rounded-lg" />
            <div className="skeleton h-10 w-full mb-4 rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const userInitial = (profile?.name || profile?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] m-0">Profile Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 m-0">
          Manage your personal information and profile picture
        </p>
      </div>

      {/* ── Avatar Section ── */}
      <div className="card glass mb-6 animate-fade-in stagger-1" style={{ animationFillMode: 'backwards' }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)] m-0 mb-5">
          Profile Picture
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Display */}
          <div className="relative group">
            <div
              className="w-28 h-28 rounded-full overflow-hidden border-4 border-white flex items-center justify-center shrink-0"
              style={{
                boxShadow: '0 0 0 2px var(--border), 0 8px 24px rgba(0, 107, 255, 0.12)',
                background: profile?.avatar ? 'transparent' : 'linear-gradient(135deg, var(--primary) 0%, #0052CC 100%)',
              }}
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  id="profile-avatar-img"
                />
              ) : (
                <span className="text-white text-3xl font-bold">{userInitial}</span>
              )}
            </div>

            {/* Upload overlay */}
            {!uploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-28 h-28 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-200 border-none"
                id="avatar-upload-overlay"
                title="Change profile picture"
              >
                <svg
                  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}

            {/* Uploading spinner overlay */}
            {uploading && (
              <div className="absolute inset-0 w-28 h-28 rounded-full bg-black/50 flex items-center justify-center">
                <div
                  className="w-8 h-8 border-3 border-white/30 rounded-full"
                  style={{
                    borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              </div>
            )}
          </div>

          {/* Upload Zone + Actions */}
          <div className="flex-1 w-full">
            {/* Drag & Drop Zone */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                  : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-50)]'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              id="avatar-drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                id="avatar-file-input"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--text-secondary)] m-0">
                  <span className="text-[var(--primary)] font-semibold">Click to upload</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-[var(--text-muted)] m-0">
                  JPEG, PNG, WebP, or GIF • Max 5MB
                </p>
              </div>
            </div>

            {/* Remove avatar button */}
            {profile?.avatar && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
                id="remove-avatar-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Remove picture
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Info Section ── */}
      <div className="card glass mb-6 animate-fade-in stagger-2" style={{ animationFillMode: 'backwards' }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)] m-0 mb-5">
          Personal Information
        </h2>

        <form onSubmit={handleSaveName}>
          {/* Name Field */}
          <div className="mb-5">
            <label htmlFor="profile-name" className="label">
              Display Name
            </label>
            <input
              type="text"
              id="profile-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5 m-0">
              This is how your name appears to others on your booking pages
            </p>
          </div>

          {/* Email Field (read-only) */}
          <div className="mb-6">
            <label htmlFor="profile-email" className="label">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="profile-email"
                className="input"
                value={profile?.email || ''}
                disabled
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span className="text-xs text-[var(--text-muted)]">Managed by Google</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] m-0">
              {profile?.createdAt && `Member since ${new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            </p>
            <button
              type="submit"
              disabled={saving || !name.trim() || name.trim() === profile?.name}
              className="btn btn-primary"
              id="save-profile-btn"
            >
              {saving ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 rounded-full"
                    style={{ borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }}
                  />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Account Info Card ── */}
      <div className="card glass animate-fade-in stagger-3" style={{ animationFillMode: 'backwards' }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)] m-0 mb-4">
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] m-0 mb-1 font-medium uppercase tracking-wider">Account ID</p>
            <p className="text-sm text-[var(--text-primary)] m-0 font-semibold">#{profile?.id}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] m-0 mb-1 font-medium uppercase tracking-wider">Auth Provider</p>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <p className="text-sm text-[var(--text-primary)] m-0 font-semibold">Google OAuth</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* ── Image Crop Modal ── */}
      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
