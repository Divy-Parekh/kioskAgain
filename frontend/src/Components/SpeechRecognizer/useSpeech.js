// src/Components/SpeechRecognizer/useSpeech.js
import { useState, useRef } from "react";
import { createSpeechRecognizer } from "./SpeechRecognizer";

export default function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startListening = (onFinalTranscript) => {
    const recognition = createSpeechRecognizer({
      onResult: (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal) {
          onFinalTranscript(transcript);
          setIsListening(false);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return { isListening, liveTranscript, startListening, stopListening };
}
