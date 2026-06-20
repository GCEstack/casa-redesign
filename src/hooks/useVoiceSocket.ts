import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceState, ChatMessage, ConversationMode } from '@/types';

const VOICE_SERVER_URL = import.meta.env.VITE_VOICE_SERVER_URL || 'ws://localhost:8080/ws/voice';
const VOICE_SERVER_TOKEN = import.meta.env.VITE_VOICE_SERVER_API_KEY || '';

export function useVoiceSocket() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isRecordingRef = useRef(false);
  const maxReconnectAttempts = 5;

  // Initialize AudioContext (must be after user gesture)
  const initAudio = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play audio from PCM Float32Array
  const playAudio = useCallback((pcmData: Float32Array) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const buffer = ctx.createBuffer(1, pcmData.length, 16000);
    // @ts-expect-error - Float32Array type variance in Web Audio API
    buffer.copyToChannel(pcmData, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      if (playbackQueueRef.current.length > 0) {
        const next = playbackQueueRef.current.shift()!;
        playAudio(next);
      } else {
        isPlayingRef.current = false;
      }
    };
    source.start();
  }, []);

  // Queue audio for playback
  const queueAudio = useCallback((pcmData: Float32Array) => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      playAudio(pcmData);
    } else {
      playbackQueueRef.current.push(pcmData);
    }
  }, [playAudio]);

  // Convert ArrayBuffer to Float32Array (16-bit PCM)
  const pcmToFloat32 = useCallback((buffer: ArrayBuffer) => {
    const int16Array = new Int16Array(buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    return float32Array as Float32Array;
  }, []);

  // Connect WebSocket
  const connect = useCallback((deviceId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = new URL(VOICE_SERVER_URL);
    if (deviceId) url.searchParams.set('device_id', deviceId);
    url.searchParams.set('device_type', 'audio');
    if (VOICE_SERVER_TOKEN) url.searchParams.set('token', VOICE_SERVER_TOKEN);

    try {
      const ws = new WebSocket(url.toString());
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[VoiceSocket] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          // JSON message
          try {
            const msg = JSON.parse(event.data);
            handleMessage(msg);
          } catch (e) {
            console.error('[VoiceSocket] Failed to parse message:', e);
          }
        } else if (event.data instanceof ArrayBuffer) {
          // Binary audio data
          const pcmData = pcmToFloat32(event.data);
          queueAudio(pcmData);
        }
      };

      ws.onerror = (e) => {
        console.error('[VoiceSocket] WebSocket error:', e);
        setError('Connection error. Retrying...');
      };

      ws.onclose = () => {
        console.log('[VoiceSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[VoiceSocket] Reconnecting (attempt ${reconnectAttemptsRef.current})...`);
            connect(deviceId);
          }, delay);
        } else {
          setError('Could not connect to voice server. Please try again later.');
          setVoiceState('error');
        }
      };
    } catch (err) {
      console.error('[VoiceSocket] Failed to connect:', err);
      setError('Failed to connect to voice server');
      setVoiceState('error');
    }
  }, [pcmToFloat32, queueAudio]);

  // Handle incoming messages
  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'state_change':
        setVoiceState(msg.state);
        break;

      case 'transcript':
        // User transcript from server
        if (msg.text) {
          addMessage('user', msg.text);
        }
        break;

      case 'assistant_text':
        // Assistant text from server
        if (msg.text) {
          addMessage('character', msg.text);
        }
        break;

      case 'error':
        setError(msg.message || 'An error occurred');
        setVoiceState('error');
        break;

      case 'config_change':
        // Server confirmed config change
        console.log('[VoiceSocket] Config updated:', msg);
        break;

      default:
        console.log('[VoiceSocket] Unknown message type:', msg.type);
    }
  }, []);

  // Add message to chat
  const addMessage = useCallback((role: 'user' | 'character', text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      role,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  // Send command to server
  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', command }));
    }
  }, []);

  // Send config change
  const sendConfig = useCallback((character: string, mode: ConversationMode) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'config_change',
        character,
        mode,
      }));
    }
  }, []);

  // Start listening (begin mic capture)
  const startListening = useCallback(async () => {
    try {
      setError(null);

      // Ensure audio context is ready
      await initAudio();

      // Connect WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
        // Wait a moment for connection
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get mic stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // Set up AudioWorklet for PCM capture
      const ctx = audioContextRef.current!;

      // Inline AudioWorklet processor (avoids separate file)
      const workletCode = `
        class PCMProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input[0]) {
              const int16Data = new Int16Array(input[0].length);
              for (let i = 0; i < input[0].length; i++) {
                int16Data[i] = Math.max(-32768, Math.min(32767, input[0][i] * 32768));
              }
              this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
            }
            return true;
          }
        }
        registerProcessor('pcm-processor', PCMProcessor);
      `;

      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      const source = ctx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(ctx, 'pcm-processor');
      workletNodeRef.current = workletNode;

      // Send PCM data to WebSocket while recording
      isRecordingRef.current = true;
      workletNode.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && isRecordingRef.current) {
          wsRef.current.send(event.data);
        }
      };

      source.connect(workletNode);
      workletNode.connect(ctx.destination);

    } catch (err) {
      console.error('[VoiceSocket] Start listening failed:', err);
      let msg = 'Could not access microphone';
      if (err instanceof DOMException) {
        if (err.name === 'NotFoundError') msg = 'No microphone found. You can still type messages!';
        else if (err.name === 'NotAllowedError') msg = 'Microphone permission denied. Check browser settings.';
        else if (err.name === 'NotReadableError') msg = 'Microphone is busy. Close other apps.';
      }
      setError(msg);
      setVoiceState('error');
    }
  }, [initAudio, connect]);

  // Stop listening
  const stopListening = useCallback(() => {
    isRecordingRef.current = false;

    // Stop mic stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
  }, []);

  // Send text message (for typing fallback)
  const sendTextMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add to local messages immediately
    addMessage('user', trimmed);

    // Send via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text_input', text: trimmed }));
    } else {
      setError('Not connected to voice server. Type again after connecting.');
      setVoiceState('error');
    }
  }, [addMessage]);

  // Interrupt (barge-in)
  const interrupt = useCallback(() => {
    // Stop playback
    playbackQueueRef.current = [];
    isPlayingRef.current = false;

    // Send interrupt
    sendCommand('interrupt');
  }, [sendCommand]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    if (voiceState === 'error') setVoiceState('idle');
  }, [voiceState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (workletNodeRef.current) workletNodeRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    voiceState,
    messages,
    error,
    isConnected,
    startListening,
    stopListening,
    sendTextMessage,
    sendConfig,
    interrupt,
    clearError,
    addMessage,
  };
}
