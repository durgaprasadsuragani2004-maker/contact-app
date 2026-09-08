import React, { useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessHoursManager({ hours = [], onChange }) {
  // Initialize standard 7-day array if empty
  useEffect(() => {
    if (!hours || hours.length === 0) {
      const defaultHours = DAYS.map((day, idx) => ({
        day_of_week: day,
        is_closed: day === 'Sunday' ? 1 : 0,
        open_time: '09:00',
        close_time: day === 'Saturday' ? '14:00' : '18:00',
        display_order: idx
      }));
      onChange(defaultHours);
    }
  }, [hours, onChange]);

  const handleUpdate = (dayName, key, val) => {
    const updated = hours.map((item) => {
      if (item.day_of_week === dayName) {
        return { ...item, [key]: val };
      }
      return item;
    });
    onChange(updated);
  };

  const applyPreset = (type) => {
    let presetHours = [];
    if (type === 'standard') {
      presetHours = DAYS.map((day, idx) => ({
        day_of_week: day,
        is_closed: ['Saturday', 'Sunday'].includes(day) ? 1 : 0,
        open_time: '09:00',
        close_time: '18:00',
        display_order: idx
      }));
    } else if (type === 'extended') {
      presetHours = DAYS.map((day, idx) => ({
        day_of_week: day,
        is_closed: day === 'Sunday' ? 1 : 0,
        open_time: '09:00',
        close_time: day === 'Saturday' ? '14:00' : '18:00',
        display_order: idx
      }));
    } else if (type === '247') {
      presetHours = DAYS.map((day, idx) => ({
        day_of_week: day,
        is_closed: 0,
        open_time: '00:00',
        close_time: '23:59',
        display_order: idx
      }));
    }
    onChange(presetHours);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#F59E0B" />
            Business Operating Hours
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Set operating hours for client walk-ins, phone support, and office visits.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Mon-Fri (9am-6pm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('extended')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Mon-Sat
          </button>
          <button
            type="button"
            onClick={() => applyPreset('247')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            24 / 7
          </button>
        </div>
      </div>

      {/* Days Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {DAYS.map((day) => {
          const item = hours.find((h) => h.day_of_week === day) || {
            day_of_week: day,
            is_closed: 0,
            open_time: '09:00',
            close_time: '18:00'
          };
          const isClosed = Boolean(item.is_closed);

          return (
            <div
              key={day}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                background: isClosed ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ width: '110px', fontWeight: '600', fontSize: '0.88rem', color: isClosed ? 'var(--text-muted)' : '#F8FAFC' }}>
                {day}
              </div>

              {/* Open / Closed Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleUpdate(day, 'is_closed', isClosed ? 0 : 1)}
                  className={`btn btn-sm ${isClosed ? 'btn-danger' : 'btn-emerald'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                >
                  {isClosed ? 'Closed' : 'Open'}
                </button>
              </div>

              {/* Time Pickers */}
              {!isClosed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="time"
                    className="form-input"
                    style={{ padding: '0.35rem 0.5rem', width: '110px', fontSize: '0.85rem' }}
                    value={item.open_time || '09:00'}
                    onChange={(e) => handleUpdate(day, 'open_time', e.target.value)}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                  <input
                    type="time"
                    className="form-input"
                    style={{ padding: '0.35rem 0.5rem', width: '110px', fontSize: '0.85rem' }}
                    value={item.close_time || '18:00'}
                    onChange={(e) => handleUpdate(day, 'close_time', e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', paddingRight: '1rem' }}>
                  Not operating on {day}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
