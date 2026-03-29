import { AnimatePresence, motion } from 'framer-motion';

const EMOTION_MAP = {
  welcoming: '/smile.png',
  friendly: '/smile.png',
  smile: '/smile.png',
  happy: '/happy.png',
  excited: '/excited.png',
  neutral: '/think.png',
  thinking: '/think.png',
  think: '/think.png',
  supportive: '/smile.png',
  concerned: '/sad.png',
  sad: '/sad.png',
  inactive: '/sad.png',
  cry: '/cry.png',
  sleep: '/sleep.png',
  sleepy: '/sleep.png',
  surprised: '/suprise.png',
  angry: '/anger.png',
};

const fallbackByContext = {
  onboarding: '/smile.png',
  coping: '/think.png',
  home: '/happy.png',
  general: '/smile.png',
};
const MotionImage = motion.img;

export default function Mascot({
  emotion = 'friendly',
  size = 112,
  context = 'general',
  className = '',
  priority = false,
}) {
  const source = EMOTION_MAP[emotion] ?? fallbackByContext[context] ?? fallbackByContext.general;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        <MotionImage
          key={source}
          src={source}
          alt={`${context} mascot`}
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="h-full w-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.12)]"
          loading={priority ? 'eager' : 'lazy'}
        />
      </AnimatePresence>
    </div>
  );
}
