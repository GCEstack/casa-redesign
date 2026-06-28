import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceState } from '@/types';

const HTTP_BASE = import.meta.env.VITE_BACKEND_HTTP_URL || 'https://casa-voice-agent.fly.dev';
const WS_BASE = import.meta.env.VITE_VOICE_SERVER_URL || 'wss://casa-voice-agent.fly.dev/ws/voice';

interface PairingResponse {
  code: string;
  session_id: string;
  join_token: string;
  character: string;
  mode: string;
  expires_at: string;
}

export function usePairingVoice() {
  const [connectionState, setConnectionState] = useState<'idle' | 'fetching' | 'connecting' | 'connected' | 'error'>('idle');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletLoadedRef = useRef(false);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const playPcm = useCallback((pcmData: Float32Array) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const buffer = ctx.createBuffer(1, pcmData.length, 16000);
    buffer.copyToChannel(pcmData as Float32Array<ArrayBuffer>, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      if (playbackQueueRef.current.length > 0) {
        playPcm(playbackQueueRef.current.shift()!);
      } else {
        isPlayingRef.current = false;
      }
    };
    source.start();
  }, []);

  const queuePcm = useCallback((pcmData: Float32Array) => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      playPcm(pcmData);
    } else {
      playbackQueueRef.current.push(pcmData);
    }
  }, [playPcm]);

  const pcmToFloat32 = useCallback((buffer: ArrayBuffer) => {
    const int16 = new Int16Array(buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    return float32;
  }, []);

  const stop = useCallback(() => {
    if (mediaStreamSourceRef.current) {
      try { mediaStreamSourceRef.current.disconnect(); } catch { /* ignore */ }
      mediaStreamSourceRef.current = null;
    }
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.disconnect();
        workletNodeRef.current.port.onmessage = null;
      } catch { /* ignore */ }
      workletNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState('idle');
    setVoiceState('idle');
  }, []);

  const start = useCallback(async (code: string) => {
    if (connectionState !== 'idle') return;
    setConnectionState('fetching');
    setError(null);

    let pairing: PairingResponse;
    try {
      const res = await fetch(`${HTTP_BASE}/api/pairing/${code.trim().toUpperCase()}`);
      if (!res.ok) throw new Error(`Pairing not found (${res.status})`);
      pairing = await res.json();
    } catch (e) {
      setConnectionState('error');
      setError(e instanceof Error ? e.message : 'Failed to fetch pairing');
      return;
    }

    const deviceId = crypto.randomUUID();
    const wsUrl = WS_BASE.replace(/\/ws\/voice$/, `/ws/voice/realtime/${deviceId}`);
    const url = new URL(wsUrl);
    url.searchParams.set('device_type', 'audio');
    url.searchParams.set('session_id', pairing.session_id);
    url.searchParams.set('device_id', deviceId);
    url.searchParams.set('token', pairing.join_token);
    url.searchParams.set('character', pairing.character);
    url.searchParams.set('mode', pairing.mode);

    setConnectionState('connecting');
    const ws = new WebSocket(url.toString());
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = async () => {
      setConnectionState('connected');
      try {
        audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        const ctx = audioCtxRef.current;

        if (!workletLoadedRef.current) {
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
          try {
            await ctx.audioWorklet.addModule(workletUrl);
          } catch { /* already registered */ }
          URL.revokeObjectURL(workletUrl);
          workletLoadedRef.current = true;
        }

        const source = ctx.createMediaStreamSource(stream);
        mediaStreamSourceRef.current = source;
        const workletNode = new AudioWorkletNode(ctx, 'pcm-processor');
        workletNodeRef.current = workletNode;
        workletNode.port.onmessage = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        source.connect(workletNode);
      } catch (e) {
        setError('Microphone access failed');
        setConnectionState('error');
      }
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        queuePcm(pcmToFloat32(event.data));
      } else {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'state_change') setVoiceState(msg.state);
          if (msg.type === 'transcript' && msg.text) setTranscript(msg.text);
          if (msg.type === 'error') setError(msg.message || 'Voice error');
        } catch { /* ignore */ }
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
      setError('Connection error');
    };

    ws.onclose = () => {
      stop();
    };
  }, [connectionState, pcmToFloat32, queuePcm, stop]);

  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stop]);

  return { connectionState, voiceState, error, transcript, start, stop };
}
