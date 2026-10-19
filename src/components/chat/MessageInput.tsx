import React, { useState } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<Props> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form className="chat-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className="chat-send-btn"
        disabled={disabled || !text.trim()}
      >
        Send
      </button>
    </form>
  );
};