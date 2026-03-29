import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Droplet,
  Wind,
  Brain,
  ArrowRight,
  Heart,
  Gamepad2,
  Snowflake,
  Eye,
  Quote,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  CheckCircle2,
  Video,
} from "lucide-react";
import Mascot from "./components/Mascot";
import { startCopingSession, updateCopingProgress, completeCopingSession } from "./api/coping.api";

// --- DATA ARRAYS FOR RANDOMIZATION ---
const EMOTIONAL_VIDEOS = [
  "https://www.youtube.com/embed/I3W5EVzlQm0?autoplay=1&loop=1&playlist=I3W5EVzlQm0&controls=0",
  "https://www.youtube.com/embed/-ch4NqzdhA8?autoplay=1&loop=1&playlist=-ch4NqzdhA8&controls=0",
  "https://www.youtube.com/embed/dVHjZFU7VRg?autoplay=1&loop=1&playlist=dVHjZFU7VRg&controls=0",
];

const MOTIVATIONAL_VIDEOS = [
  "https://www.youtube.com/embed/nHS1uJeYGFM?autoplay=1&loop=1&playlist=nHS1uJeYGFM&controls=0",
  "https://www.youtube.com/embed/-m_sgiO0fHM?autoplay=1&loop=1&playlist=-m_sgiO0fHM&controls=0",
  "https://www.youtube.com/embed/gARdaMGnBjs?autoplay=1&loop=1&playlist=gARdaMGnBjs&controls=0",
];

const QUOTES = [
  "Your track record for surviving bad days is exactly 100%. Don't give up now.",
  "Every time you resist a craving, you are literally rewiring your brain.",
  "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I will try again.'",
  "You are not your thoughts. You are the observer of your thoughts.",
  "Fall seven times, stand up eight. You've got this.",
  "Discipline is choosing between what you want now, and what you want most.",
];

const AFFIRMATIONS = [
  "I am incredibly proud of you! 🎉",
  "You are getting stronger every single day! 💪",
  "Amazing job surfing that urge! 🌊",
  "You chose your future over a temporary feeling! ✨",
  "Victory! You are taking your life back! 🏆",
  "You did the hard thing, and you won! 🥳",
];

// --- STEP 4 GUIDED ACTIVITIES DATA ---
const COPING_ACTIVITIES = [
  {
    id: 1,
    title: "Ice Dive Reflex",
    icon: Snowflake,
    description:
      "Splash cold water on your face. This activates the mammalian dive reflex, instantly slowing your heart rate.",
    spokenText:
      "Let's reset your nervous system. Go splash some freezing cold water on your face right now. I know it sounds intense, but it instantly drops your heart rate and kills the craving. You can do this!",
  },
  {
    id: 2,
    title: "Visual Distraction",
    icon: Gamepad2,
    description:
      "Play a highly visual game like Tetris. This disrupts the visual imagery of the craving in your brain.",
    spokenText:
      "Time for a distraction! Play Tetris or a fast-paced game on your phone for the next two minutes. Focus completely on the shapes and colors. Show that craving who is boss!",
  },
  {
    id: 3,
    title: "Sensory Shock",
    icon: Brain,
    description:
      "Chew strong mint gum or bite a lemon. The intense flavor shocks your sensory system and derails the urge.",
    spokenText:
      "Grab some strong mint gum, a sour candy, or even a lemon. The intense flavor will shock your senses and snap your brain out of the urge loop. Go grab it now, I'll wait right here!",
  },
  {
    id: 4,
    title: "5-4-3-2-1 Grounding",
    icon: Eye,
    description:
      "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.",
    spokenText:
      "Let's ground ourselves in the present moment. Look around and say out loud: 5 things you can see, 4 things you can feel, 3 you can hear, 2 you can smell, and 1 you can taste. Stay with me, you are safe.",
  },
  {
    id: 5,
    title: "Power Hydration",
    icon: Droplet,
    description:
      "Drink a large glass of cold water quickly. This activates your parasympathetic nervous system.",
    spokenText:
      "Go chug a massive glass of cold water. Dehydration makes anxiety and cravings feel so much worse. Drink it down, take a deep breath, and feel the control returning to your body. I'm so proud of you.",
  },
];

export default function CopingNow({ onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [sessionId, setSessionId] = useState(null);

  // ** REPLACE THIS WITH YOUR BEYOND PRESENCE SHARE LINK **
  const BEYOND_PRESENCE_URL =
    "https://bey.chat/f415a1a8-9e10-487e-bc81-23ec74ff80b4";
  const [isIframeActive, setIsIframeActive] = useState(false);

  // Random Data States
  const [randomData, setRandomData] = useState({
    emotional: "",
    motivational: "",
    quote: "",
    affirmation: "",
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // State for Step 3: Breathing
  const [breathePhase, setBreathePhase] = useState("Inhale...");
  const [breathTimer, setBreathTimer] = useState(30);
  const audioRef = useRef(null);

  // --- State for Step 4: Guided Activities ---
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activityTimeLeft, setActivityTimeLeft] = useState(120); // 2 minutes per activity
  const [isActivityActive, setIsActivityActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const sessionStartedRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize Random Data & Window Size on mount + start backend session
  useEffect(() => {
    setRandomData({
      emotional:
        EMOTIONAL_VIDEOS[Math.floor(Math.random() * EMOTIONAL_VIDEOS.length)],
      motivational:
        MOTIVATIONAL_VIDEOS[
          Math.floor(Math.random() * MOTIVATIONAL_VIDEOS.length)
        ],
      quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
      affirmation:
        AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
    });

    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      startCopingSession({ cravingLevel: 7, mood: 'anxious' })
        .then(res => { if (res.data?.sessionId) setSessionId(res.data.sessionId); })
        .catch(() => {});
    }

    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track session progress on step changes
  useEffect(() => {
    if (!sessionId || step <= 1) return;
    updateCopingProgress(sessionId, step).catch(() => {});
    if (step === 7) {
      completeCopingSession(sessionId, { cravingAfter: 2, helpful: true }).catch(() => {});
    }
  }, [step, sessionId]);

  // --- Step 3 Logic ---
  useEffect(() => {
    let phaseInterval;
    let countdownInterval;

    if (step === 3) {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current
          .play()
          .catch((e) => console.log("Audio autoplay blocked", e));
      }
      phaseInterval = setInterval(() => {
        setBreathePhase((prev) =>
          prev === "Inhale..." ? "Exhale..." : "Inhale...",
        );
      }, 4000);

      countdownInterval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setStep(4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (audioRef.current) audioRef.current.pause();
    }

    return () => {
      clearInterval(phaseInterval);
      clearInterval(countdownInterval);
    };
  }, [step]);

  // --- Step 4 Logic: Speech Synthesis & Timer ---
  useEffect(() => {
    // Handle the TTS Voice
    const speakActivity = () => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel(); // Stop any current speech

      if (step === 4 && !isMuted) {
        setIsSpeaking(true);
        const text = COPING_ACTIVITIES[currentActivityIndex].spokenText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower, calming pace
        utterance.pitch = 1.1; // Friendly pitch

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    };

    speakActivity();

    // Cleanup speech if step changes or unmounts
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [step, currentActivityIndex, isMuted]);

  const handleNextActivity = useCallback(() => {
    if (currentActivityIndex < COPING_ACTIVITIES.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
      setActivityTimeLeft(120);
      setIsActivityActive(true);
    }
  }, [currentActivityIndex]);

  const handlePrevActivity = useCallback(() => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex((prev) => prev - 1);
      setActivityTimeLeft(120);
      setIsActivityActive(true);
    }
  }, [currentActivityIndex]);

  // Step 4 Timer
  useEffect(() => {
    let interval;
    if (step === 4 && isActivityActive && activityTimeLeft > 0) {
      interval = setInterval(
        () => setActivityTimeLeft((prev) => prev - 1),
        1000,
      );
    } else if (activityTimeLeft === 0 && isActivityActive) {
      // Auto-advance to next activity when timer hits 0
      if (currentActivityIndex < COPING_ACTIVITIES.length - 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleNextActivity();
      } else {
        setStep(5); // Move to AI Support instead of resolution
      }
    }
    return () => clearInterval(interval);
  }, [
    step,
    isActivityActive,
    activityTimeLeft,
    currentActivityIndex,
    handleNextActivity,
  ]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && "speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop speaking immediately if muted
      setIsSpeaking(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!randomData.emotional) return null; // Wait for random data to mount

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white flex flex-col font-sans"
    >
      {/* Universal Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <button
          onClick={() => {
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="pointer-events-auto w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        <span className="bg-white px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-md tracking-widest uppercase border border-gray-100">
          Stage {step} / {totalSteps}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* --- SCREEN 1: Emotional Anchor --- */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-gray-900 relative flex flex-col items-center justify-center pt-16 pb-24 px-6"
          >
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-[40px] p-1.5 bg-gradient-to-br from-[#7D9C6D] via-orange-400 to-[#D9ECA2] shadow-2xl shrink-0">
              <div className="absolute top-6 -left-4 bg-white px-4 py-1 rounded-full shadow-lg font-bold text-[#7D9C6D] text-sm rotate-[-5deg] z-20 flex items-center gap-1">
                <Heart size={14} /> Family
              </div>
              <div className="w-full h-full rounded-[32px] overflow-hidden relative bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={randomData.emotional}
                  title="Emotional Anchor Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 pointer-events-none">
                  <Mascot
                    emotion="supportive"
                    context="coping"
                    size={96}
                    className="mb-6"
                  />
                  <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Remember your "Why"
                  </h2>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 w-full px-6 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="w-full max-w-sm py-4 bg-white text-[#7D9C6D] rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(255,255,255,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 2: YouTube Motivation --- */}
        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-[#f8fcf4] relative flex flex-col items-center pt-24 pb-24 px-6"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
              Take a moment to reset.
            </h2>
            <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 relative border-4 border-white shrink-0 max-h-[50vh]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={randomData.motivational}
                title="Motivational Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#D9ECA2] w-full max-w-sm relative mt-auto">
              <div className="absolute -top-4 -left-2 text-[#7D9C6D] bg-[#D9ECA2] w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <Quote size={20} fill="currentColor" />
              </div>
              <p className="text-gray-700 font-bold text-base leading-relaxed italic text-center mt-2">
                "{randomData.quote}"
              </p>
            </div>
            <div className="absolute bottom-8 w-full px-6 flex justify-center">
              <button
                onClick={() => setStep(3)}
                className="w-full max-w-sm py-4 bg-[#7D9C6D] text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(125,156,109,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Next: Guided Breathing
              </button>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 3: Stabilization --- */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-gradient-to-b from-[#D9ECA2] to-white flex flex-col items-center justify-center relative overflow-hidden"
          >
            <audio
              ref={audioRef}
              loop
              src="https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-ambience-39.mp3"
            />
            <h2 className="text-2xl font-extrabold text-[#7D9C6D] mb-12 relative z-20 text-center px-4">
              Let's regulate your nervous system.
            </h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: breathePhase === "Inhale..." ? 1.5 : 0.8,
                  opacity: breathePhase === "Inhale..." ? 0.3 : 0.6,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#7D9C6D] rounded-full"
              />
              <motion.div
                animate={{ scale: breathePhase === "Inhale..." ? 1.2 : 0.9 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-4 bg-[#D9ECA2] rounded-full opacity-80"
              />
              <motion.div
                style={{ scale: breathePhase === "Inhale..." ? 1.1 : 0.9 }}
                className="relative z-20 transition-transform duration-[4000ms] ease-in-out"
              >
                <Mascot emotion="supportive" context="coping" size={128} />
              </motion.div>
            </div>
            <motion.h1
              key={breathePhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-4xl font-extrabold text-gray-800 mt-16 h-12"
            >
              {breathePhase}
            </motion.h1>
            <div className="absolute bottom-20 flex flex-col items-center">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                Auto-advancing in
              </div>
              <div className="text-3xl font-black text-[#7D9C6D] bg-white px-6 py-2 rounded-2xl shadow-sm border border-[#D9ECA2]">
                00:{breathTimer.toString().padStart(2, "0")}
              </div>
            </div>
            <button
              onClick={() => setStep(4)}
              className="absolute bottom-6 text-gray-400 font-bold text-sm underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Skip breathing
            </button>
          </motion.div>
        )}

        {/* --- SCREEN 4: Guided Activity Sequence --- */}
        {step === 4 &&
          (() => {
            const currentActivity = COPING_ACTIVITIES[currentActivityIndex];
            const ActivityIcon = currentActivity.icon;

            return (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 bg-[#FAFAFA] flex flex-col hide-scrollbar overflow-y-auto"
              >
                {/* TOP HALF: Mascot & Speech */}
                <div className="bg-gradient-to-b from-[#D9ECA2] to-[#FAFAFA] pt-24 pb-8 px-6 flex flex-col items-center justify-center relative">
                  <button
                    onClick={toggleMute}
                    className="absolute top-24 right-6 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#7D9C6D] shadow-sm hover:bg-white/80 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>

                  <div className="relative mb-6">
                    <Mascot
                      emotion={isSpeaking ? "thinking" : "supportive"}
                      context="coping"
                      size={128}
                    />
                    {isSpeaking && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xl shadow-md"
                      >
                        💬
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-white/50 relative max-w-sm w-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-l border-t border-white/50"></div>
                    <p className="text-gray-700 font-medium text-center relative z-10 leading-relaxed">
                      {currentActivity.spokenText}
                    </p>
                  </div>
                </div>

                {/* BOTTOM HALF: Timer & Controls */}
                <div className="flex-1 px-6 pb-24 flex flex-col items-center">
                  <div className="flex gap-2 mb-8">
                    {COPING_ACTIVITIES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${i === currentActivityIndex ? "w-8 bg-[#7D9C6D]" : i < currentActivityIndex ? "w-2 bg-[#D9ECA2]" : "w-2 bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentActivity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-lg border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
                    >
                      <ActivityIcon
                        size={120}
                        className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 pointer-events-none"
                      />

                      <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4 relative z-10">
                        <ActivityIcon size={32} />
                      </div>

                      <h2 className="text-xl font-extrabold text-gray-800 mb-2 relative z-10">
                        {currentActivity.title}
                      </h2>
                      <p className="text-sm text-gray-500 mb-8 relative z-10">
                        {currentActivity.description}
                      </p>

                      <div className="text-6xl font-black text-[#7D9C6D] mb-8 font-mono tracking-tighter relative z-10 drop-shadow-sm">
                        {formatTime(activityTimeLeft)}
                      </div>

                      <div className="flex items-center gap-6 relative z-10">
                        <button
                          onClick={handlePrevActivity}
                          disabled={currentActivityIndex === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        >
                          <SkipBack size={28} />
                        </button>

                        <button
                          onClick={() => setIsActivityActive(!isActivityActive)}
                          className="w-16 h-16 rounded-full bg-[#D9ECA2] text-[#7D9C6D] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          {isActivityActive ? (
                            <Pause size={28} />
                          ) : (
                            <Play size={28} className="ml-1" />
                          )}
                        </button>

                        <button
                          onClick={handleNextActivity}
                          disabled={
                            currentActivityIndex ===
                            COPING_ACTIVITIES.length - 1
                          }
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        >
                          <SkipForward size={28} />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Finish Early Button */}
                <div className="fixed bottom-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 flex justify-center">
                  <button
                    onClick={() => {
                      if ("speechSynthesis" in window)
                        window.speechSynthesis.cancel();
                      setStep(5);
                    }}
                    className="w-full max-w-sm py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg"
                  >
                    <CheckCircle2 size={20} /> I feel better now
                  </button>
                </div>
              </motion.div>
            );
          })()}

        {/* --- NEW SCREEN 5: Embed Iframe for Beyond Presence --- */}
        {step === 5 && (
          <motion.div
            key="s5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 bg-[#FAFAFA] flex flex-col items-center justify-center pt-20 pb-6 px-4 relative"
          >
            {!isIframeActive ? (
              // The "Choice" Screen before opening the call
              <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-[#D9ECA2] rounded-[32px] flex items-center justify-center mb-6 shadow-md rotate-3">
                  <Video size={40} className="text-[#7D9C6D]" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
                  Live Mentor Support
                </h2>
                <p className="text-gray-500 font-medium mb-10 px-4">
                  Do you want to talk it out? Connect with your AI mentor
                  face-to-face to work through the rest of this craving.
                </p>

                <button
                  onClick={() => setIsIframeActive(true)}
                  className="w-full py-4 bg-[#7D9C6D] text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(125,156,109,0.3)] hover:scale-[1.02] active:scale-95 transition-all mb-4"
                >
                  Yes, Connect Me
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="w-full py-4 bg-white text-gray-500 rounded-2xl font-bold text-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  No thanks, skip to check-in
                </button>
              </div>
            ) : (
              // The active Iframe container
              <div className="w-full h-full max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                <div className="bg-gray-900 px-4 py-3 flex justify-between items-center text-white">
                  <span className="font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>{" "}
                    Live Session
                  </span>
                </div>

                <iframe
                  src={BEYOND_PRESENCE_URL}
                  allow="microphone; camera"
                  className="flex-1 w-full border-none"
                  title="Beyond Presence Mentor"
                />

                <div className="bg-gray-900 p-4 flex justify-center">
                  <button
                    onClick={() => {
                      setIsIframeActive(false);
                      setStep(6);
                    }}
                    className="py-3 px-8 bg-white text-gray-900 font-bold rounded-xl shadow-md hover:bg-gray-100 active:scale-95 transition-transform"
                  >
                    End Call & Continue
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* --- SCREEN 6: Resolution & Feedback --- */}
        {step === 6 && (
          <motion.div
            key="s6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center relative"
          >
            <Mascot
              emotion="thinking"
              context="coping"
              size={128}
              className="mb-8"
            />
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
              Check-in time.
            </h1>
            <p className="text-gray-500 font-medium mb-10 px-4">
              Reflecting on what works helps your brain build stronger habits
              for next time.
            </p>

            <div className="w-full bg-[#f8fcf4] p-6 rounded-[32px] border border-[#D9ECA2]">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                What helped you the most?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "The Video",
                  "Deep Breathing",
                  "Playing Tetris",
                  "Cold Water",
                  "Mentor Call",
                  "Other",
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setStep(7)}
                    className="p-3 bg-white shadow-sm rounded-2xl text-sm font-bold text-gray-600 hover:bg-[#7D9C6D] hover:text-white transition-all active:scale-95 border border-gray-100"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 7: Final Celebration w/ Real Confetti --- */}
        {step === 7 && (
          <motion.div
            key="s7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-gradient-to-b from-[#D9ECA2] to-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            {/* Real React Confetti */}
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={400}
              gravity={0.15}
              colors={[
                "#7D9C6D",
                "#D9ECA2",
                "#F3D79C",
                "#B25349",
                "#FFFFFF",
                "#f97316",
              ]}
            />

            <div className="relative z-20 flex flex-col items-center">
              <Mascot
                emotion="excited"
                context="coping"
                size={192}
                className="mb-8"
              />
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
                You did it! 🎊
              </h1>
              <p className="text-gray-700 font-bold text-xl mb-2 px-2">
                {randomData.affirmation}
              </p>
              <p className="text-gray-500 font-medium px-4 mb-12">
                Every time you surf an urge, your recovery muscles get stronger.
              </p>

              <button
                onClick={onClose}
                className="w-full max-w-xs py-5 bg-[#7D9C6D] text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgb(125,156,109,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Return to Dashboard <Heart size={20} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
