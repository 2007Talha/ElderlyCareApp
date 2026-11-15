'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { VOICE_COMMANDS } from '@/config/constants';

interface VoiceCommandBarProps {
  readonly onCommand: (command: string) => void;
}

/** Voice-first command bar for elderly users using Web Speech API. */
export default function VoiceCommandBar({ onCommand }: VoiceCommandBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    const SpeechRecognition = (
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    ) as typeof window.SpeechRecognition | undefined;

    if (!SpeechRecognition) {
      setTranscript('Voice not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      onCommand(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('Could not understand. Please try again.');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [onCommand]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-accent" aria-hidden="true" />
          Voice Commands
        </h3>
        <button
          onClick={startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isListening
              ? 'bg-danger text-white animate-pulse'
              : 'bg-accent hover:bg-blue-600 text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Listening...' : 'Speak'}
        </button>
      </div>

      {transcript && (
        <p className="text-sm text-gray-300 mb-3 italic" aria-live="polite">
          &ldquo;{transcript}&rdquo;
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {VOICE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              onCommand(cmd);
              speakText(cmd);
            }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
