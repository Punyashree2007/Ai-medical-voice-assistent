'use client';

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

export type ReportData = {
  symptoms: string;
  recommendations: string;
  summary: string;
  user?: string;
  agent?: string;
  duration?: string;
  severity?: string;
  medicationsMentioned?: string;
  [key: string]: any; // optional, catches extra fields
};

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  //report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
  report: ReportData;

};

type messages = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRoll, setCurrentRoll] = useState<string | null>();
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
      setSessionDetail(result.data);
    } catch (err) {
      console.error('Failed to fetch session details:', err);
      toast.error('Failed to fetch session.');
    }
  };

  const StartCall = () => {
    setLoading(true);
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);

    vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

    vapi.on('call-start', () => {
      console.log('Call started');
      setCallStarted(true);
    });

    vapi.on('call-end', () => {
      setCallStarted(false);
      console.log('Call ended');
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcriptType, transcript } = message;
        console.log(`${role}: ${transcript}`);

        if (transcriptType === 'partial') {
          setLiveTranscript(transcript);
          setCurrentRoll(role);
        } else if (transcriptType === 'final') {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript('');
          setCurrentRoll(null);
        }
      }
    });

    vapi.on('speech-start', () => {
      console.log('Assistant speaking...');
      setCurrentRoll('assistant');
    });

    vapi.on('speech-end', () => {
      console.log('Assistant done.');
      setCurrentRoll('user');
    });
  };

  const endCall = async () => {
    const result = await GenerateReport();

    if (vapiInstance) {
      await vapiInstance.stop();
      vapiInstance.off('call-start');
      vapiInstance.off('call-end');
      vapiInstance.off('message');
      vapiInstance.off('speech-start');
      vapiInstance.off('speech-end');
      setVapiInstance(null);
    }

    setCallStarted(false);
    toast.success('Call ended and report generated!');
    router.replace('/dashboard');
  };

  const GenerateReport = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/medical-report', {
        messages,
        sessionDetail,
        sessionId,
      });
      return result.data;
    } catch (err) {
      toast.error('Failed to generate report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="relative min-h-screen flex flex-col items-center justify-start p-5 overflow-hidden bg-gradient-to-br from-purple-800 via-indigo-700 to-pink-700 animate-gradient-x">
    
    {/* Animated particle background */}
    <div className="absolute inset-0 z-0">
      <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent)] animate-pulse-slow"></div>
      <div className="w-full h-full animate-ripple bg-[radial-gradient(circle,rgba(255,255,255,0.02),transparent)]"></div>
    </div>

    <div className="relative z-10 w-full max-w-4xl flex flex-col items-center rounded-3xl p-8 bg-black/30 backdrop-blur-lg border border-purple-500 shadow-lg shadow-purple-500/50 transition-all duration-700">
      
      {/* Top status */}
      <div className="flex justify-between items-center w-full mb-5">
        <h2 className="flex items-center gap-3 px-4 py-2 rounded-lg border border-purple-400 text-white font-semibold shadow-md shadow-purple-500/50">
          <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {callStarted ? 'Connected...' : 'Not Connected'}
        </h2>
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Circular timer ring */}
          <svg className="w-16 h-16">
            <circle
              className="text-purple-400/50"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="28"
              cx="32"
              cy="32"
            />
          </svg>
          <h2 className="absolute text-white font-bold">{callStarted ? '00:00' : '– –'}</h2>
        </div>
      </div>

      {/* Doctor Card */}
      {sessionDetail && (
        <div className="relative flex flex-col items-center gap-4 transform hover:-translate-y-2 hover:scale-105 transition-transform duration-500 3d-card">
          <div className="w-[120px] h-[120px] rounded-full border-4 border-purple-400 shadow-lg shadow-purple-500/50 overflow-hidden animate-floating">
            <Image
              src={sessionDetail?.selectedDoctor?.image}
              alt={sessionDetail?.selectedDoctor?.specialist ?? ''}
              width={120}
              height={120}
              className="object-cover w-full h-full"
            />
          </div>
          <h2 className="text-white text-xl font-bold neon-text">{sessionDetail?.selectedDoctor?.specialist}</h2>
          <p className="text-purple-200">AI Medical Voice Assistant</p>
        </div>
      )}

      {/* Messages & waveform */}
      <div className="mt-8 w-full max-h-64 overflow-y-auto flex flex-col items-center gap-2 px-6 py-3 bg-black/20 rounded-xl border border-purple-400 shadow-inner shadow-purple-500/30">
        {messages?.slice(-4).map((msg, index) => (
          <h2 key={index} className="text-white/80 px-3 py-1 rounded-lg bg-black/40 w-full break-words neon-text">
            {msg.role} : {msg.text}
          </h2>
        ))}

        {liveTranscript && (
          <h2 className="text-lg text-white font-semibold neon-text animate-pulse">
            {currentRoll} : {liveTranscript}
          </h2>
        )}

        {/* Typing dots */}
        {callStarted && !liveTranscript && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-delay"></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-delay200"></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-delay400"></span>
          </div>
        )}

        {/* Voice waveform */}
        {callStarted && (
          <div className="w-full mt-3 h-8 relative">
            <div className="absolute bottom-0 w-full h-full flex justify-between items-end animate-wave">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 bg-purple-400 rounded-full h-4 animate-wave-delay"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Buttons */}
      <div className="mt-8 flex gap-6 items-center">
        {!callStarted ? (
          <Button
            className="relative p-5 rounded-full bg-purple-600 shadow-lg shadow-purple-500/70 hover:scale-110 transform transition-transform duration-500 neon-button animate-pulse"
            onClick={StartCall}
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin text-white" /> : <PhoneCall className="text-white w-6 h-6" />}
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="relative p-5 rounded-full shadow-lg shadow-red-500/70 hover:scale-110 transform transition-transform duration-500 neon-button animate-pulse"
            onClick={endCall}
          >
            <PhoneOff className="text-white w-6 h-6" />
          </Button>
        )}
      </div>
    </div>

    {/* Tailwind keyframes & animation (add in globals.css) */}
    <style jsx>{`
      @keyframes gradient-x {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-gradient-x { animation: gradient-x 10s ease infinite; background-size: 200% 200%; }

      @keyframes ripple { 0% { transform: scale(0.9); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 0.6; } 100% { transform: scale(0.9); opacity: 0.4; } }
      .animate-ripple { animation: ripple 6s infinite; }

      @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      .animate-pulse-slow { animation: pulse-slow 12s infinite; }

      @keyframes bounce-delay { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      .animate-bounce-delay { animation: bounce-delay 1.4s infinite; }
      .animate-bounce-delay200 { animation: bounce-delay 1.4s infinite 0.2s; }
      .animate-bounce-delay400 { animation: bounce-delay 1.4s infinite 0.4s; }

      @keyframes wave { 0%, 100% { height: 4px; } 50% { height: 20px; } }
      .animate-wave > div { animation: wave 1.2s ease-in-out infinite alternate; }
      .animate-wave-delay { animation: wave 1.2s ease-in-out infinite alternate; }

      .neon-text { text-shadow: 0 0 5px #9d00ff, 0 0 10px #7b00ff, 0 0 20px #5c00ff; }
      .neon-button { box-shadow: 0 0 10px #7b00ff, 0 0 20px #9d00ff, 0 0 30px #c700ff; }
      .animate-floating { animation: floating 6s ease-in-out infinite; }
      @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    `}</style>
  </div>
);


}

export default MedicalVoiceAgent;
