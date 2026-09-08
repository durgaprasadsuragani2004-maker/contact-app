import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ImageUploader({
  label = 'Profile Photo / Avatar',
  field = 'profile_photo',
  currentImage = null,
  onImageUploaded
}) {
  const { setProfile, showToast } = useAuth();
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller image.', 'error');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, WEBP, and SVG image formats are supported.', 'error');
      return;
    }

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to server
    const formData = new FormData();
    formData.append('media', file);
    formData.append('field', field);

    setUploading(true);
    try {
      const res = await api.uploadMedia(formData);
      if (res.success) {
        setPreview(res.url);
        if (onImageUploaded) onImageUploaded(res.url);
        if (setProfile && res.profile) setProfile(res.profile);
        showToast(`${label} uploaded successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload image.', 'error');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onImageUploaded) onImageUploaded(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="form-label">
        <span>{label}</span>
        <span className="optional">PNG, JPG, WEBP up to 5MB</span>
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: '2px dashed var(--border-glass-bright)',
          borderRadius: '16px',
          padding: '1.25rem',
          background: 'rgba(11, 15, 25, 0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'all 0.2s ease'
        }}
        className="glass-panel-interactive"
      >
        {/* Thumbnail Preview */}
        <div
          style={{
            width: '74px',
            height: '74px',
            borderRadius: field === 'company_logo' ? '14px' : '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid var(--border-glass)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon size={30} color="var(--text-muted)" />
          )}
        </div>

        {/* Instructions */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.92rem', fontWeight: '600', color: '#F8FAFC', marginBottom: '2px' }}>
            {uploading ? 'Uploading...' : preview ? 'Click to replace image' : `Click to upload ${label}`}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Embedded automatically into standard vCard files & public profile
          </p>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ pointerEvents: 'none' }}
          >
            <Upload size={14} />
            Browse
          </button>

          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-danger btn-sm"
              title="Remove image"
              style={{ padding: '0.5rem' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
