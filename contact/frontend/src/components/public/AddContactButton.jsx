import React, { useState } from 'react';
import { UserPlus, Check, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadVCardFile } from '../../utils/vcardHelper';

export default function AddContactButton({ token, profile, size = 'large' }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveContact = (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Trigger instant confetti animation
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10B981', '#6366F1', '#06B6D4', '#F59E0B']
      });

      // Download vCard
      downloadVCardFile(token, profile);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error('Error saving contact:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveContact}
      disabled={isLoading}
      id="btn-add-to-contacts"
      className="btn btn-emerald pulse-glowing"
      style={{
        width: '100%',
        padding: size === 'large' ? '1rem 1.5rem' : '0.75rem 1.25rem',
        fontSize: size === 'large' ? '1.05rem' : '0.92rem',
        borderRadius: '16px',
        fontWeight: '700',
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem'
      }}
    >
      {isSaved ? (
        <>
          <Check size={22} strokeWidth={2.5} />
          <span>Contact Saved to Device!</span>
        </>
      ) : (
        <>
          <UserPlus size={22} strokeWidth={2.5} />
          <span>Add to Contacts</span>
        </>
      )}
    </button>
  );
}
