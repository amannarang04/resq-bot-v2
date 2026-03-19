'use client';
import { useState } from 'react';

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Aapka browser voice input support nahi karta!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setListening(true);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <button
      onClick={startListening}
      disabled={listening}
      title="Voice input"
      style={{
        background: listening
          ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
          : 'rgba(255,255,255,0.08)',
        border: listening
          ? '2px solid #a78bfa'
          : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '13px 16px',
        color: '#fff',
        fontSize: '18px',
        cursor: listening ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s',
        boxShadow: listening ? '0 0 20px rgba(124,58,237,0.5)' : 'none',
        animation: listening ? 'pulse 1s ease-in-out infinite' : 'none',
      }}
    >
      {listening ? '🔴' : '🎙️'}
    </button>
  );
}