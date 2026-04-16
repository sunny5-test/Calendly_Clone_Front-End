'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

/**
 * Convert degrees to radians.
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Create an Image element from a source URL.
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

/**
 * Crop the image using an offscreen canvas.
 * Returns a Blob of the cropped area as PNG.
 *
 * @param {string} imageSrc - Data URL or object URL of the image
 * @param {object} pixelCrop - { x, y, width, height } from react-easy-crop
 * @param {number} rotation - Rotation in degrees
 * @returns {Promise<Blob>} Cropped image as Blob
 */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Calculate bounding box of the rotated image
  const rotRad = degToRad(rotation);
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const bBoxWidth = image.width * cos + image.height * sin;
  const bBoxHeight = image.width * sin + image.height * cos;

  // Set canvas to bounding box size, draw rotated image at center
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the cropped area from the rotated canvas
  const croppedData = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Output canvas at the final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(croppedData, 0, 0);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/png',
      1
    );
  });
}

/**
 * ImageCropModal — Full-screen modal for cropping a profile picture.
 *
 * Features:
 *   • Circular crop preview (1:1 aspect ratio)
 *   • Zoom slider
 *   • Rotation slider
 *   • Reset controls
 *   • Animated modal with backdrop blur
 *
 * @param {string}   imageSrc  - Data URL of the selected image
 * @param {function} onConfirm - Called with the cropped Blob when user clicks Save
 * @param {function} onCancel  - Called when user cancels
 */
export default function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      setProcessing(true);
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onConfirm(blob);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }} id="image-crop-modal">
      <div
        className="modal-content"
        style={{
          maxWidth: 520,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"
          style={{ background: 'var(--bg-primary)' }}
        >
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] m-0">
              Edit Profile Picture
            </h2>
            <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5">
              Drag to reposition • Scroll to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-ghost p-1.5 rounded-lg"
            id="crop-modal-close"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Crop Area ── */}
        <div
          className="relative"
          style={{
            height: 340,
            background: '#1a1a2e',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                background: '#1a1a2e',
              },
              cropAreaStyle: {
                border: '3px solid white',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
              },
            }}
          />

          {/* Circular preview hint */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-[11px] text-white/80 font-medium">Drag to adjust</span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="px-6 py-4" style={{ background: 'var(--bg-secondary)' }}>
          {/* Zoom Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                Zoom
              </label>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                className="btn btn-ghost p-1 rounded-md shrink-0"
                id="zoom-out-btn"
                aria-label="Zoom out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="crop-slider flex-1"
                id="zoom-slider"
                aria-label="Zoom"
              />
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="btn btn-ghost p-1 rounded-md shrink-0"
                id="zoom-in-btn"
                aria-label="Zoom in"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1,4 1,10 7,10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                Rotation
              </label>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {rotation}°
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRotation(Math.max(-180, rotation - 5))}
                className="btn btn-ghost p-1 rounded-md shrink-0"
                id="rotate-left-btn"
                aria-label="Rotate left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1,4 1,10 7,10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
              </button>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="crop-slider flex-1"
                id="rotation-slider"
                aria-label="Rotation"
              />
              <button
                onClick={() => setRotation(Math.min(180, rotation + 5))}
                className="btn btn-ghost p-1 rounded-md shrink-0"
                id="rotate-right-btn"
                aria-label="Rotate right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                  <polyline points="1,4 1,10 7,10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]"
          style={{ background: 'var(--bg-primary)' }}
        >
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            id="crop-reset-btn"
            disabled={processing}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
              id="crop-cancel-btn"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary btn-sm"
              id="crop-confirm-btn"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 rounded-full"
                    style={{ borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }}
                  />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  Apply &amp; Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
