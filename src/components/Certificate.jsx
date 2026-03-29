import { forwardRef } from 'react';

const cursiveStyle = {
  fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
};

const serifStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const cornerLeaves = [
  'left-[-24px] top-[-26px] rotate-[-16deg]',
  'right-[-20px] top-[-30px] rotate-[18deg]',
  'left-[-18px] bottom-[-28px] rotate-[22deg]',
  'right-[-26px] bottom-[-24px] rotate-[-18deg]',
];

function DecorativeLeaves({ className }) {
  return (
    <div className={`absolute flex gap-1 opacity-90 ${className}`}>
      {['bg-[#284B84]', 'bg-[#D4AF37]', 'bg-[#6885B8]'].map((color, index) => (
        <span
          key={color + index}
          className={`h-14 w-5 rounded-full ${color}`}
          style={{
            transform: `rotate(${index === 0 ? -25 : index === 1 ? 8 : 28}deg)`,
            borderRadius: '100% 0 100% 0',
          }}
        />
      ))}
    </div>
  );
}

const Certificate = forwardRef(function Certificate(
  { userName, title, awardedXp },
  ref,
) {
  return (
    <div
      ref={ref}
      className="relative aspect-[1.45/1] w-full overflow-hidden rounded-[26px] bg-[#fffdfa] p-5 text-center shadow-[0_16px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="absolute inset-3 rounded-[20px] border-[3px] border-[#D4AF37]" />
      <div className="absolute inset-5 rounded-[16px] border border-[#D4AF37]/60" />

      <div className="absolute left-0 top-0 h-24 w-24 border-l-[18px] border-t-[18px] border-[#284B84]" />
      <div className="absolute right-0 top-0 h-24 w-24 border-r-[18px] border-t-[18px] border-[#D4AF37]" />
      <div className="absolute bottom-0 left-0 h-24 w-24 border-b-[18px] border-l-[18px] border-[#D4AF37]" />
      <div className="absolute bottom-0 right-0 h-24 w-24 border-b-[18px] border-r-[18px] border-[#284B84]" />

      {cornerLeaves.map((position, index) => (
        <DecorativeLeaves key={position + index} className={position} />
      ))}

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-3 text-[#16345F]">
        <div>
          <p style={serifStyle} className="text-[2.15rem] font-semibold tracking-[0.22em] text-[#111827]">
            CERTIFICATE
          </p>
          <p style={serifStyle} className="mt-1 text-lg tracking-[0.22em] text-[#284B84]">
            OF RECOGNITION
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#4B5563]">
            This award is proudly presented to
          </p>
          <p
            style={cursiveStyle}
            className="mt-3 text-[3.1rem] leading-none text-[#21487F]"
          >
            {userName}
          </p>
          <div className="mx-auto mt-3 h-px w-4/5 bg-[#D4AF37]" />
          <p className="mx-auto mt-4 max-w-[90%] text-sm leading-relaxed text-[#374151]">
            For successfully completing the <span className="font-semibold">{title}</span> and earning
            <span className="font-semibold"> {awardedXp} XP</span> through consistent recovery actions.
          </p>
        </div>

        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex-1 text-left">
            <div className="mb-2 h-px w-28 bg-[#D4AF37]" />
            <p className="text-sm font-semibold tracking-[0.18em] text-[#21487F]">SECOND CHANCE</p>
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#6B7280]">Recovery Team</p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#D4AF37] bg-[#21487F] text-white shadow-lg">
            <div className="rounded-full border border-white/60 px-2 py-1 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em]">Best</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Award</p>
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="mb-2 ml-auto h-px w-28 bg-[#D4AF37]" />
            <p className="text-sm font-semibold tracking-[0.18em] text-[#21487F]">30 Day Milestone</p>
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#6B7280]">Achievement Date</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Certificate;
