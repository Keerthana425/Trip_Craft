import React, { useState, useEffect, useRef } from 'react';
import { useTrip } from '../context/TripContext';
import aiService from '../services/aiService';
import expenseService from '../services/expenseService';

const AIAssistant = () => {
  const { trips, activeTrip, selectTrip } = useTrip();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const chatEndRef = useRef(null);

  // Load chat history and expenses once activeTrip is ready
  useEffect(() => {
    const loadContextData = async () => {
      if (!activeTrip) return;
      setLoadingHistory(true);
      try {
        const history = await aiService.getChatHistory(activeTrip._id);
        setMessages(history || []);
        
        const exp = await expenseService.getExpensesByTrip(activeTrip._id);
        setExpenses(exp || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadContextData();
  }, [activeTrip]);

  // Scroll to bottom automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    if (tripId) {
      selectTrip(tripId);
    }
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || !activeTrip || sending) return;

    setSending(true);
    setInputMessage('');
    
    // Optimistic UI update
    const userMsg = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await aiService.chat(activeTrip._id, textToSend);
      // Update with server responses
      setMessages(response.messages || []);
    } catch (err) {
      console.error('Chat error:', err);
      // Append error message
      const errorMsg = { sender: 'assistant', text: 'Sorry, I failed to connect to the cognitive module. Verify API keys or connections.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = activeTrip ? Math.max(0, activeTrip.budget - totalSpent) : 0;

  const quickPrompts = [
    { label: 'Cultural customs', text: 'What cultural customs or taboos should I know about here?' },
    { label: 'Budget status', text: 'Analyze my current expenses and tell me if I am staying within my budget.' },
    { label: 'Restaurant recommendations', text: 'Can you recommend some good local places to eat?' },
    { label: 'Packing check', text: 'What important items should I double check in my packing checklist?' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-grow p-6 md:p-8 space-y-8 bg-background max-w-container-max mx-auto w-full flex flex-col h-screen overflow-hidden">
      {/* Top Header Row */}
      <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            AI Travel Concierge
          </h2>
          <p className="text-label-sm text-on-surface-variant font-label-sm opacity-70">
            Your conversational agent pre-loaded with itinerary parameters.
          </p>
        </div>

        {/* Trip dropdown */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">travel</span>
          <select
            value={activeTrip?._id || ''}
            onChange={handleTripChange}
            className="input-field w-full pl-11 pr-10 py-2.5 rounded-xl text-[13.5px] appearance-none"
          >
            <option value="" disabled>Select Journey Focus...</option>
            {trips.map(trip => (
              <option key={trip._id} value={trip._id}>
                {trip.destination}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant pointer-events-none opacity-60">arrow_drop_down</span>
        </div>
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          {/* Left Column: Trip Context details */}
          <div className="hidden lg:flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
            {/* Trip parameters card */}
            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 shadow-md space-y-4 text-left">
              <span className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest font-label-sm inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Concierge Context Locked
              </span>
              <div>
                <h4 className="text-[17px] font-bold text-on-surface font-headline-md">{activeTrip.destination}</h4>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {formatDate(activeTrip.startDate)} — {formatDate(activeTrip.endDate)} &bull; {activeTrip.travelStyle}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-outline-variant/10">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Travelers:</span>
                  <span className="font-bold">{activeTrip.travelers} Pax</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Food Standard:</span>
                  <span className="font-bold truncate max-w-[120px]">{activeTrip.foodPreferences}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Budget Target:</span>
                  <span className="font-bold">${activeTrip.budget}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Total Expended:</span>
                  <span className="font-bold text-secondary">${totalSpent}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant font-medium">Available Reserves:</span>
                  <span className="font-bold text-primary">${remainingBudget}</span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 shadow-md text-left">
              <h4 className="text-sm font-bold text-on-surface font-headline-md mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary">info</span>
                Consultant Guidelines
              </h4>
              <p className="text-[12.5px] text-on-surface-variant leading-relaxed opacity-85">
                Our agent references your live timeline coordinates, budget levels, and local custom index to answer questions. Ask about restaurants, sightseeing spots, or phrase translations.
              </p>
            </div>
          </div>

          {/* Right Column: Chat Console */}
          <div className="lg:col-span-2 flex flex-col h-full bg-surface-container-low/30 glass-panel rounded-2xl border border-outline-variant/20 overflow-hidden shadow-xl">
            {/* Messages box list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isAssistant = msg.sender === 'assistant';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[12px] border ${
                        isAssistant ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-secondary/20 border-secondary/30 text-secondary'
                      }`}>
                        {isAssistant ? 'AI' : 'ME'}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`p-4 rounded-2xl border text-[13.5px] leading-relaxed whitespace-pre-line ${
                        isAssistant 
                          ? 'bg-surface-container border-outline-variant/25 rounded-tl-xs text-on-surface' 
                          : 'bg-primary text-on-primary border-primary/20 rounded-tr-xs shadow'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                  <span className="material-symbols-outlined text-[48px] text-primary/30">chat</span>
                  <p className="text-[13px] italic">No messages logged. Transmit a query below to prompt the Concierge.</p>
                </div>
              )}

              {/* Loader bubble */}
              {sending && (
                <div className="flex gap-3 mr-auto max-w-[85%] text-left">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-[12px]">
                    AI
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 rounded-tl-xs flex items-center gap-1.5 h-11">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Chips Area */}
            {messages.length === 0 && (
              <div className="px-6 py-2 flex flex-wrap gap-2 shrink-0 border-t border-outline-variant/10 pt-4">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    className="px-3.5 py-1.5 rounded-full border border-outline-variant/25 bg-surface-container hover:bg-surface-container-high hover:border-primary/40 text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-all select-none"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form Box */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/40 shrink-0 flex gap-2">
              <input
                type="text"
                placeholder="Transmit message to Concierge..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={sending}
                className="input-field flex-1 px-4 py-3.5 rounded-xl text-[13.5px]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || !inputMessage.trim()}
                className="bg-primary text-on-primary w-12 h-12 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl border border-outline-variant/20 text-center space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-[64px] text-primary/30">forum</span>
          <h3 className="text-headline-md font-headline-md font-bold">Concierge Offline</h3>
          <p className="text-on-surface-variant text-[13px] leading-relaxed">
            Configure an active trip profile or choose an existing trip from the dropdown above to engage the AI Travel Assistant.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
