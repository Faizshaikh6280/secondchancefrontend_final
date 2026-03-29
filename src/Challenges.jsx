import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Users, Clock, Trophy, ChevronRight,
  CheckCircle2, Circle, Flame, ArrowLeft, Medal, Star, Sparkles
} from 'lucide-react';
import useGamification from './hooks/useGamification';
import { getChallenges, joinChallenge, toggleChallengeTask, getGlobalLeaderboard } from './api/challenge.api';

// --- REUSABLE COMPONENTS ---
const AvatarGroup = ({ avatars, count }) => (
  <div className="flex items-center">
    <div className="flex -space-x-2">
      {avatars.map((color, i) => (
        <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${color} shadow-sm`} />
      ))}
    </div>
    <span className="text-xs font-bold text-gray-400 ml-2">+{count.toLocaleString()}</span>
  </div>
);

const Badge = ({ text, theme }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
    {text}
  </span>
);

export default function Challenges() {
  const { awardProgress, refreshFromGamification } = useGamification();
  const [challenges, setChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);

  const computeTimeline = (c) => {
    const now = Date.now();
    if (c.status === 'active' && c.endDate) {
      const days = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - now) / 86400000));
      return days > 0 ? `Ends in ${days} Day${days > 1 ? 's' : ''}` : 'Ending today';
    }
    if (c.status === 'upcoming' && c.startDate) {
      const days = Math.max(0, Math.ceil((new Date(c.startDate).getTime() - now) / 86400000));
      return days > 0 ? `Starts in ${days} Day${days > 1 ? 's' : ''}` : 'Starting today';
    }
    return 'Completed';
  };

  useEffect(() => {
    getChallenges().then(res => {
      const mapped = (res.data.challenges || []).map(c => ({
        id: c._id,
        title: c.title,
        type: c.type,
        theme: c.theme || { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', tagBg: 'bg-blue-100' },
        status: c.status,
        isRegistered: c.joined,
        participants: c.participantCount,
        avatars: ['bg-red-400', 'bg-purple-400', 'bg-yellow-400'],
        timeline: computeTimeline(c),
        myPoints: c.myPoints || 0,
        totalPoints: c.totalPoints,
        benefits: c.benefits || [],
        tasks: c.tasks?.map(t => ({
          id: t.taskId,
          title: t.title,
          points: t.points,
          done: (c.myCompletedTasks || []).includes(t.taskId),
        })) || [],
      }));
      setChallenges(mapped);
    }).catch(() => {});
    getGlobalLeaderboard().then(res => {
      setGlobalLeaderboard(res.data.leaderboard || []);
    }).catch(() => {});
  }, []);

  // Keep selectedChallenge in sync with challenges array
  useEffect(() => {
    if (selectedChallenge) {
      const updated = challenges.find(c => c.id === selectedChallenge.id);
      if (updated) setSelectedChallenge(updated);
    }
  }, [challenges]);

  // State for the floating coin/bubble animation
  const [floatingCoins, setFloatingCoins] = useState([]);

  const filteredChallenges = challenges.filter(c => c.status === activeTab);

  const handleToggleTask = (challengeId, taskId) => {
    // Optimistic local update
    let isCompleting = false;
    setChallenges(prev => prev.map(c => {
      if (c.id !== challengeId) return c;
      const updatedTasks = c.tasks.map(t => {
        if (t.id === taskId) {
          isCompleting = !t.done;
          const pointDiff = isCompleting ? t.points : -t.points;

          const coinId = Date.now();
          setFloatingCoins(prevCoins => [...prevCoins, { id: coinId, taskId, points: t.points, isAdding: isCompleting }]);
          setTimeout(() => {
            setFloatingCoins(prevCoins => prevCoins.filter(coin => coin.id !== coinId));
          }, 1000);

          return { ...t, done: isCompleting };
        }
        return t;
      });
      const newPoints = updatedTasks.filter(t => t.done).reduce((sum, t) => sum + t.points, 0);
      return { ...c, tasks: updatedTasks, myPoints: newPoints };
    }));

    // Call backend
    toggleChallengeTask(challengeId, taskId).then(res => {
      if (res.data?.gamification) refreshFromGamification(res.data.gamification);
      // Sync points from server
      if (res.data?.myPoints !== undefined) {
        setChallenges(prev => prev.map(c =>
          c.id === challengeId ? { ...c, myPoints: res.data.myPoints } : c
        ));
      }
    }).catch(() => {
      // Revert on error
      setChallenges(prev => prev.map(c => {
        if (c.id !== challengeId) return c;
        const revertedTasks = c.tasks.map(t =>
          t.id === taskId ? { ...t, done: !isCompleting } : t
        );
        const newPoints = revertedTasks.filter(t => t.done).reduce((sum, t) => sum + t.points, 0);
        return { ...c, tasks: revertedTasks, myPoints: newPoints };
      }));
    });
  };

  const handleJoin = (e, challengeId) => {
    e.stopPropagation();
    setChallenges(prev => prev.map(c =>
      c.id === challengeId ? { ...c, isRegistered: true } : c
    ));
    setActiveTab('active');
    joinChallenge(challengeId).then(res => {
      if (res.data?.gamification) refreshFromGamification(res.data.gamification);
    }).catch(() => {
      setChallenges(prev => prev.map(c =>
        c.id === challengeId ? { ...c, isRegistered: false } : c
      ));
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 bg-[#FAFAFA] relative flex flex-col h-full overflow-hidden font-sans"
    >
      
      {/* --- MAIN LIST VIEW --- */}
      {!selectedChallenge && !showGlobalLeaderboard && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="pt-12 px-6 pb-4 bg-white rounded-b-[40px] shadow-sm z-20 shrink-0 relative">
            
            {/* Weekly Leaderboard Button */}
            <button 
              onClick={() => setShowGlobalLeaderboard(true)}
              className="absolute top-12 right-6 w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200 rounded-full flex flex-col items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <Trophy size={20} className="text-orange-500" />
            </button>

            <div className="mb-6 pr-14">
              <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                <Swords className="text-[#7D9C6D]" /> Challenges
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Compete, heal, and earn rewards.</p>
            </div>

            {/* Custom Tabs */}
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              {['active', 'upcoming', 'completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl capitalize transition-all ${
                    activeTab === tab ? 'bg-white text-[#7D9C6D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-32 hide-scrollbar">
            {filteredChallenges.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Trophy size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-semibold">No challenges yet.</p>
                <p className="text-gray-300 text-sm mt-1">Check back soon!</p>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {filteredChallenges.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedChallenge(challenge)}
                  className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 mb-5 cursor-pointer hover:border-[#D9ECA2] hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${challenge.theme.bg} opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <Badge text={challenge.type} theme={challenge.theme} />
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <Clock size={14} /> {challenge.timeline}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-gray-800 mb-3 pr-8">{challenge.title}</h3>
                    
                    {/* Benefits Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {challenge.benefits.map((benefit, idx) => (
                        <span key={idx} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${challenge.theme.tagBg} ${challenge.theme.text}`}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <AvatarGroup avatars={challenge.avatars} count={challenge.participants} />
                      
                      {challenge.status === 'completed' ? (
                        <span className="text-purple-500 font-bold flex items-center gap-1 text-sm"><Trophy size={16}/> Results</span>
                      ) : challenge.isRegistered ? (
                        <span className="text-[#7D9C6D] font-bold flex items-center gap-1 text-sm">Continue <ChevronRight size={16}/></span>
                      ) : (
                        <button 
                          onClick={(e) => handleJoin(e, challenge.id)}
                          className="px-4 py-2 bg-[#7D9C6D] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#6b865d] active:scale-95 transition-transform"
                        >
                          Join Now
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* --- DETAIL VIEW (Active Challenge Tasks) --- */}
      <AnimatePresence>
        {selectedChallenge && selectedChallenge.status !== 'completed' && (
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#FAFAFA] flex flex-col"
          >
            {/* Detail Header */}
            <div className="bg-white pt-12 px-6 pb-8 rounded-b-[40px] shadow-sm relative z-20">
              <button onClick={() => setSelectedChallenge(null)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-6 hover:bg-gray-100">
                <ArrowLeft size={20} />
              </button>
              <Badge text={selectedChallenge.type} theme={selectedChallenge.theme} />
              <h1 className="text-3xl font-extrabold text-gray-800 mt-3 mb-2">{selectedChallenge.title}</h1>
              
              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#7D9C6D]">{selectedChallenge.myPoints}</span>
                    <span className="text-sm font-bold text-gray-400">/ {selectedChallenge.totalPoints} pts</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time Left</p>
                  <span className="text-lg font-bold text-orange-400">{selectedChallenge.timeline.replace('Ends in ', '')}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(selectedChallenge.myPoints / selectedChallenge.totalPoints) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#D9ECA2] to-[#7D9C6D] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <h3 className="font-extrabold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <Flame className="text-orange-400" /> Challenge Milestones
              </h3>
              
              <div className="space-y-4">
                {selectedChallenge.tasks.map(task => (
                  <div key={task.id} className="relative">
                    
                    {/* Floating Bubble/Coin Animation */}
                    <AnimatePresence>
                      {floatingCoins.filter(c => c.taskId === task.id).map(coin => (
                        <motion.div
                          key={coin.id}
                          initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                          animate={{ opacity: 0, y: -60, x: [0, -15, 15, 0], scale: 1.2 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute right-6 top-0 pointer-events-none flex items-center gap-1 font-black z-50 drop-shadow-md"
                        >
                          {coin.isAdding ? (
                            <span className="text-orange-500 flex items-center text-lg"><Star size={20} className="fill-orange-400 mr-1"/> +{coin.points}</span>
                          ) : (
                            <span className="text-red-400 flex items-center text-lg">- {coin.points}</span>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Task Card */}
                    <div 
                      onClick={() => handleToggleTask(selectedChallenge.id, task.id)}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-colors ${task.done ? 'bg-[#D9ECA2]/30 border-[#D9ECA2]' : 'bg-white border-gray-100 hover:border-orange-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-[#7D9C6D] text-white' : 'bg-gray-50 text-gray-300'}`}>
                        {task.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm ${task.done ? 'text-[#7D9C6D]' : 'text-gray-800'}`}>{task.title}</h4>
                        <p className={`text-xs font-bold mt-1 ${task.done ? 'text-[#7D9C6D]/70' : 'text-orange-400'}`}>{task.points} Points</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEADERBOARD VIEW (Completed Challenge OR Global Weekly) --- */}
      <AnimatePresence>
        {(selectedChallenge?.status === 'completed' || showGlobalLeaderboard) && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#2D3748] flex flex-col font-sans"
          >
            {/* Leaderboard Header */}
            <div className="pt-12 px-6 pb-8 bg-gray-900 rounded-b-[40px] relative z-20 shadow-2xl text-center">
              <button 
                onClick={() => { setSelectedChallenge(null); setShowGlobalLeaderboard(false); }} 
                className="absolute top-12 left-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-4">
                {showGlobalLeaderboard ? <Sparkles size={40} className="text-white" /> : <Trophy size={40} className="text-white" />}
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1">
                {showGlobalLeaderboard ? 'Global Top Warriors' : selectedChallenge.title}
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {showGlobalLeaderboard ? 'Weekly Leaderboard' : 'Final Results'}
              </p>
            </div>

            {/* Rankings List */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <div className="space-y-3">
                {(showGlobalLeaderboard ? globalLeaderboard : (selectedChallenge.leaderboard || [])).map((user, i) => {
                  const isTop3 = user.rank <= 3;
                  const medalColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
                  
                  return (
                    <motion.div 
                      key={user.rank}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-2xl ${user.isMe ? 'bg-[#7D9C6D] text-white shadow-lg' : 'bg-white/10 text-white border border-white/5'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center font-black text-lg">
                          {isTop3 ? <Medal size={24} className={`mx-auto ${medalColors[user.rank - 1]}`} /> : `#${user.rank}`}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-sm">
                          {user.country}
                        </div>
                        <span className="font-bold">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-black">
                        {user.score.toLocaleString()} <span className="text-xs opacity-70 font-bold">pts</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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
