'use client';
import { useState, useRef } from 'react';

export default function ImageUpload({ onResult, onLoading }) {
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleImage = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    onLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      onResult(data.reply);
    } catch {
      onResult('❌ Image analyze nahi ho saki. Dobara try karo.');
    } finally {
      onLoading(false);
      setPreview(null);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileRef}
        style={{ display: 'none' }}
        onChange={e => handleImage(e.target.files[0])}
      />
      <button
        onClick={() => fileRef.current.click()}
        title="Upload emergency photo"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          padding: '13px 14px',
          color: '#fff',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.3)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        📸
      </button>
    </>
  );
}