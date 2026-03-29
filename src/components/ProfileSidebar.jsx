import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Flame,
  Gem,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import Certificate from './Certificate';
import useGamification from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';

const statCards = [
  { key: 'xp', label: 'XP', icon: Sparkles, color: 'text-[#7D9C6D]', bg: 'bg-[#EEF6DA]' },
  { key: 'gems', label: 'Gems', icon: Gem, color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'streakDays', label: 'Streak', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
];
const MotionButton = motion.button;
const MotionAside = motion.aside;

export default function ProfileSidebar({ isOpen, onClose }) {
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { userProfile, gamification } = useGamification();
  const { logout } = useAuth();

  const unlockedCertificate = gamification.certificates.find((certificate) => certificate.unlocked);
  const pendingCertificate = gamification.certificates.find((certificate) => !certificate.unlocked);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || !unlockedCertificate) {
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#fffdfa',
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${unlockedCertificate.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[70] overflow-hidden">
          <MotionButton
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />

          <MotionAside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute right-0 top-0 flex h-full w-[88%] max-w-[360px] flex-col bg-[#FAFAFA] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="rounded-bl-[34px] bg-white px-5 pb-6 pt-10 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Profile</p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-800">{userProfile.name}</h2>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 rounded-[26px] bg-gradient-to-br from-[#FFF5D8] via-white to-[#EEF6DA] p-4">
                <img
                  src={userProfile.avatarImage}
                  alt={userProfile.name}
                  className="h-20 w-20 rounded-[26px] object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-500">Level {gamification.currentLevel}</p>
                  <p className="mt-1 text-lg font-semibold leading-tight text-gray-800">
                    Consistency earns brighter milestones
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {statCards.map((item) => (
                  <div key={item.key} className="rounded-[22px] border border-gray-100 bg-[#FAFAFA] p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-800">{userProfile[item.key]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-24 pt-6">
              <div className="mb-6 rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Target size={18} className="text-[#7D9C6D]" />
                  <h3 className="text-lg font-bold text-gray-800">Progress Summary</h3>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                    <span className="font-medium">Completed challenges</span>
                    <span className="font-semibold text-gray-800">{userProfile.completedChallenges}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                    <span className="font-medium">Activities completed</span>
                    <span className="font-semibold text-gray-800">{userProfile.stats.activitiesCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                    <span className="font-medium">Diet plans followed</span>
                    <span className="font-semibold text-gray-800">{userProfile.stats.dietPlansFollowed}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] px-4 py-3">
                    <span className="font-medium">Challenge milestones</span>
                    <span className="font-semibold text-gray-800">{userProfile.stats.challengeMilestonesCompleted}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <Award size={18} className="text-[#7D9C6D]" />
                <h3 className="text-lg font-bold text-gray-800">Certificates</h3>
              </div>

              {unlockedCertificate ? (
                <div className="space-y-4">
                  <div className="rounded-[26px] border border-[#D9ECA2] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7D9C6D]">Unlocked</p>
                        <p className="mt-1 text-lg font-bold text-gray-800">{unlockedCertificate.title}</p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF6DA] text-[#7D9C6D]">
                        <ShieldCheck size={20} />
                      </div>
                    </div>

                    <Certificate
                      ref={certificateRef}
                      userName={userProfile.name}
                      title={unlockedCertificate.title}
                      awardedXp={unlockedCertificate.awardedXp}
                    />

                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="mt-4 w-full rounded-2xl bg-[#7D9C6D] py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#6b865d] disabled:cursor-not-allowed disabled:bg-[#b8c8b0]"
                    >
                      {isDownloading ? 'Preparing PDF...' : 'Download Certificate PDF'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-orange-500" />
                    <p className="text-base font-bold text-gray-800">{pendingCertificate.title}</p>
                  </div>

                  <div className="rounded-[22px] bg-[#FAFAFA] p-4">
                    <p className="text-sm font-medium leading-relaxed text-gray-600">
                      Unlock this certificate by reaching <span className="font-semibold text-gray-800">{pendingCertificate.requiredStreak} days streak</span> and
                      <span className="font-semibold text-gray-800"> {pendingCertificate.requiredXp} XP</span>.
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Current streak</span>
                        <span className="font-semibold text-gray-800">{userProfile.streakDays} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Current XP</span>
                        <span className="font-semibold text-gray-800">{userProfile.xp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-6">
              <button
                onClick={() => { onClose(); logout(); }}
                className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                Log Out
              </button>
            </div>

            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </MotionAside>
        </div>
      )}
    </AnimatePresence>
  );
}
