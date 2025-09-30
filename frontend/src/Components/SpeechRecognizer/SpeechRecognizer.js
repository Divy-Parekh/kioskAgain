// src/Components/SpeechRecognizer/SpeechRecognizer.js
export function createSpeechRecognizer(callbacks) {
  const { onResult, onError, onEnd } = callbacks;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true; // for live text like Google
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript, event.results[0].isFinal);
  };

  recognition.onerror = (event) => {
    onError?.(event);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return recognition;
}
