import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Beer, Cigarette, Pill, Smartphone, Candy, Plus,
  Clock, Sun, Sunrise, Moon, Zap, Sunset,
  Frown, CloudRain, Angry, Coffee, Users,
  Heart, Activity, PiggyBank, Brain, Leaf,
  Camera, Phone, CheckCircle2, Star,
  Home, AlertCircle, Swords, Wind, Droplet, Check, ChevronDown ,ChevronRight
} from 'lucide-react';

// --- EXTERNAL COMPONENTS ---
import RecoveryJourney from './RecoveryJourney';
import Challenges from './Challenges';
import Community from './Community';
import CopingNow from './CopingNow';
import DietPlan from './DietPlan';
import Mascot from './components/Mascot';
import ProfileSidebar from './components/ProfileSidebar';
import useGamification from './hooks/useGamification';
import { useAuth } from './context/AuthContext';
import { saveOnboarding } from './api/auth.api';
import { getDashboardToday, toggleTask as apiToggleTask, getChartData, logCraving, logMood } from './api/dashboard.api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcquaintanceDashboard from './pages/AcquaintanceDashboard';

const DASHBOARD_ROUTE = '/';
const DIET_ROUTE = '/diet';

const getAppRoute = () => (window.location.pathname === DIET_ROUTE ? DIET_ROUTE : DASHBOARD_ROUTE);

const navigateToPath = (path, replace = false) => {
  if (window.location.pathname === path) {
    return;
  }

  const navigationMethod = replace ? 'replaceState' : 'pushState';
  window.history[navigationMethod]({}, '', path);
};

// --- REUSABLE UI COMPONENTS ---
const FadeIn = ({ children }) => <div className="animate-[fadeIn_0.5s_ease-out] w-full h-full flex flex-col">{children}</div>;

const Button = ({ children, onClick, className = "", icon: Icon }) => (
  <button onClick={onClick} className={`w-full py-4 rounded-2xl font-bold text-lg text-white bg-[#7D9C6D] hover:bg-[#6b865d] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${className}`}>
    {children}
    {Icon && <Icon size={20} />}
  </button>
);

const ProgressBar = ({ step, total = 5 }) => (
  <div className="w-full px-6 pt-12 pb-4">
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-orange-400 transition-all duration-500 ease-out" style={{ width: `${(step / total) * 100}%` }}></div>
    </div>
  </div>
);

const MCQCard = ({ icon: Icon, title, onClick }) => (
  <button onClick={onClick} className="w-full p-4 mb-3 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-4 hover:border-orange-400 hover:shadow-md active:scale-[0.98] transition-all text-left group">
    <div className="w-12 h-12 rounded-xl bg-[#D9ECA2]/30 flex items-center justify-center text-[#7D9C6D] group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
      <Icon size={24} />
    </div>
    <span className="font-semibold text-gray-700 text-lg flex-1">{title}</span>
  </button>
);

const SpeechBubble = ({ text }) => (
  <div className="relative bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-4 max-w-[85%] mx-auto">
    <p className="text-gray-700 font-medium text-center">{text}</p>
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
  </div>
);

const ProgressRing = ({ percentage, label, icon: Icon, metric }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-w-[140px] p-4 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 snap-center">
      <div className="relative flex items-center justify-center w-24 h-24 mb-3">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="none" />
          <motion.circle
            cx="48" cy="48" r={radius} stroke="#7D9C6D" strokeWidth="8" fill="none" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="relative z-10 text-[#7D9C6D] bg-[#D9ECA2]/30 p-3 rounded-full"><Icon size={24} /></div>
      </div>
      <span className="text-sm font-bold text-gray-700 text-center">{label}</span>
      <span className="text-xs font-medium text-gray-400 mt-1 text-center">{metric}</span>
    </div>
  );
};

const TaskCard = ({ task, onComplete }) => (
  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className={`relative p-4 rounded-2xl border-2 transition-colors duration-300 flex items-center gap-4 ${task.completed ? 'bg-[#D9ECA2]/40 border-[#D9ECA2]' : 'bg-white border-gray-100'}`}
    onClick={() => onComplete(task.id)}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${task.completed ? 'bg-[#7D9C6D] text-white' : 'bg-gray-50 text-gray-400'}`}>
      {task.completed ? <Check size={24} /> : <task.icon size={24} />}
    </div>
    <div className="flex-1">
      <h4 className={`font-bold transition-colors ${task.completed ? 'text-[#7D9C6D]' : 'text-gray-800'}`}>{task.title}</h4>
      <p className="text-sm text-gray-500 font-medium">{task.time}</p>
    </div>
    <AnimatePresence>
      {task.completed && (
        <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: [1, 1.5, 0], opacity: [1, 1, 0] }} exit={{ opacity: 0 }} className="absolute right-4 text-[#7D9C6D]">
          <Leaf size={32} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// --- MAIN DASHBOARD (Step 14) ---
const Dashboard = ({ activeTab, onTabChange, onOpenDiet, onOpenProfile }) => {
  const [isCopingMode, setIsCopingMode] = useState(false);
  const { userProfile, awardProgress, refreshFromGamification } = useGamification();
  const [streakDays, setStreakDays] = useState(userProfile.streakDays);
  const [bodyHealingData, setBodyHealingData] = useState({ lungs: 0, heart: 0, bloodPressure: 0, moneySaved: 0 });
  const hour = new Date().getHours();

  let timePhase = 'Morning';
  let greeting = "Ready for a fresh start today?";
  if (hour >= 12 && hour < 17) { timePhase = 'Afternoon'; greeting = "Keep your focus strong!"; }
  else if (hour >= 17 && hour < 21) { timePhase = 'Evening'; greeting = "Time to wind down and reflect."; }
  else if (hour >= 21 || hour < 5) { timePhase = 'Night'; greeting = "Rest well, you earned it."; }

  const TASK_ICONS_BY_TIME = { Morning: Wind, Afternoon: Activity, Evening: Sun, Night: Moon };
  const TASK_ICONS = { '1': Wind, '2': Activity, '3': Sun, '4': Moon };
  const [tasks, setTasks] = useState([]);

  const [cravingData, setCravingData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [cravingInput, setCravingInput] = useState(5);
  const [moodInput, setMoodInput] = useState(3);

  useEffect(() => {
    getDashboardToday().then(res => {
      const d = res.data;
      setStreakDays(d.streakDays || 0);
      setBodyHealingData(d.bodyHealing || { lungs: 0, heart: 0, bloodPressure: 0, moneySaved: 0 });
      if (d.tasks?.length) {
        setTasks(d.tasks.map(t => ({ id: t.taskId, title: t.title, time: t.time, icon: TASK_ICONS[t.taskId] || TASK_ICONS_BY_TIME[t.time] || Wind, completed: t.completed })));
      }
      setCheckedIn(d.checkedInToday || false);
    }).catch(() => {});
    getChartData().then(res => {
      setCravingData(res.data.cravingData || []);
      setMoodData(res.data.moodData || []);
    }).catch(() => {});
  }, []);

  const completedTasks = tasks.filter(task => task.completed).length;
  const homeEmotion = timePhase === 'Night'
    ? 'sleep'
    : completedTasks >= 3
      ? 'happy'
      : completedTasks >= 2
        ? 'smile'
        : 'sad';
  const moodEmoji = completedTasks >= 3 ? '\u{1F60A}' : completedTasks >= 2 ? '\u{1F610}' : '\u{1F61F}';

  const toggleTask = (id) => {
    const targetTask = tasks.find(task => task.id === id);
    const isCompleting = targetTask && !targetTask.completed;

    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

    apiToggleTask(String(id)).then(res => {
      if (res.data.gamification) refreshFromGamification(res.data.gamification);
    }).catch(() => {});

    if (isCompleting) {
      awardProgress({
        actionKey: `dashboard-task-${id}`,
        xp: 60,
        gems: 4,
        updates: { activitiesCompleted: 1 },
      });
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    Promise.all([logCraving(cravingInput), logMood(moodInput)]).then(() => {
      getChartData().then(res => {
        setCravingData(res.data.cravingData || []);
        setMoodData(res.data.moodData || []);
      }).catch(() => {});
    }).catch(() => {});
  };

  const MOOD_OPTIONS = [
    { value: 1, emoji: '\u{1F614}', label: 'Low' },
    { value: 2, emoji: '\u{1F610}', label: 'Meh' },
    { value: 3, emoji: '\u{1F642}', label: 'Good' },
    { value: 4, emoji: '\u{1F604}', label: 'Great' },
  ];

  const CustomMoodDot = (props) => {
    const { cx, cy, payload } = props;
    const emoji = payload.mood === 1 ? '😔' : payload.mood === 2 ? '😐' : payload.mood === 3 ? '🙂' : '😄';
    return <text x={cx} y={cy} dy={6} fontSize="18" textAnchor="middle">{emoji}</text>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-[#FAFAFA] relative flex flex-col h-full overflow-hidden">
      
      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
          <div className="pt-12 px-6 pb-6 bg-white rounded-b-[40px] shadow-sm flex items-center justify-between sticky top-0 z-20">
            <div>
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Your Progress</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="bg-[#D9ECA2] text-[#7D9C6D] px-3 py-1 rounded-lg font-black text-xl flex items-center gap-1 shadow-sm">
                  <Zap size={20} fill="currentColor" /> {streakDays}
                </div>
                <h1 className="text-xl font-extrabold text-gray-800">Days Sober</h1>
              </div>
            </div>
            <button
              onClick={onOpenProfile}
              className="relative rounded-[24px] border border-gray-100 bg-white p-1.5 shadow-sm transition-transform hover:scale-[1.02]"
            >
              <img src={userProfile.avatarImage} alt={userProfile.name} className="h-12 w-12 rounded-[18px] object-cover" />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#EEF6DA] text-sm shadow-sm">
                {moodEmoji}
              </span>
            </button>
          </div>

          <div className="p-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-b from-[#D9ECA2]/40 to-white rounded-[32px] p-6 shadow-sm border border-white relative overflow-hidden flex flex-col items-center text-center">
              <SpeechBubble text={greeting} />
              <Mascot emotion={homeEmotion} context="home" size={144} className="my-4" />
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-700">Good {timePhase}!</p>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-sm shadow-sm">{moodEmoji}</span>
              </div>
            </motion.div>
          </div>

          <div className="px-6 mb-6">
            {checkedIn ? (
              <div className="bg-[#EEF6DA] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7D9C6D] flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <p className="font-bold text-[#7D9C6D] text-sm">Checked in today</p>
              </div>
            ) : (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-800 mb-4">How are you feeling?</h3>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Craving Level</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setCravingInput(n)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                          n <= cravingInput
                            ? n <= 3 ? 'bg-[#D9ECA2] text-[#5a7a3d]' : n <= 6 ? 'bg-yellow-200 text-yellow-700' : 'bg-red-200 text-red-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Mood</p>
                  <div className="flex gap-3">
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.value} onClick={() => setMoodInput(m.value)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                          moodInput === m.value ? 'bg-[#EEF6DA] shadow-sm scale-110' : 'bg-gray-50'
                        }`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[10px] font-semibold text-gray-500">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCheckIn}
                  className="w-full py-2.5 rounded-xl bg-[#7D9C6D] text-white font-bold text-sm shadow-sm hover:bg-[#6b8a5b] transition-colors"
                >Log Check-in</button>
              </motion.div>
            )}
          </div>

          <div className="pl-6 mb-8">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Body Healing</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 pr-6 snap-x hide-scrollbar">
              <ProgressRing percentage={bodyHealingData.lungs} label="Lungs" icon={Wind} metric={`${bodyHealingData.lungs}% improved`} />
              <ProgressRing percentage={bodyHealingData.heart} label="Heart" icon={HeartPulse} metric="Stress reduced" />
              <ProgressRing percentage={bodyHealingData.bloodPressure} label="Blood Pres." icon={Activity} metric={`${bodyHealingData.bloodPressure}% stable`} />
              <ProgressRing percentage={Math.min(100, bodyHealingData.moneySaved / 5)} label="Saved" icon={DollarSign} metric={`$${bodyHealingData.moneySaved} retained`} />
            </div>
          </div>

          <div className="px-6 mb-8">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50">
              <h2 className="text-lg font-extrabold text-gray-800 mb-6">Craving Intensity</h2>
              {cravingData.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cravingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                      <YAxis hide domain={[0, 10]} />
                      <Tooltip cursor={{ stroke: '#D9ECA2', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="intensity" stroke="#7D9C6D" strokeWidth={4} dot={{ r: 4, fill: '#7D9C6D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#B25349' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <p className="text-sm font-medium">Log your first craving to see trends here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 mb-8">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50">
              <h2 className="text-lg font-extrabold text-gray-800 mb-6">Emotional Progress</h2>
              {moodData.length > 0 ? (
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <XAxis dataKey="day" hide />
                      <YAxis hide domain={[0, 5]} />
                      <Line type="monotone" dataKey="mood" stroke="#D9ECA2" strokeWidth={3} dot={<CustomMoodDot />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-gray-400">
                  <p className="text-sm font-medium">Your mood trends will appear as you log them.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 mb-8">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Today's Recovery Plan</h2>
            <div className="space-y-3">
              {tasks.map(task => <TaskCard key={task.id} task={task} onComplete={toggleTask} />)}
            </div>
          </div>
        </div>
      )}

      {/* RECOVERY TAB */}
      {activeTab === 'recovery' && (
        <div className="flex-1 overflow-hidden">
          <RecoveryJourney />
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div className="flex-1 overflow-hidden">
          <Challenges />
        </div>
      )}

      {/* COMMUNITY TAB */}
      {activeTab === 'community' && (
        <div className="flex-1 overflow-hidden">
          <Community />
        </div>
      )}

      {/* FLOATING COPING BUTTON */}
      <motion.button 
        onClick={() => setIsCopingMode(true)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="absolute bottom-28 right-6 bg-gradient-to-r from-[#7D9C6D] to-[#6b865d] text-white p-4 rounded-full shadow-[0_8px_20px_rgb(125,156,109,0.4)] flex items-center gap-2 z-30"
      >
        <div className="relative">
          <AlertCircle size={24} />
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
        </div>
        <span className="font-bold pr-2">Coping Now</span>
      </motion.button>

      {/* BOTTOM NAVIGATION */}
      <div className="absolute bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full px-6 py-4 flex justify-between items-center z-40">
        {[ 
          { icon: Home, id: 'home' },
          { icon: Zap, id: 'recovery' },
          { icon: Swords, id: 'challenges' },
          { icon: Users, id: 'community' },
          { icon: DietTabIcon, id: 'diet' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => (tab.id === 'diet' ? onOpenDiet() : onTabChange(tab.id))}
              className="relative p-2 flex flex-col items-center group"
            >
              <tab.icon size={26} className={`transition-colors duration-300 ${isActive ? 'text-[#7D9C6D]' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {isActive && <motion.div layoutId="navIndicator" className="absolute -bottom-2 w-1 h-1 bg-[#7D9C6D] rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* COPING OVERLAY */}
      <AnimatePresence>
        {isCopingMode && <CopingNow onClose={() => setIsCopingMode(false)} />}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

// --- APP COMPONENT (Onboarding Router) ---
export default function App() {
  const { isAuthenticated, isLoading, user, updateUser } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [step, setStep] = useState(1);
  const [route, setRoute] = useState(() => getAppRoute());
  const [dashboardTab, setDashboardTab] = useState('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [addedContacts, setAddedContacts] = useState([]);

  // Skip onboarding if user already completed it
  useEffect(() => {
    if (isAuthenticated && user?.onboarding?.completed) {
      setStep(14);
    }
  }, [isAuthenticated, user]);

  const toggleContact = (role) => {
    setAddedContacts(prev =>
      prev.find(c => c.role === role) ? prev.filter(c => c.role !== role) : [...prev, { role, email: '' }]
    );
  };
  const updateContactEmail = (role, email) => {
    setAddedContacts(prev => prev.map(c => c.role === role ? { ...c, email } : c));
  };
  const [answers, setAnswers] = useState({});
  const [anchorImages, setAnchorImages] = useState([null, null, null, null]);

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setTimeout(() => setStep(step + 1), 300);
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...anchorImages];
        newImages[index] = reader.result;
        setAnchorImages(newImages);
        setAnswers(prev => ({ ...prev, anchors: newImages }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (step === 1) { const timer = setTimeout(() => setStep(2), 3500); return () => clearTimeout(timer); }
    if (step === 10) {
      // Save onboarding to backend
      const onboardingData = {
        type: answers.type,
        duration: answers.duration,
        cravingTime: answers.time,
        trigger: answers.trigger,
        motivation: answers.motivation,
        anchorImages: anchorImages.filter(Boolean),
        emergencyContacts: addedContacts.map(c => ({ role: c.role, email: c.email })),
      };
      saveOnboarding(onboardingData)
        .then(res => { if (res.data.user) updateUser(res.data.user); })
        .catch(() => {});
      const timer = setTimeout(() => setStep(11), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    const handlePopState = () => setRoute(getAppRoute());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, options = {}) => {
    navigateToPath(path, options.replace);
    setRoute(path);
  };

  const wrapperClass = "w-full max-w-[390px] mx-auto h-[100dvh] sm:h-[844px] sm:my-8 sm:rounded-[40px] shadow-2xl overflow-hidden relative bg-white flex flex-col font-sans";

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return authPage === 'login'
      ? <Login onSwitchToSignup={() => setAuthPage('signup')} />
      : <Signup onSwitchToLogin={() => setAuthPage('login')} />;
  }

  // Acquaintance users get their own dashboard
  if (user?.role === 'acquaintance') {
    return <AcquaintanceDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center sm:p-4">
      <div className={wrapperClass}>

        {step === 1 && (
          <FadeIn>
            <div className="flex-1 bg-gradient-to-b from-[#D9ECA2] to-white flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#7D9C6D 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full border-4 border-[#7D9C6D]/20 animate-[ping_3s_ease-in-out_infinite]"></div>
                  <Mascot emotion="smile" context="onboarding" size={128} className="mb-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome to your<br/>healing journey</h1>
                <p className="text-[#7D9C6D] font-medium text-sm animate-pulse mt-8">Preparing your safe space...</p>
              </div>
            </div>
          </FadeIn>
        )}

        {step === 2 && (
          <FadeIn>
            <div className="flex-1 bg-gradient-to-b from-[#D9ECA2] to-white flex flex-col p-6 pt-20">
              <div className="flex-1 flex flex-col items-center justify-center mt-10">
                <SpeechBubble text="Hi there. I'm your tiny brain companion. I'm here to help you heal." />
                <Mascot emotion="welcoming" context="onboarding" size={160} className="mt-4 mb-8" />
                <p className="text-center text-gray-500 font-medium px-4 mb-12">We'll ask a few quick questions to build your personal recovery plan.</p>
              </div>
              <div className="pb-8"><Button onClick={() => setStep(3)} icon={Leaf}>Let's Begin</Button></div>
            </div>
          </FadeIn>
        )}

        {step === 3 && (
          <FadeIn>
            <ProgressBar step={1} />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 shadow-inner">
              <SpeechBubble text="What habit are you trying to overcome?" />
              <Mascot emotion="thinking" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-1">
                <MCQCard icon={Beer} title="Alcohol" onClick={() => handleAnswer('type', 'alcohol')} />
                <MCQCard icon={Cigarette} title="Smoking / Nicotine" onClick={() => handleAnswer('type', 'smoking')} />
                <MCQCard icon={Pill} title="Drugs / Substances" onClick={() => handleAnswer('type', 'drugs')} />
                <MCQCard icon={Smartphone} title="Digital Addiction" onClick={() => handleAnswer('type', 'digital')} />
                <MCQCard icon={Candy} title="Sugar / Food Cravings" onClick={() => handleAnswer('type', 'sugar')} />
                <MCQCard icon={Plus} title="Something Else" onClick={() => handleAnswer('type', 'other')} />
              </div>
            </div>
          </FadeIn>
        )}

        {step === 4 && (
          <FadeIn>
            <ProgressBar step={2} />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 shadow-inner">
              <SpeechBubble text="How long have you been struggling with this?" />
              <Mascot emotion="concerned" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-1">
                <MCQCard icon={Clock} title="Less than 6 months" onClick={() => handleAnswer('duration', '<6m')} />
                <MCQCard icon={Clock} title="6 months – 1 year" onClick={() => handleAnswer('duration', '6m-1y')} />
                <MCQCard icon={Clock} title="1 – 3 years" onClick={() => handleAnswer('duration', '1-3y')} />
                <MCQCard icon={Clock} title="3 – 5 years" onClick={() => handleAnswer('duration', '3-5y')} />
                <MCQCard icon={Clock} title="More than 5 years" onClick={() => handleAnswer('duration', '>5y')} />
              </div>
            </div>
          </FadeIn>
        )}

        {step === 5 && (
          <FadeIn>
            <ProgressBar step={3} />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 shadow-inner">
              <SpeechBubble text="When do cravings usually hit the hardest?" />
              <Mascot emotion="thinking" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-1">
                <MCQCard icon={Sunrise} title="Morning" onClick={() => handleAnswer('time', 'morning')} />
                <MCQCard icon={Sun} title="Afternoon" onClick={() => handleAnswer('time', 'afternoon')} />
                <MCQCard icon={Sunset} title="Evening" onClick={() => handleAnswer('time', 'evening')} />
                <MCQCard icon={Moon} title="Late Night" onClick={() => handleAnswer('time', 'night')} />
                <MCQCard icon={Zap} title="Randomly" onClick={() => handleAnswer('time', 'random')} />
              </div>
            </div>
          </FadeIn>
        )}

        {step === 6 && (
          <FadeIn>
            <ProgressBar step={4} />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 shadow-inner">
              <SpeechBubble text="What usually triggers your cravings?" />
              <Mascot emotion="concerned" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-1">
                <MCQCard icon={Frown} title="Stress" onClick={() => handleAnswer('trigger', 'stress')} />
                <MCQCard icon={CloudRain} title="Loneliness" onClick={() => handleAnswer('trigger', 'loneliness')} />
                <MCQCard icon={Angry} title="Anger" onClick={() => handleAnswer('trigger', 'anger')} />
                <MCQCard icon={Coffee} title="Boredom" onClick={() => handleAnswer('trigger', 'boredom')} />
                <MCQCard icon={Users} title="Social Situations" onClick={() => handleAnswer('trigger', 'social')} />
              </div>
            </div>
          </FadeIn>
        )}

        {step === 7 && (
          <FadeIn>
            <ProgressBar step={5} />
            <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 shadow-inner">
              <SpeechBubble text="Why do you want to quit?" />
              <Mascot emotion="happy" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-1">
                <MCQCard icon={Heart} title="Family & Loved Ones" onClick={() => handleAnswer('motivation', 'family')} />
                <MCQCard icon={Activity} title="Health & Body" onClick={() => handleAnswer('motivation', 'health')} />
                <MCQCard icon={PiggyBank} title="Financial Savings" onClick={() => handleAnswer('motivation', 'finance')} />
                <MCQCard icon={Brain} title="Mental Clarity" onClick={() => handleAnswer('motivation', 'mind')} />
                <MCQCard icon={Leaf} title="Self Growth" onClick={() => handleAnswer('motivation', 'growth')} />
              </div>
            </div>
          </FadeIn>
        )}

        {step === 8 && (
          <FadeIn>
            <div className="flex-1 bg-[#D9ECA2]/20 flex flex-col p-6 pt-12 overflow-y-auto">
              <SpeechBubble text="When cravings hit, we'll remind you why you started. Upload photos of people or pets you love." />
              <Mascot emotion="happy" context="onboarding" size={96} className="mx-auto mb-8" />
              <div className="grid grid-cols-2 gap-4 mb-8">
                {anchorImages.map((imgUrl, index) => (
                  <label key={index} className="aspect-square bg-white border-2 border-dashed border-[#7D9C6D]/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#7D9C6D] hover:bg-[#7D9C6D]/10 transition-colors cursor-pointer relative overflow-hidden group">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} />
                    {imgUrl ? (
                      <>
                        <img src={imgUrl} alt={`Anchor ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">Change</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={28} />
                        <span className="font-semibold text-sm">Upload</span>
                      </>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-center text-gray-500 text-sm mb-auto">These will only be used privately to help you stay strong.</p>
              <div className="mt-8 pb-4"><Button onClick={() => setStep(9)}>Continue</Button></div>
            </div>
          </FadeIn>
        )}

        {step === 9 && (
          <FadeIn>
            <div className="flex-1 p-6 pt-12 flex flex-col overflow-y-auto shadow-inner">
              <SpeechBubble text="Who should we contact if you're struggling?" />
              <Mascot emotion="thinking" context="onboarding" size={96} className="mx-auto mb-6" />
              <div className="space-y-4 mb-auto">
                {['Family Member', 'Trusted Friend', 'Therapist', 'Sponsor / Mentor'].map((role) => {
                  const contact = addedContacts.find(c => c.role === role);
                  const isAdded = !!contact;
                  return (
                    <div key={role} className={`p-4 bg-white border-2 rounded-2xl shadow-sm transition-colors ${isAdded ? 'border-[#D9ECA2]' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAdded ? 'bg-[#7D9C6D] text-white' : 'bg-orange-100 text-orange-500'}`}>
                            <Phone size={18} />
                          </div>
                          <span className="font-semibold text-gray-700">{role}</span>
                        </div>
                        <button
                          onClick={() => toggleContact(role)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${isAdded ? 'bg-[#7D9C6D] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          {isAdded ? <><Check size={14} strokeWidth={3}/> Added</> : 'Add'}
                        </button>
                      </div>
                      {isAdded && (
                        <input
                          type="email"
                          placeholder="Enter their email address"
                          value={contact.email}
                          onChange={(e) => updateContactEmail(role, e.target.value)}
                          className="mt-3 w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#D9ECA2] transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pb-4"><Button onClick={() => setStep(10)}>Build My Plan</Button></div>
            </div>
          </FadeIn>
        )}

        {step === 10 && (
          <FadeIn>
            <div className="flex-1 bg-gradient-to-b from-[#D9ECA2] to-white flex flex-col items-center justify-center px-6 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 border-4 border-dashed border-[#7D9C6D] rounded-full animate-[spin_8s_linear_infinite]"></div>
                <Mascot emotion="thinking" context="onboarding" size={128} className="p-4" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Building your recovery plan...</h2>
              <p className="text-[#7D9C6D] font-medium">This may take a moment.</p>
              <div className="w-full max-w-xs h-3 bg-gray-200 rounded-full mt-10 overflow-hidden">
                <div className="h-full bg-orange-400 w-full animate-[loading_4s_ease-in-out]"></div>
              </div>
              <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
            </div>
          </FadeIn>
        )}

        {/* --- STEP 11: GUIDED TOUR START --- */}
        {step === 11 && (
          <FadeIn>
            <div className="flex-1 bg-[#f8fcf4] flex flex-col overflow-hidden">
              <div className="p-6 bg-white shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-800 text-center">Your Journey Map</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 relative">
                <svg className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 h-full z-0 pointer-events-none" preserveAspectRatio="none">
                  <path d="M64,0 C120,100 0,200 64,300 C120,400 0,500 64,600 C120,700 0,800 64,900" stroke="#D9ECA2" strokeWidth="16" fill="none" strokeLinecap="round"/>
                </svg>
                <div className="relative z-10 flex flex-col gap-16 py-8">
                  {[
                    { w: 1, title: 'Stabilize Cravings', side: 'right' }, { w: 2, title: 'Build Awareness', side: 'left' },
                    { w: 3, title: 'Habit Replacement', side: 'right' }, { w: 4, title: 'Emotional Resilience', side: 'left' },
                    { w: 5, title: 'Confidence Building', side: 'right' }, { w: 6, title: 'Lifestyle Redesign', side: 'left' },
                    { w: 7, title: 'Strong Recovery', side: 'right', icon: Star },
                  ].map((node, i) => (
                    <div key={i} className={`flex ${node.side === 'right' ? 'justify-end' : 'justify-start'} w-full relative`}>
                   <div onClick={() => node.w === 1 && setStep(12)} className={`w-[60%] flex flex-col items-center cursor-pointer group ${node.w === 1 ? 'animate-bounce' : ''}`}>
                        
                        {/* 1. We added "relative" to the circle, and moved the tooltip INSIDE it */}
                        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10 ${node.w === 1 ? 'bg-orange-400' : 'bg-[#D9ECA2] group-hover:bg-[#c2d984]'} transition-colors`}>
                          
                          {/* 2. THE GUIDING TOOLTIP (Now perfectly anchored to the Left side) */}
                          {node.w === 1 && (
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: [-10, 0, -10] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 flex items-center z-50 pointer-events-none"
                            >
                              <div className="bg-orange-500 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-1 relative">
                                Start here! <ChevronRight size={16} strokeWidth={3} />
                                {/* Pointer triangle pointing right towards the circle */}
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-orange-500 rotate-45 rounded-sm"></div>
                              </div>
                            </motion.div>
                          )}

                          {/* The Icon inside the circle */}
                          {node.icon ? <node.icon size={32} className="text-white" fill="currentColor"/> : <Brain className={`w-8 h-8 ${node.w === 1 ? 'text-white' : 'text-[#7D9C6D]'}`} />}
                        </div>
                        
                        {/* The Text Label below the circle */}
                        <div className="mt-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-center relative">
                          <span className="block text-xs font-bold text-gray-400">WEEK {node.w}</span>
                          <span className="block text-sm font-bold text-gray-700">{node.title}</span>
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* --- STEP 12: GUIDED TOUR CONTINUE --- */}
        {step === 12 && (
          <FadeIn>
            <div className="flex-1 bg-white flex flex-col">
              <div className="bg-[#D9ECA2] p-8 pb-12 rounded-b-[40px] relative">
                <button onClick={() => setStep(11)} className="absolute top-6 left-6 text-[#7D9C6D] font-bold">← Back</button>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md"><span className="text-2xl font-black text-orange-400">1</span></div>
                  <div><h2 className="text-gray-500 font-bold tracking-wider text-sm">WEEK 1</h2><h1 className="text-2xl font-extrabold text-gray-800">Stabilize Cravings</h1></div>
                </div>
                <Mascot emotion="smile" context="onboarding" size={96} className="absolute -bottom-10 right-8" />
              </div>
              <div className="flex-1 p-6 pt-16 overflow-y-auto">
                <h3 className="font-bold text-gray-800 text-lg mb-4">Your daily goals:</h3>
                <div className="space-y-4">
                  {[
                    { icon: Wind, title: 'Guided Breathing', desc: '3 mins every morning' }, { icon: Clock, title: 'Craving Delay', desc: '10-minute wait rule' },
                    { icon: Activity, title: 'Hydration', desc: 'Drink 8 glasses of water' }, { icon: Heart, title: 'Mood Check-in', desc: 'Log feelings nightly' }
                  ].map((task, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center"><task.icon size={24} /></div>
                      <div className="flex-1"><h4 className="font-bold text-gray-800">{task.title}</h4><p className="text-sm text-gray-500 font-medium">{task.desc}</p></div>
                      <CheckCircle2 className="text-gray-300" size={24} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* THE GUIDING TOOLTIP */}
              <div className="p-6 bg-white border-t border-gray-50 relative">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: [-10, 5, -10] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none"
                >
                  <div className="bg-[#7D9C6D] text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap flex items-center gap-1">
                    Almost there! <ChevronDown size={16} strokeWidth={3} />
                  </div>
                  <div className="w-3 h-3 bg-[#7D9C6D] rotate-45 -mt-1.5 rounded-sm"></div>
                </motion.div>
                <Button onClick={() => setStep(13)}>Continue</Button>
              </div>
            </div>
          </FadeIn>
        )}

        {step === 13 && (
          <FadeIn>
             <div className="flex-1 bg-gradient-to-t from-[#D9ECA2] to-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-50">
                 {[...Array(12)].map((_, i) => (
                   <Leaf key={i} size={24} className="absolute text-[#7D9C6D] animate-[fall_5s_linear_infinite]" style={{ left: `${Math.random() * 100}%`, top: `-20px`, animationDelay: `${Math.random() * 5}s`, transform: `rotate(${Math.random() * 360}deg)` }} />
                 ))}
                 <style>{`@keyframes fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(800px) rotate(360deg); opacity: 0; } }`}</style>
              </div>
              <div className="relative z-10 flex flex-col items-center mt-12 mb-auto">
                <Mascot emotion="excited" context="onboarding" size={192} className="mb-8" />
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight leading-tight">Your recovery journey<br/>begins today.</h1>
                <p className="text-lg text-gray-600 font-medium px-4">I'm here with you every step of the way. You are not alone.</p>
              </div>
              
              <div className="w-full pb-8 z-10">
                <Button onClick={() => setStep(14)} className="py-5 text-xl shadow-[0_8px_30px_rgb(125,156,109,0.4)]">
                  ENTER DASHBOARD
                </Button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* --- STEP 14: THE MAIN APPLICATION DASHBOARD --- */}
        {step === 14 && (
          route === DIET_ROUTE ? (
            <DietPlan onBack={() => navigateTo(DASHBOARD_ROUTE)} />
          ) : (
            <Dashboard
              activeTab={dashboardTab}
              onTabChange={setDashboardTab}
              onOpenDiet={() => navigateTo(DIET_ROUTE)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )
        )}

        {step === 14 && (
          <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}

      </div>
    </div>
  );
}

// Extra Custom Icons
function HeartPulse(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
    </svg>
  );
}
function DollarSign(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function DietTabIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3c0 4.2 1.7 6.8 5 7.5" />
      <path d="M17 3c0 4.2-1.7 6.8-5 7.5" />
      <path d="M12 10.5V21" />
      <path d="M8 21h8" />
      <path d="M7.5 6.5C8.8 5 10.3 4.2 12 4.2s3.2.8 4.5 2.3" />
    </svg>
  );
}
