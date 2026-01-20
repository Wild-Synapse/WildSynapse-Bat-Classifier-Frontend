import React, { useState } from 'react';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { AnalysisResult, Statistics } from '../types';

interface ChatAssistantProps {
  darkMode: boolean;
  API_BASE: string;
  results: AnalysisResult[];
  statistics: Statistics | null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ darkMode, API_BASE, results, statistics }) => {
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const cardClass = darkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/50' : 'bg-white/80 backdrop-blur-xl border-slate-200';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          history: results,
          statistics: statistics
        })
      });
      
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col animate-in fade-in duration-700">
      <div className="mb-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          AI Research Assistant
        </h2>
        <p className={`${mutedClass}`}>Ask questions about your acoustic data and species patterns</p>
      </div>

      <div className={`flex-1 ${cardClass} border rounded-3xl p-6 overflow-y-auto mb-4 shadow-2xl backdrop-blur-xl`} style={{scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent'}}>
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-bold mb-2">Ask me anything about your bat data</p>
            <p className="text-sm text-slate-500">I can analyze patterns, compare species, and provide insights</p>
          </div>
        )}
        <div className="space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm' 
                  : `${darkMode ? 'bg-slate-800/80' : 'bg-white'} border ${darkMode ? 'border-slate-700' : 'border-slate-200'} text-slate-200 rounded-tl-sm backdrop-blur-sm`
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className={`p-4 ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl w-20 flex justify-center backdrop-blur-sm`}>
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${cardClass} border rounded-2xl p-4 flex gap-3 shadow-xl backdrop-blur-xl`}>
        <input 
          className={`flex-1 ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-slate-500`}
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Ask about species patterns, frequencies, or statistics..."
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
        />
        <button 
          onClick={handleChatSubmit} 
          disabled={!chatInput.trim() || chatLoading}
          className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};