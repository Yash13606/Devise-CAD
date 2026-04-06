import React, { useState, useEffect } from 'react';
import { AlertOctagon, BarChart2, Brain, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

const slideData = [
  {
    id: 0,
    roleTitle: "IT & Security Leaders",
    desc: "Protect your network from shadow AI while safely enabling agentic MCP workflows.",
    cards: [
      {
        cardTitle: "Startup CTO",
        cardSubtitle: "CTO / VP Eng (Series A—C)",
        quote: "“I was asked about our AI data policy in a SOC 2 audit. I had no visibility and no answer.”",
        action: "Discover what tools your teams actually use and securely adopt AI without stray enterprise licenses.",
        insightType: "DISCOVERED",
        insightIcon: <Share2 className="w-4 h-4 text-brand-orange" />,
        insightTitle: "Cursor IDE detected connecting via MCP",
        insightDesc: "Unverified server blocked instantly via Devise Gate."
      },
      {
        cardTitle: "Enterprise CISO",
        cardSubtitle: "Mid-Market Security Leaders",
        quote: "“Network proxies are blind to OS-level python scripts and agent protocols. We're flying blind.”",
        action: "Deploy the OS agent to map your shadow attack surface without touching prompt content.",
        insightType: "ALERT — HIGH RISK",
        insightIcon: <AlertOctagon className="w-4 h-4 text-red-500" />,
        insightTitle: "python3.exe calling api.openai.com",
        insightDesc: "14 engineer laptops bypassing corporate IAM."
      }
    ]
  },
  {
    id: 1,
    roleTitle: "Finance & AI Leaders",
    desc: "Connect OS-level usage telemetry to subscriptions to eliminate waste and measure real adoption.",
    cards: [
      {
        cardTitle: "VP of Finance",
        cardSubtitle: "Managing SaaS & Cloud Spend",
        quote: "“We're bleeding money on overlapping Copilot and Jasper licenses that nobody actually uses.”",
        action: "Automatically map zombie licenses and calculate true ROI using real system-level execution data.",
        insightType: "BENCHMARK",
        insightIcon: <BarChart2 className="w-4 h-4 text-brand-orange" />,
        insightTitle: "43% of Copilot licenses are inactive",
        insightDesc: "Potential savings identified: $12,500/month."
      },
      {
        cardTitle: "Head of AI",
        cardSubtitle: "Enterprise Transformation Leaders",
        quote: "“I need to prove our AI adoption is actually moving the needle for engineering velocity.”",
        action: "Track behavioral adoption across departments, find power users, standardize what works.",
        insightType: "INSIGHT",
        insightIcon: <Brain className="w-4 h-4 text-brand-purple" />,
        insightTitle: "Engineering adoption reached 82%",
        insightDesc: "Marketing stuck at 15%. Targeted training recommended."
      }
    ]
  }
];

export const RoleCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const dataLength = slideData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % dataLength);
    }, 4000);
    return () => clearInterval(interval);
  }, [dataLength]);

  const handleNext = () => setActiveIndex((current) => (current + 1) % dataLength);
  const handlePrev = () => setActiveIndex((current) => (current - 1 + dataLength) % dataLength);

  return (
    <div
      className="w-full px-6 max-w-7xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col bg-transparent overflow-visible">

        {/* TOP: Header Row */}
        <div className="flex flex-col md:flex-row px-0 md:px-4 py-8 items-start md:items-center relative bg-transparent z-20">

          {/* Left: Pill + Animated Title */}
          <div className="md:w-[55%] flex flex-col justify-center">
            <span className="inline-block mb-3 px-3 py-1 rounded bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest w-fit shadow-sm">
              WHO IT'S FOR
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-medium font-display text-brand-dark tracking-tight leading-none">
                Built for
              </span>
              <div className="overflow-hidden h-[36px] md:h-[40px] relative mt-1">
                <div
                  className="transition-transform duration-1000 ease-[cubic-bezier(0.4, 0, 0.2, 1)] flex flex-col"
                  style={{ 
                    transform: `translateY(-${(activeIndex * 100) / slideData.length}%)`,
                    height: `${slideData.length * 100}%`
                  }}
                >
                  {slideData.map((slide) => (
                    <div
                      key={slide.id}
                      className="flex items-center text-3xl md:text-4xl font-medium text-brand-orange font-display tracking-tight shrink-0 leading-none"
                      style={{ height: `${100 / slideData.length}%` }}
                    >
                      {slide.roleTitle}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Fading Description */}
          <div className="md:w-[45%] relative h-[50px] hidden md:flex items-center pl-10">
            {slideData.map((slide, idx) => (
              <p
                key={slide.id}
                className={`absolute left-10 right-0 text-brand-gray text-[15px] leading-relaxed transition-opacity duration-500 ${idx === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {slide.desc}
              </p>
            ))}
          </div>
        </div>

        {/* MIDDLE: Sliding Cards */}
        <div className="relative overflow-hidden w-full bg-transparent mt-8">
          <div
            className="flex transition-transform duration-1000 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
            style={{ 
              transform: `translateX(-${(activeIndex * 100) / slideData.length}%)`,
              width: `${slideData.length * 100}%`
            }}
          >
            {slideData.map((slide) => (
              <div key={slide.id} className="shrink-0 flex flex-col md:flex-row" style={{ width: `${100 / slideData.length}%` }}>
                {slide.cards.map((card, cIndex) => (
                  <div
                    key={cIndex}
                    className={`flex-1 flex flex-col justify-between px-8 md:px-10 py-10 md:py-12 gap-5 bg-white rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-heavy transition-all duration-500 mx-4`}
                  >
                    {/* Card Header */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-display tracking-tight text-[#3b322a] mb-1.5">{card.cardTitle}</h3>
                      <p className="text-[12px] md:text-sm font-semibold text-gray-400 mb-5 tracking-wide uppercase">{card.cardSubtitle}</p>
                      <p className="text-[#645e58] font-medium italic text-[14px] md:text-[15px] leading-relaxed mb-5">
                        {card.quote}
                      </p>
                      <p className="text-brand-orange font-bold text-[14px] leading-relaxed max-w-[90%]">
                        {card.action}
                      </p>
                    </div>

                    {/* Insight Box */}
                    <div className="bg-gray-50/50 rounded-[16px] px-5 pt-8 pb-5 mt-6 border border-gray-100 relative hover:bg-white hover:shadow-sm transition-all duration-300">
                      <span className="absolute top-3 left-4 text-[9px] font-black tracking-widest uppercase text-[#54A28A]">
                        {card.insightType}
                      </span>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          {card.insightIcon}
                        </div>
                        <div className="mt-0.5">
                          <h4 className="font-bold text-gray-900 text-[13px] md:text-[14px] mb-1 tracking-tight leading-snug">{card.insightTitle}</h4>
                          <p className="text-gray-500 text-[12px] md:text-[13px] leading-relaxed">{card.insightDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Controls */}
        <div className="bg-transparent px-8 py-8 flex justify-center gap-4 z-10">
          <button onClick={handlePrev} aria-label="Previous" className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 hover:text-brand-dark active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            {slideData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-brand-orange w-8' : 'bg-gray-300 w-2.5 hover:bg-gray-400'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button onClick={handleNext} aria-label="Next" className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 hover:text-brand-dark active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
