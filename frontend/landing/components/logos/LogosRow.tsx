const COMPANIES = [
  { initial: "S", name: "Sokoni Group" },
  { initial: "M", name: "Mara Holdings" },
  { initial: "T", name: "Tatu Foods" },
  { initial: "B", name: "Barabara Logistics" },
  { initial: "R", name: "Rift Valley Farms" },
  { initial: "N", name: "Nairobi Digital" },
];

export default function LogosRow() {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-9">
      <p className="text-[13px] text-ink-400 text-center mb-7 font-medium">
        Trusted by businesses across Kenya and East Africa
      </p>
      <div className="flex items-center justify-center gap-14 flex-wrap px-6">
        {COMPANIES.map(({ initial, name }) => (
          <div
            key={name}
            className="flex items-center gap-2 opacity-55 hover:opacity-80 transition-opacity"
          >
            <div className="w-[22px] h-[22px] rounded-[5px] bg-ink-200 flex items-center justify-center text-[10px] font-black text-ink-600 shrink-0">
              {initial}
            </div>
            <span className="text-[14px] font-bold text-ink-400 tracking-[-0.01em]">
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
