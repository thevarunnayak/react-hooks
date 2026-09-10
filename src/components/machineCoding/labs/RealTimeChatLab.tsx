import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Send, ArrowDown, Bot, User, Sparkles, RotateCcw } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'alex' | 'system';
  senderName: string;
  text: string;
  timestamp: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'alex', senderName: 'Alex Rivera', text: 'Hey! Are you ready for the Frontend Machine Coding session?', timestamp: Date.now() - 300000 },
  { id: '2', sender: 'me', senderName: 'You', text: 'Yes! Focusing on real-time chat auto-scroll and WebSocket handling.', timestamp: Date.now() - 240000 },
  { id: '3', sender: 'alex', senderName: 'Alex Rivera', text: 'Great. Make sure you handle when the candidate scrolls up to read history so new messages don’t yank their viewport down.', timestamp: Date.now() - 180000 },
  { id: '4', sender: 'me', senderName: 'You', text: 'Exactly. That requires scroll threshold detection (scrollHeight - scrollTop - clientHeight < 40).', timestamp: Date.now() - 150000 },
  { id: '5', sender: 'alex', senderName: 'Alex Rivera', text: 'And don’t forget the floating jump-to-bottom button with unread counter badges.', timestamp: Date.now() - 120000 },
  { id: '6', sender: 'me', senderName: 'You', text: 'Plus synthetic typing indicators and clean debounced message submission.', timestamp: Date.now() - 90000 },
  { id: '7', sender: 'alex', senderName: 'Alex Rivera', text: 'Scroll up right now in this window to test it out! A "Scroll to bottom" button pops up immediately.', timestamp: Date.now() - 60000 },
];

const BOT_REPLIES = [
  'Remember to clean up event listeners in useEffect return callback!',
  'Have you tested with rapid burst messages?',
  'Notice how the scroll-to-bottom pill appears whenever you scroll up.',
  'Component architecture matters just as much as working features.',
  'Double check accessibility: screen reader live announcements for incoming chats!',
];

export const RealTimeChatLab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isAlexTyping, setIsAlexTyping] = useState(false);
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  // Auto-scroll to bottom on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if viewport is near bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Near bottom threshold: within 36px of bottom
    const isBottom = scrollHeight - scrollTop - clientHeight < 36;
    isScrolledToBottomRef.current = isBottom;

    if (isBottom) {
      setShowScrollPill(false);
      setUnreadCount(0);
    } else {
      // Scrolled up: immediately show scroll to bottom button
      setShowScrollPill(true);
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setShowScrollPill(false);
      setUnreadCount(0);
    }
  };

  const simulateIncomingMessage = () => {
    setIsAlexTyping(true);
    setTimeout(() => {
      setIsAlexTyping(false);
      const replyText = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      const botMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'alex',
        senderName: 'Alex Rivera',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isScrolledToBottomRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setShowScrollPill(true);
        setUnreadCount((c) => c + 1);
      }
    }, 800);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const myMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'me',
      senderName: 'You',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, myMsg]);
    setInputText('');

    // Sending always forces scroll to bottom
    setTimeout(() => scrollToBottom(true), 50);

    // Trigger simulated reply
    setIsAlexTyping(true);
    setTimeout(() => {
      setIsAlexTyping(false);
      const replyText = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'alex',
        senderName: 'Alex Rivera',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // If user was at bottom, auto scroll; else show pill with incremented unread count
      if (isScrolledToBottomRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setShowScrollPill(true);
        setUnreadCount((c) => c + 1);
      }
    }, 1400);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setShowScrollPill(false);
    setUnreadCount(0);
    setIsAlexTyping(false);
    setTimeout(() => scrollToBottom(false), 50);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520, margin: '0 auto' }}>
      {/* Control Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-success)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>Alex Rivera (Online)</span>
          {isAlexTyping && <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontStyle: 'italic' }}>typing...</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="xs"
            variant="secondary"
            icon={<Bot size={12} />}
            onClick={simulateIncomingMessage}
          >
            Simulate Incoming
          </Button>
          <button
            onClick={handleReset}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div
        style={{
          height: 360,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Messages Stream */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((m) => {
            const isMe = m.sender === 'me';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  gap: 3,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: 'var(--text-muted)' }}>
                  {!isMe && <span>{m.senderName}</span>}
                  <span>{formatTime(m.timestamp)}</span>
                </div>
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isMe ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating "Scroll to Bottom" Jump Button */}
        {showScrollPill && (
          <button
            onClick={() => scrollToBottom(true)}
            style={{
              position: 'absolute',
              bottom: 64,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '7px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowDown size={13} />
            <span>{unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Scroll to bottom'}</span>
          </button>
        )}

        {/* Message Input Composer */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, backgroundColor: 'var(--bg-surface)' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type a message (Press Enter to send)..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Button size="sm" variant="primary" icon={<Send size={13} />} onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Scroll up inside the chat to test the intelligent auto-scroll suppression and pill button.
      </div>
    </div>
  );
};
