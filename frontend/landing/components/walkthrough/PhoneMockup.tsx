interface PhoneMockupProps {
  children: React.ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 280, height: 580 }}
      role="img"
      aria-label="Mobile phone showing AndikishaHR employee portal"
    >
      {/* Outer bezel.
          token-exempt: device-frame greys (#1a1a1a / #111 / #2a2a2a) are
          illustrative hardware chrome, not brand colours — no token applies. */}
      <div
        className="absolute inset-0 rounded-[38px] bg-[#1a1a1a] shadow-[0_24px_60px_rgba(7,30,19,0.3)]"
      />
      {/* Inner frame */}
      <div className="absolute inset-[3px] rounded-[35px] bg-[#111] overflow-hidden">
        {/* Screen area */}
        <div className="absolute inset-[6px] rounded-[30px] overflow-hidden bg-white">
          {children}
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute right-[-3px] top-[100px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-r-sm" />
      <div className="absolute left-[-3px] top-[90px] w-[3px] h-[28px] bg-[#2a2a2a] rounded-l-sm" />
      <div className="absolute left-[-3px] top-[128px] w-[3px] h-[28px] bg-[#2a2a2a] rounded-l-sm" />
    </div>
  );
}
