import React from 'react';
import {
  User,
  Briefcase,
  Phone,
  Mail,
  Linkedin,
  Plus,
  Trash2,
  Users,
  FileText
} from 'lucide-react';

export default function CompanyContactsManager({ contacts = [], onChange }) {
  const handleAddContact = () => {
    const newContact = {
      name: '',
      designation: '',
      department: '',
      phone: '',
      alternate_phone: '',
      email: '',
      linkedin: '',
      notes: '',
      photo: null,
      display_order: contacts.length
    };
    onChange([...contacts, newContact]);
  };

  const handleUpdate = (index, key, val) => {
    const updated = [...contacts];
    updated[index][key] = val;
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= contacts.length) return;
    const updated = [...contacts];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#10B981" />
            Company Contact Persons & Key Representatives
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Add HR, Sales, Tech Leads, or Executives. Visitors can download individual vCards for each person!
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddContact}
          className="btn btn-emerald btn-sm"
        >
          <Plus size={15} /> Add Contact Person
        </button>
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No additional contact persons added.</p>
          <button
            type="button"
            onClick={handleAddContact}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            <Plus size={14} /> Add First Representative
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#6EE7B7' }}>
                  Representative #{idx + 1} {contact.name && `— ${contact.name}`}
                </span>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.55rem' }}
                    >
                      ▲
                    </button>
                  )}
                  {idx < contacts.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.55rem' }}
                    >
                      ▼
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem 0.55rem' }}
                    title="Remove representative"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label"><span>Full Name <span className="required">*</span></span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><User size={15} /></span>
                    <input
                      type="text"
                      className="form-input input-has-icon"
                      placeholder="e.g. David Miller"
                      value={contact.name || ''}
                      onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><span>Job Title / Designation</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Briefcase size={15} /></span>
                    <input
                      type="text"
                      className="form-input input-has-icon"
                      placeholder="e.g. Chief Technology Officer"
                      value={contact.designation || ''}
                      onChange={(e) => handleUpdate(idx, 'designation', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><span>Department</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Engineering & R&D"
                    value={contact.department || ''}
                    onChange={(e) => handleUpdate(idx, 'department', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label"><span>Direct Phone Number</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Phone size={15} /></span>
                    <input
                      type="tel"
                      className="form-input input-has-icon"
                      placeholder="e.g. +1 (415) 555-0188"
                      value={contact.phone || ''}
                      onChange={(e) => handleUpdate(idx, 'phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><span>Direct Email</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Mail size={15} /></span>
                    <input
                      type="email"
                      className="form-input input-has-icon"
                      placeholder="e.g. david.m@company.com"
                      value={contact.email || ''}
                      onChange={(e) => handleUpdate(idx, 'email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><span>LinkedIn Profile URL</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Linkedin size={15} color="#0A66C2" /></span>
                    <input
                      type="url"
                      className="form-input input-has-icon"
                      placeholder="https://linkedin.com/in/username"
                      value={contact.linkedin || ''}
                      onChange={(e) => handleUpdate(idx, 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label"><span>Role Notes / Specialty</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Point of contact for enterprise cloud migrations & audits"
                  value={contact.notes || ''}
                  onChange={(e) => handleUpdate(idx, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
