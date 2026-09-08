import React from 'react';
import { Layers, Plus, Trash2, Globe, FileText } from 'lucide-react';

export default function ServicesManager({ services = [], onChange }) {
  const handleAddService = () => {
    const newService = {
      title: '',
      description: '',
      link_url: '',
      display_order: services.length
    };
    onChange([...services, newService]);
  };

  const handleUpdate = (index, key, val) => {
    const updated = [...services];
    updated[index][key] = val;
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#8B5CF6" />
            Our Services & Key Products
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Highlight major solutions, products, consulting services, or packages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddService}
          className="btn btn-secondary btn-sm"
        >
          <Plus size={15} /> Add Service / Product
        </button>
      </div>

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No services or products listed.</p>
          <button
            type="button"
            onClick={handleAddService}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            <Plus size={14} /> Add First Offering
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {services.map((service, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#C7D2FE' }}>
                  Service #{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.35rem 0.5rem' }}
                  title="Delete service"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label"><span>Service / Product Title <span className="required">*</span></span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Enterprise Cloud Migration"
                    value={service.title || ''}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><span>Learn More / Brochure Link <span className="optional">(Optional)</span></span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Globe size={15} /></span>
                    <input
                      type="url"
                      className="form-input input-has-icon"
                      placeholder="https://company.com/service-page"
                      value={service.link_url || ''}
                      onChange={(e) => handleUpdate(idx, 'link_url', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label"><span>Short Description & Benefits</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Describe the value, deliverables, or features of this service..."
                  value={service.description || ''}
                  onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
