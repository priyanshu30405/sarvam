import { useCallback, useEffect, useRef, useState } from "react";

interface AudioInputPanelProps {
  onTranscript: (text: string) => void;
  disabled: boolean;
}

export default function AudioInputPanel({ onTranscript, disabled }: AudioInputPanelProps) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string>("Ready to record");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopTracks = useCallback(() => {
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => () => stopTracks(), [stopTracks]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const seconds = Math.max(1, Math.round(blob.size / 4000));
        const transcript = `[Audio recorded ~${seconds}s — simulated transcript for demo]`;
        onTranscript(transcript);
        setStatus(`Recorded ${seconds}s of audio. Transcript ready.`);
        stopTracks();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setStatus("Recording… click Stop when finished.");
    } catch {
      setError("Microphone access denied or unavailable.");
      setStatus("Microphone unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <div className="input-panel audio-panel">
      <p id="audio-hint" className="field-hint">
        Record a short clip. Audio mode sends a simulated transcript to the streaming endpoint.
      </p>
      <div className="audio-controls" role="group" aria-label="Audio recording controls">
        <button
          type="button"
          className="btn secondary"
          onClick={startRecording}
          disabled={disabled || recording}
          aria-describedby="audio-hint"
        >
          Start recording
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={stopRecording}
          disabled={disabled || !recording}
        >
          Stop
        </button>
      </div>
      <p className="audio-status" aria-live="polite">
        {error ?? status}
      </p>
    </div>
  );
}
