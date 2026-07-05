import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraStreamOptions {
  onStart?: () => void;
  onStop?: () => void;
}

export function useCameraStream({ onStart, onStop }: UseCameraStreamOptions = {}) {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async (requestedFacingMode?: "user" | "environment") => {
    const mode = requestedFacingMode || facingMode;
    if (onStart) {
      onStart();
    }
    
    // Check if mediaDevices are available (e.g. secure context)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Camera API not supported in this context. Entering simulation mode.");
      setIsSimulated(true);
      setCameraActive(true);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      setStream(mediaStream);
      setCameraActive(true);
      setIsSimulated(false);
    } catch (err) {
      console.warn("Camera access denied or unavailable. Entering simulation/mock mode.", err);
      // Graceful fallback to simulation mode so user can test UI
      setIsSimulated(true);
      setCameraActive(true);
      setStream(null);
    }
  };

  const stopCamera = () => {
    if (onStop) {
      onStop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
    setIsSimulated(false);
  };

  const switchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    await startCamera(newMode);
  };

  // Auto-mount video stream when camera active
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    cameraActive,
    stream,
    facingMode,
    videoRef,
    setVideoRef,
    isSimulated,
    startCamera,
    stopCamera,
    switchCamera,
  };
}
