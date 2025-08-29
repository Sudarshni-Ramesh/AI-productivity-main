import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperPlane, FaInfoCircle, FaStop } from 'react-icons/fa';
import './Chat.css';
import { Message } from 'ai';
import { aiServiceAPI } from '../Ai/Ai';
import useAppStore from '../state-utils/state-management';

interface ExtendedMessage extends Message {
  steps?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showSteps, setShowSteps] = useState<number | null>(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { incrementDataVersion, lastAiSteps, setLastAiSteps } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioData, setAudioData] = useState<number[]>(new Array(10).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adjust the height of the textarea
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 500; // Match the max-height in CSS
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Handle sending a message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setIsAiTyping(true);
    const userMessage: ExtendedMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await aiServiceAPI.getAIResponse(newMessages);
      console.log("ai response", response)
      const reader = response.body?.getReader();
      let result = '';

      // Add an initial AI message
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '', steps: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const content = chunk.split('\n')
          .filter(line => line.startsWith('0:'))
          .map(line => line.slice(3).replace(/^"|"$/g, ''))
          .join('');

        result += content.replace(/\\n/g, '\n').replace(/\n/g, '\n');

        // Update the AI's message in real-time as chunks arrive
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { role: 'assistant', content: result, steps: '' }
        ]);
      }

      // Update steps for the last message after processing is complete
    //   updateStepsTaken("Step 1: Analyzed user input\nStep 2: Generated response\nStep 3: Formatted output");
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setIsAiTyping(false);
      incrementDataVersion();
    }
  };

  const toggleSteps = (index: number) => {
    setShowSteps(prevState => prevState === index ? null : index);
  };

  const updateStepsTaken = (steps: string) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.steps = steps;
      }
      return newMessages;
    });
  };

  useEffect(() => {
    console.log("lastAiSteps", lastAiSteps)
    if (lastAiSteps && lastAiSteps !== null) {
      updateStepsTaken(lastAiSteps);
      setLastAiSteps(null); // Reset lastAiSteps after updating
    }
  }, [lastAiSteps]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        await transcribeAndSetInput(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualizeAudio();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const audioData = Array.from(dataArray.slice(0, 10)).map(value => value / 255);
    setAudioData(audioData);

    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  const transcribeAndSetInput = async (blob: Blob) => {
    console.log("transcribeAndSetInput")
    try {
      const transcription = await aiServiceAPI.transcribeAudio(blob);
      setInput(transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const submitAudio = async () => {
    console.log("submitAudio")
    if (!audioBlob) return;

    setIsLoading(true);
    setIsAiTyping(true);

    try {
      // First, transcribe the audio
      const transcription = await aiServiceAPI.transcribeAudio(audioBlob);

      // Add the transcription as a user message
      const userMessage: ExtendedMessage = { role: 'user', content: transcription };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Now, get AI response for the transcription
      const response = await aiServiceAPI.getAIResponse([...messages, userMessage]);

      // Process the response similar to text submissions
      const reader = response.body?.getReader();
      let result = '';

      // Add an initial AI message
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '', steps: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const content = chunk.split('\n')
          .filter(line => line.startsWith('0:'))
          .map(line => line.slice(3).replace(/^"|"$/g, ''))
          .join('');

        result += content.replace(/\\n/g, '\n').replace(/\n/g, '\n');

        // Update the AI's message in real-time as chunks arrive
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { role: 'assistant', content: result, steps: '' }
        ]);
      }

    } catch (error) {
      console.error('Error submitting audio:', error);
    } finally {
      setIsLoading(false);
      setIsAiTyping(false);
      setAudioBlob(null);
      incrementDataVersion();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-container">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === 'user' ? 'user-message' : 'ai-message'
              }`}
            >
              {message.content}
              {message.role === 'assistant' && (
                <FaInfoCircle
                  className="info-icon"
                  onClick={() => toggleSteps(index)}
                  title="Show steps taken"
                />
              )}
              {showSteps === index && message.role === 'assistant' && (
                <div className="steps-taken">
                  <h4>Steps taken:</h4>
                  <p>{message.steps || 'No steps recorded.'}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="chat-search-container">
        {!isRecording ? (
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message or click mic"
            rows={1}
            disabled={isLoading}
          />
        ) : (
          <div className="audio-visualizer-container">
            <div className="audio-visualizer">
              {audioData.map((value, index) => (
                <div 
                  key={index} 
                  className="audio-bar" 
                  style={{ height: `${value * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}
        <button 
          className={`chat-mic-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
        <button 
          className="chat-send-button" 
          onClick={handleSubmit}
          disabled={isLoading || isRecording || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
