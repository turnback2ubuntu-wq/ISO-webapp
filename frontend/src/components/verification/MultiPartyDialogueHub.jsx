import React, { useState } from 'react';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Shield, User, Award, Tag } from 'lucide-react';

export default function MultiPartyDialogueHub({ document }) {
  const { addDialogueMessage } = useDocument();
  const { activeRoleKey, activeRole } = useAuth();

  const [messageText, setMessageText] = useState('');
  const [responseType, setResponseType] = useState(() => {
    if (activeRoleKey === 'auditor') return 'Temuan Observasi (Klausul EOMS)';
    if (activeRoleKey === 'kaprodi') return 'Otorisasi Kebijakan Prodi';
    return 'Tindak Lanjut Bukti';
  });

  if (!document) return null;

  const messages = document.dialogue || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    addDialogueMessage(document.id, {
      type: responseType,
      text: messageText.trim()
    });

    setMessageText('');
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <MessageSquare size={17} style={{ color: 'var(--color-primary)' }} />
            <span>Multi-Party Dialogue Hub</span>
          </h3>
          <p className="card-subtitle">
            Thread komunikasi tripartit: PIC Mutu (GPM), Kaprodi, dan Auditor Mutu
          </p>
        </div>
      </div>

      {/* Message List */}
      <div
        className="thread-container"
        style={{
          flex: 1,
          maxHeight: '420px',
          overflowY: 'auto',
          paddingRight: '0.25rem',
          marginBottom: '1rem'
        }}
      >
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem'
          }}>
            Belum ada catatan diskusi atau klarifikasi pada instrumen ini.
            Gunakan form di bawah untuk mengirim tanggapan atau catatan temuan.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-card ${msg.authorRole}`}>
              <div className="message-header">
                <div className="message-author">
                  <span>
                    {msg.authorRole === 'auditor' ? '🔍' : msg.authorRole === 'kaprodi' ? '🎓' : '👨‍💼'}
                  </span>
                  <span>{msg.authorName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-pillar" style={{ fontSize: '0.6875rem' }}>
                    {msg.type}
                  </span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              </div>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tag size={12} />
            Klasifikasi Tanggapan:
          </span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            value={responseType}
            onChange={(e) => setResponseType(e.target.value)}
          >
            {activeRoleKey === 'auditor' && (
              <>
                <option value={`Temuan Observasi (${document.clause})`}>Temuan Observasi ({document.clause})</option>
                <option value="Catatan Bukti Objektif">Catatan Bukti Objektif</option>
                <option value="Klarifikasi Klausul">Klarifikasi Klausul EOMS</option>
              </>
            )}
            {activeRoleKey === 'kaprodi' && (
              <>
                <option value="Otorisasi Kebijakan Prodi">Otorisasi Kebijakan Prodi</option>
                <option value="Disposisi PIC Mutu">Disposisi PIC Mutu</option>
                <option value="Tinjauan Akademik">Tinjauan Akademik</option>
              </>
            )}
            {activeRoleKey === 'gpm' && (
              <>
                <option value="Tindak Lanjut Bukti">Tindak Lanjut Bukti Perbaikan</option>
                <option value="Penjelasan Instrumen">Penjelasan Instrumen & CPL</option>
                <option value="Konfirmasi Versi Baru">Konfirmasi Versi Baru</option>
              </>
            )}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            className="form-textarea"
            style={{ minHeight: '65px', fontSize: '0.8125rem' }}
            placeholder={`Tulis tanggapan sebagai ${activeRole.shortTitle}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', height: '65px', padding: '0 1.25rem' }}
            disabled={!messageText.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
