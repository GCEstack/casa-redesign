import { useState, useCallback, useRef } from 'react';
import type { VoiceState, ChatMessage } from '@/types';

export function useVoiceChat() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addMessage = useCallback((role: 'user' | 'character', text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      role,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setVoiceState('listening');
      setCurrentTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);

      // Simulate transcript for demo
      setTimeout(() => {
        setCurrentTranscript('Listening...');
      }, 500);

    } catch (err) {
      console.error('Mic error:', err);
      let msg = 'Could not access microphone';
      if (err instanceof DOMException) {
        if (err.name === 'NotFoundError') msg = 'No microphone found. You can still type messages!';
        else if (err.name === 'NotAllowedError') msg = 'Microphone permission denied. Please allow access in Settings.';
        else if (err.name === 'NotReadableError') msg = 'Microphone is busy. Close other apps and try again.';
      }
      setError(msg);
      setVoiceState('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setVoiceState('processing');
    setCurrentTranscript('');

    // Simulate processing then response
    setTimeout(() => {
      setVoiceState('speaking');
      setTimeout(() => {
        setVoiceState('idle');
      }, 3000);
    }, 1500);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    addMessage('user', text.trim());
    setVoiceState('processing');

    // Simulate AI response
    setTimeout(() => {
      setVoiceState('speaking');
      addMessage('character', `That's wonderful! Tell me more about that!`);
      setTimeout(() => {
        setVoiceState('idle');
      }, 2000);
    }, 1000);
  }, [addMessage]);

  const clearError = useCallback(() => {
    setError(null);
    if (voiceState === 'error') setVoiceState('idle');
  }, [voiceState]);

  return {
    voiceState,
    messages,
    error,
    currentTranscript,
    startListening,
    stopListening,
    sendTextMessage,
    addMessage,
    clearError,
  };
}
