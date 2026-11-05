import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Chat.css';
import CrisisCard from '../components/CrisisCard';
import { detectCrisis, containsPhrase } from '../lib/safety';

const therapeuticResponses = {
  keywords: [
    {
      words: ['sad', 'crying', 'cry', 'tears', 'depressed', 'depression', 'unhappy'],
      responses: [
        "I hear you. Sadness can feel so heavy sometimes — like carrying something you never asked for. You don't have to explain it or justify it. It's okay to just feel it right now. 💙",
        "Thank you for sharing that with me. What you're feeling is real and it matters. Sometimes sadness comes without a clear reason, and that's okay too. You're not broken — you're human. 💙",
        "It takes courage to acknowledge when we're hurting. I'm here with you in this. Can you tell me a little more about what's been weighing on you?"
      ]
    },
    {
      words: ['anxious', 'anxiety', 'worried', 'worry', 'panic', 'scared', 'fear', 'nervous'],
      responses: [
        "Anxiety can make everything feel urgent and dangerous when it isn't. Right now, in this moment, you are safe. Take one slow breath with me. In for 4 counts, out for 6. You are okay. 💙",
        "I understand. When anxiety hits, it can feel like the worst thing is definitely about to happen. But most of what we fear never comes. You've survived every anxious moment so far — every single one. 💪",
        "That feeling of dread is so exhausting. Your nervous system is trying to protect you, even when it gets it wrong. Be gentle with yourself right now. What would help you feel even slightly safer in this moment?"
      ]
    },
    {
      words: ['angry', 'anger', 'furious', 'rage', 'mad', 'frustrated', 'frustration'],
      responses: [
        "Anger is often pain wearing a different face. Something hurt you, or something wasn't fair, or someone let you down — and now you're carrying that. Your anger makes sense. 💙",
        "It's okay to be angry. Anger tells us when something matters, when a boundary was crossed, when we deserved better. What happened? I'm listening.",
        "That frustration you're feeling — it's valid. Sometimes the world is genuinely unfair and it's okay to be angry about that. You don't have to be calm about things that aren't okay."
      ]
    },
    {
      words: ['lonely', 'alone', 'isolated', 'nobody', 'no one', 'by myself'],
      responses: [
        "Loneliness is one of the hardest feelings there is. The sense that you're on the outside of something everyone else seems to have access to. You are not alone in feeling alone — and I'm here with you right now. 💙",
        "I hear you. Feeling unseen and disconnected is painful in a way that's hard to put into words. Thank you for reaching out — even to me. It takes something to say 'I'm lonely.' That matters.",
        "You reached out, and that's brave. Loneliness lies — it tells us nobody cares, nobody would understand. But here you are, talking. And here I am, listening. You're not as alone as it feels."
      ]
    },
    {
      words: ['hopeless', 'no hope', 'pointless', 'worthless', 'nothing matters', 'give up', 'giving up'],
      // These feelings can sit close to a crisis, so always point to real support too.
      showSupport: true,
      responses: [
        "When hope feels gone, it's one of the darkest places to be. But I want you to know something — hopelessness is a feeling, not a fact. Feelings change, even when they feel permanent. 💙",
        "I hear the exhaustion in what you're saying. When you've been fighting for a long time, everything can feel too heavy to carry. But you're still here, still talking — that's a kind of hope even when it doesn't feel like it. You deserve support from people who can be there with you, too.",
        "What you're feeling right now is real and heavy. Please know that you matter — not for what you do or produce or give to others, but simply because you exist. Can you tell me more about what's brought you to this place?"
      ]
    },
    {
      words: ['tired', 'exhausted', 'drained', 'no energy', 'burnout', 'empty'],
      responses: [
        "That deep tiredness that sleep doesn't fix — I understand. Your mind and heart have been working so hard. Rest isn't laziness. It's what you need right now. 💙",
        "You've been carrying so much. It makes complete sense that you're exhausted. Is there anything — even something small — you could put down today? Even for just a few hours?",
        "The world asks so much of us. And we push and push until there's nothing left. Your exhaustion is a message worth listening to. What do you think it's trying to tell you?"
      ]
    },
    {
      words: ['help', 'need help', 'struggling', 'hard', 'difficult', 'cant cope'],
      responses: [
        "Asking for help is one of the bravest things a person can do. You don't have to have it all figured out. You just have to take the next small step — and you've already done that by being here. 💙",
        "I'm so glad you reached out. Struggling doesn't mean you're weak — it means you've been strong for too long without enough support. You deserve help. You deserve to not carry this alone.",
        "You don't have to cope alone. What's the heaviest thing right now? Let's start there."
      ]
    },
  ],
  default: [
    "I'm here and I'm listening. Tell me more about what's on your mind. 💙",
    "Thank you for sharing that with me. How long have you been feeling this way?",
    "I hear you. What would feel most helpful to talk about right now?",
    "That sounds really difficult. You don't have to go through it alone. What's weighing on you most?",
    "I'm glad you're here. Sometimes just putting things into words can help. What else is on your heart?",
    "You're being really brave by talking about this. I'm listening — all of it, whatever you need to share. 💙"
  ]
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Order matters: the crisis check always runs first.
function getResponse(message) {
  if (detectCrisis(message)) return { crisis: true };
  for (const category of therapeuticResponses.keywords) {
    if (category.words.some((word) => containsPhrase(message, word))) {
      return { text: pick(category.responses), support: Boolean(category.showSupport) };
    }
  }
  return { text: pick(therapeuticResponses.default), support: false };
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello, I'm here for you. 💙 This is a safe space — no judgement, no pressure. How are you feeling today?",
      time: timeNow(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage() {
    const text = input.trim();
    if (text === '' || typing) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text, time: timeNow() }]);
    setInput('');

    const reply = getResponse(text);

    // A crisis reply appears immediately: no fake "typing" delay.
    if (reply.crisis) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', crisis: true, time: timeNow() }]);
      return;
    }

    setTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: 'assistant', text: reply.text, support: reply.support, time: timeNow() },
    ]);
  }

  return (
    <div className="chat">
      <div className="chat-header">
        <div className="chat-avatar">🧠</div>
        <div className="chat-info">
          <h2>SoulSpace Companion</h2>
          <p className="online">● Guided support chat · pre-written replies, not a therapist</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="avatar">💙</div>
            )}
            {msg.crisis ? (
              <CrisisCard compact />
            ) : (
              <div className="message-bubble">
                <p>{msg.text}</p>
                {msg.support && (
                  <p className="support-hint">
                    If it ever feels like too much, <Link to="/support">real people are here to help</Link>.
                  </p>
                )}
                <span className="time">{msg.time}</span>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="message assistant">
            <div className="avatar">💙</div>
            <div className="message-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea
          aria-label="Message the companion"
          placeholder="Share what's on your mind... 💙"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={2}
        />
        <button onClick={sendMessage} disabled={typing}>Send 💙</button>
      </div>

      <p className="disclaimer">
        💙 This companion uses pre-written replies and is not a substitute for professional care.
        Conversations here aren't saved. If you're in crisis, <Link to="/support">get support now</Link>.
      </p>
    </div>
  );
}

export default Chat;