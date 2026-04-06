import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Shield, BarChart2, DollarSign, Layers, ShieldOff,
  AlertOctagon, Rocket, Search, Brain, Zap, CheckCircle,
  ArrowRight, Plus, Minus, Star, Cpu, Eye, Settings,
  FileText, Map, Server, Globe, Lock, Clock, Key, X,
  Network, EyeOff, ShieldAlert, Activity
} from "lucide-react";
import { Layout } from "../../components/landing/Layout";
import { OrangeWaveBackground } from "../../components/landing/OrangeWaveBackground";
import { HeroDashboard, OversightMockup, PulseMockup, SpendMockup } from "../../components/landing/DashboardMockups";
import { RoleCarousel } from "../../components/landing/RoleCarousel";
import heroDashboard from "@/assets/hero-dashboard.png";

export const LandingPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 bg-transparent">
        <OrangeWaveBackground />

        <div className="max-w-4xl mx-auto text-center relative" style={{ zIndex: 1 }}>

          <div className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange bg-brand-orange/10 px-4 py-1.5 rounded-full mb-4">
            Enterprise AI Governance Platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark leading-tight mt-2">
            The System of Record for Enterprise AI
          </h1>

          <p className="text-xl md:text-2xl text-brand-gray font-medium mt-4">
            See Every Tool. Control Every Connection. Govern Every Risk.
          </p>

          <p className="text-base md:text-lg text-brand-gray max-w-2xl mx-auto mt-4 leading-relaxed">
            You can&apos;t govern what you can&apos;t see. Right now, developers and employees are adopting AI tools outside of IT&apos;s control. Devise changes that by delivering complete visibility at the OS level and ironclad intent enforcement at the agentic layer.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to="/login" className="border-2 border-brand-dark text-brand-dark rounded-full px-6 py-2.5 font-medium hover:bg-brand-dark hover:text-white transition-colors">
              Get Started
            </Link>
            <Link to="/demo" className="bg-brand-orange text-white rounded-full px-6 py-2.5 font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-brand-orange/20 flex items-center gap-2">
              Book a Demo <ArrowRight size={16} />
            </Link>
          </div>

        </div>

        {/* Hero Image */}
        <div className="mt-16 max-w-5xl mx-auto relative z-10 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-brand-purple rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <img src={heroDashboard} alt="Devise AI Tool Activity Dashboard" className="w-full" />
          </div>
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-700 rounded-xl shadow-heavy flex items-center justify-center text-white font-bold text-sm">XLS</div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-700 rounded-xl shadow-heavy flex items-center justify-center text-white font-bold text-sm">SAP</div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-red-600 rounded-xl shadow-heavy flex items-center justify-center text-white font-bold text-sm">INF</div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-xl shadow-heavy flex items-center justify-center text-white font-bold text-sm">OK</div>
        </div>
      </section>


      {/* Problem Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="inline-block px-3 py-1 mb-6 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">The Challenge</div>
        
        <div className="max-w-4xl mb-24">
          <h2 className="text-4xl md:text-[3.5rem] font-bold text-brand-dark leading-[1.1] mb-8 tracking-tight">
            Enterprise AI is now three problems at once
          </h2>
          <p className="text-brand-gray text-xl max-w-2xl leading-relaxed font-medium">
            Most organizations are attempting to solve a modern AI crisis with legacy monitoring tools. Emails and spreadsheets cannot track the high friction world of autonomous agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <EyeOff size={24} strokeWidth={1.5} />, 
              title: "The Visibility Gap", 
              desc: "71% of office workers use unsanctioned AI tools. IT is blind to IDE extensions, Python scripts, and direct API calls that bypass the browser.",
              stat: "269",
              statLabel: "Unmanaged tools per 1k employees",
              color: "text-red-500",
              glow: "bg-red-500"
            },
            { 
              icon: <ShieldAlert size={24} strokeWidth={1.5} />, 
              title: "The Enforcement Gap", 
              desc: "Visibility is not control. Detecting a connection doesn't stop prompt poisoning or sensitive data exfiltration to public LLM models.",
              stat: "20%",
              statLabel: "of breaches involve Shadow AI",
              color: "text-orange-500",
              glow: "bg-orange-500"
            },
            { 
              icon: <Network size={24} strokeWidth={1.5} />, 
              title: "The Agentic Explosion", 
              desc: "MCP is bypassing your IAM stack. AI agents are connecting to production databases and Slack using personal tokens with zero oversight.",
              stat: "10%",
              statLabel: "of public MCP servers are malicious",
              color: "text-purple-600",
              glow: "bg-purple-600"
            },
          ].map((item, i) => (
            <div key={i} className="relative group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-start overflow-hidden">
               {/* Abstract diagnostic lines */}
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                 <Activity size={80} strokeWidth={1} className={item.color} />
               </div>

               <div className={`mb-8 flex items-center w-full text-brand-dark/40 group-hover:${item.color} transition-colors duration-500`}>
                  <div className="transition-transform duration-500 group-hover:scale-110">
                     {item.icon}
                  </div>
                  <div className="h-px bg-gray-100 flex-grow mx-6" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                    Diagnostic {i + 1}
                  </span>
               </div>

               <h3 className="text-2xl font-bold text-brand-dark mb-4 transition-colors tracking-tight">
                 {item.title}
               </h3>
               <p className="text-brand-gray text-[15px] leading-relaxed mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                 {item.desc}
               </p>

               <div className="mt-auto pt-8 border-t border-gray-50 w-full flex items-baseline gap-2">
                 <span className={`text-4xl font-black ${item.color} tracking-tighter`}>{item.stat}</span>
                 <span className="text-[11px] font-bold text-brand-gray/60 uppercase tracking-wider leading-tight max-w-[120px]">
                   {item.statLabel}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Missing Link */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">The Missing Link in Your Stack</div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark max-w-3xl mx-auto leading-tight">
              We automate the high-friction work of AI governance, adoption, and spend.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Large feature card */}
            <div className="md:col-span-7 bg-brand-navy rounded-3xl p-8 md:p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-brand-orange" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">Oversight</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Integrated AI Visibility & Policy Enforcement</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">Detect every AI tool in real time, across browsers and desktop apps. Policy violations surface instantly.</p>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden h-52">
                  <OversightMockup />
                </div>
              </div>
            </div>

            {/* Stacked right cards */}
            <div className="md:col-span-5 flex flex-col gap-5">
              <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 shadow-soft group hover:shadow-heavy transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-brand-purple" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">Pulse</span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">Real-time AI Adoption Management</h3>
                <p className="text-brand-gray text-sm leading-relaxed">Track which teams are adopting AI, which tools are winning, and where your program needs attention.</p>
              </div>
              <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 shadow-soft group hover:shadow-heavy transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-brand-green" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green">Spend</span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">AI Cost & Subscription Intelligence</h3>
                <p className="text-brand-gray text-sm leading-relaxed">Map AI usage to subscriptions. Detect zombie licenses. Report ROI with real numbers.</p>
              </div>
            </div>

            {/* Full-width audit trail */}
            <div className="md:col-span-12 bg-brand-dark rounded-3xl p-8 md:p-10 text-white">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="md:w-1/3">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-brand-orange" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">Audit Trail</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live AI Monitoring</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Every AI interaction logged, timestamped, and mapped. Regulatory-ready from day one.</p>
                </div>
                <div className="md:w-2/3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
                  {[
                    { name: "Priya M.", tool: "ChatGPT", dept: "Engineering", time: "10:32 AM", badge: "ALERT" },
                    { name: "David R.", tool: "Copilot", dept: "Product", time: "10:28 AM", badge: "OK" },
                    { name: "Lin W.", tool: "Midjourney", dept: "Design", time: "10:15 AM", badge: "ALERT" },
                    { name: "Sam K.", tool: "Claude", dept: "Legal", time: "10:02 AM", badge: "OK" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[10px] font-bold">{item.name.charAt(0)}</div>
                        <div>
                          <span className="font-semibold block">{item.name}</span>
                          <span className="text-gray-500 text-[10px]">{item.dept}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 hidden md:block">{item.tool}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{item.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.badge === "ALERT" ? "bg-brand-orange/20 text-brand-orange" : "bg-green-500/15 text-green-400"}`}>{item.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">How It Works</div>
        <h2 className="text-4xl md:text-5xl font-bold text-center text-brand-dark mb-4 tracking-tight">See. Control. Govern.</h2>
        <p className="text-brand-gray text-lg text-center max-w-2xl px-4">
          Devise turns invisible AI usage into visible intelligence without changing how your teams work.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full">
          {[
            { num: "01", icon: <Server size={22} strokeWidth={1.5} />, title: "Deploy Everywhere", desc: "Push the lightweight executable via Jamf or Intune. Position the Gateway in your cloud environment. Complete rollout happens in minutes with absolutely zero employee friction.", hoverColor: "text-blue-500", glowColor: "bg-blue-500" },
            { num: "02", icon: <Eye size={22} strokeWidth={1.5} />, title: "Observe Every Layer", desc: "The endpoint agent identifies deep process attribution for every API transaction while the browser extension captures web sessions. Every standalone tool interaction is logged continuously.", hoverColor: "text-orange-500", glowColor: "bg-orange-500" },
            { num: "03", icon: <Lock size={22} strokeWidth={1.5} />, title: "Enforce Security", desc: "The gateway proxies every Model Context Protocol connection verifying authentication and scanning all payloads for prompt poisoning or data exfiltration in real time.", hoverColor: "text-emerald-500", glowColor: "bg-emerald-500" },
            { num: "04", icon: <Layers size={22} strokeWidth={1.5} />, title: "Govern Completely", desc: "Specialized views equip leadership with definitive metrics on shadow application utilization unused licenses and risk exposure across the entire organization.", hoverColor: "text-purple-600", glowColor: "bg-purple-600" },
          ].map((step, i) => (
            <div key={i} className="relative group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col items-start w-full cursor-default">
               {/* Extremely understated glow */}
               <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none rounded-2xl ${step.glowColor}`} />
               
               {/* Sleek structural header instead of a colored box */}
               <div className={`mb-6 flex items-center w-full text-brand-dark/50 group-hover:${step.hoverColor} transition-all duration-500`}>
                  <div className="transition-transform duration-500 group-hover:-translate-y-1">
                     {step.icon}
                  </div>
                  <div className="h-px bg-gray-100 flex-grow mx-4 group-hover:opacity-30 transition-opacity" />
                  <span className="text-[10px] font-bold tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                     PHASE {step.num}
                  </span>
               </div>

               <h3 className="text-[17px] font-bold text-brand-dark mb-3 relative z-10 w-full tracking-tight">
                 {step.title}
               </h3>
               <p className="text-brand-gray text-[14px] leading-relaxed relative z-10 font-medium">
                 {step.desc}
               </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: "80%", label: "of employees use unapproved AI tools" },
            { num: "86%", label: "of orgs are blind to AI data flows" },
            { num: "30%+", label: "of AI budget wasted on unused licenses" },
            { num: "3,500+", label: "AI tools detected automatically" },
          ].map((stat) => (
            <div key={stat.num} className="bg-white rounded-2xl shadow-md p-6 lg:p-8 text-center border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-orange tracking-tight whitespace-nowrap">{stat.num}</div>
              <p className="text-sm text-brand-gray mt-3 max-w-[140px] mx-auto leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Modules */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">The Solution</div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 max-w-2xl">One deployment. Complete visibility.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <ModuleCard
            tag="Devise Oversight"
            title="AI Governance & Risk Intelligence"
            desc="Surface policy exposure and compliance gaps using real behavioral data — not questionnaires."
            borderColor="border-l-brand-orange"
            tagBg="bg-orange-50"
            tagText="text-brand-orange"
            accentColor="text-brand-orange"
            items={["Complete visibility into AI data flows", "OWASP / NIST / RMF framework mapping", "Shadow AI detection", "Defensible audit trail", "Real-time Slack & email alerts"]}
            ctaText="Get a Demo →"
            ctaLink="/demo"
          />
          <ModuleCard
            tag="Devise Pulse"
            title="AI Adoption Intelligence"
            desc="Replace stale surveys with real behavioral data about how AI is actually being adopted across your organization."
            borderColor="border-l-brand-purple"
            tagBg="bg-purple-50"
            tagText="text-brand-purple"
            accentColor="text-brand-purple"
            items={["Adoption rate by team and department", "Power user identification", "Tool preference tracking", "Training gap surfacing", "Weekly executive reports"]}
            ctaText="Learn more →"
            ctaLink="/product/pulse"
          />
          <ModuleCard
            tag="Devise Spend"
            title="AI Cost Intelligence"
            desc="Connect actual usage to subscription costs. Eliminate zombie licenses and duplicate spend. Justify AI ROI."
            borderColor="border-l-brand-green"
            tagBg="bg-green-50"
            tagText="text-brand-green"
            accentColor="text-brand-green"
          items={["Centralized subscription view", "Zombie license detection", "Duplicate subscription flagging", "Cost attribution by team", "Budget forecasting"]}
            ctaText="Learn more →"
            ctaLink="/product/spend"
          />
        </div>
      </section>

      {/* Role Carousel Redesign */}
      <section className="w-full min-h-[95vh] py-20 flex flex-col justify-center items-center relative bg-white">
        <RoleCarousel />
      </section>

      {/* Enterprise Ready */}
      <section className="bg-white py-12 md:py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-10 mb-10 max-w-6xl mx-auto">
            <div className="md:w-1/2 text-left">
              <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">Enterprise Ready</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark leading-tight">Built for enterprise requirements</h2>
            </div>
            <div className="md:w-1/2 md:pt-6 text-left">
              <p className="text-brand-gray text-base md:text-lg leading-relaxed">
                Deploy with confidence. Meet SOC 2, GDPR, and DPDP Act obligations. Maintain complete control over your AI data flows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              { icon: <Key size={20} />, title: "SSO & SCIM Integration", desc: "Works seamlessly with Okta, Microsoft Entra, and your existing identity stack for role-based access and automated offboarding." },
              { icon: <Server size={20} />, title: "Flexible Deployment", desc: "Choose our managed cloud or keep all data entirely within your own infrastructure using our Docker/Helm self-hosted option." },
              { icon: <Globe size={20} />, title: "Global Compliance", desc: "Engineered to support your SOC 2 Type II, GDPR, HIPAA, and India DPDP Act compliance audits from day one." },
              { icon: <ShieldOff size={20} />, title: "Zero Content Capture", desc: "Privacy by design. Devise Eye monitors network metadata and process attribution only. Your proprietary prompt content is never captured." },
              { icon: <Lock size={20} />, title: "Enterprise Encryption", desc: "All telemetry and audit data is secured with AES-256 encryption at rest and TLS 1.3 in transit, backed by per-tenant KMS." },
              { icon: <Clock size={20} />, title: "Configurable Retention", desc: "Set automated data retention policies and comprehensive audit log exports to match your organization's specific legal requirements." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft hover:shadow-heavy transition-all duration-300 group flex flex-col justify-center">
                <div className="relative inline-flex items-center justify-center mb-5 mt-1 ml-1 w-fit">
                  <div className="absolute inset-x-[-8px] inset-y-[-8px] border-[1.5px] border-dashed border-brand-orange/40 rounded-full group-hover:rotate-180 transition-transform duration-1000 ease-in-out" />
                  <div className="absolute inset-x-[-4px] inset-y-[-4px] border border-brand-orange/30 rounded-full bg-brand-orange/5" />
                  <div className="relative w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/30">
                    {item.icon}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-brand-dark mb-2">{item.title}</h4>
                <p className="text-brand-gray text-sm leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 w-full max-w-6xl mx-auto">
            {[
              { text: "SOC 2 Type II Ready", icon: <Shield size={16} /> },
              { text: "DPDP Act Compliant", icon: <Globe size={16} /> },
              { text: "Okta & Entra SSO", icon: <Key size={16} /> },
              { text: "Self-Host Option", icon: <Server size={16} /> },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white border border-gray-200 shadow-sm rounded-full py-2 px-5 group hover:border-brand-orange/50 hover:bg-orange-50/30 hover:shadow-md transition-all duration-300 cursor-default">
                <span className="text-brand-orange group-hover:scale-110 transition-transform duration-300">
                  {badge.icon}
                </span>
                <span className="text-[13px] font-bold text-brand-dark">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Devise Comparison */}
      <section className="bg-[#FAF9F5] py-24 px-6 relative z-10 border-t border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">Why Devise</div>
          <h2 className="text-4xl font-bold text-brand-dark mb-4">The only platform built for the OS layer</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto mb-12">
            Competitors monitor the network or the browser. Devise sits at the OS level—the only place you can see exactly which process initiated an AI call without capturing sensitive prompt content.
          </p>

          <div className="overflow-x-auto rounded-[2rem] shadow-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-brand-orange text-white">
                  <th className="py-7 px-8 font-semibold text-sm uppercase tracking-wide border-b border-orange-600">Enterprise Capability</th>
                  <th className="py-7 px-8 font-semibold text-sm uppercase tracking-wide border-b border-orange-600 bg-orange-600/80 text-center relative w-1/4">
                    Devise
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-brand-orange text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap">
                      <Star size={10} fill="currentColor" /> OS-Level Agent
                    </div>
                  </th>
                  <th className="py-7 px-6 font-semibold text-sm uppercase tracking-wide border-b border-orange-600 text-center w-48">Network Proxies</th>
                  <th className="py-7 px-6 font-semibold text-sm uppercase tracking-wide border-b border-orange-600 text-center w-48">Browser Ext.</th>
                  <th className="py-7 px-6 font-semibold text-sm uppercase tracking-wide border-b border-orange-600 text-center w-48">Cloud Security</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { feature: "OS-Level Process Attribution", devise: "yes", proxy: "no", browser: "no", cloud: "no" },
                  { feature: "MCP Protocol Visibility & Control", devise: "yes", proxy: "no", browser: "no", cloud: "partial" },
                  { feature: "Zero Content Capture (Privacy By Design)", devise: "yes", proxy: "no", browser: "no", cloud: "partial" },
                  { feature: "Detects Non-Browser Desktop AI", devise: "yes", proxy: "yes", browser: "no", cloud: "partial" },
                  { feature: "No Network Routing Changes Required", devise: "yes", proxy: "no", browser: "yes", cloud: "yes" },
                  { feature: "Zombie SaaS License / Spend Discovery", devise: "yes", proxy: "partial", browser: "no", cloud: "partial" },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 border-y border-gray-50"}>
                    <td className="py-5 px-8 font-semibold text-brand-dark text-[15px] border-r border-gray-100 relative">
                      {row.feature}
                    </td>
                    <td className="py-5 px-6 text-center border-r border-gray-100 bg-orange-50/40 relative">
                      <CheckCircle className="text-green-500 w-5 h-5 mx-auto" strokeWidth={2.5} />
                    </td>
                    <td className="py-5 px-6 text-center border-r border-gray-100">
                      {row.proxy === "no" ? <X className="text-red-400/70 w-5 h-5 mx-auto" /> : row.proxy === "yes" ? <CheckCircle className="text-green-500 w-5 h-5 mx-auto" /> : <Minus className="text-gray-300 w-5 h-5 mx-auto" />}
                    </td>
                    <td className="py-5 px-6 text-center border-r border-gray-100">
                      {row.browser === "no" ? <X className="text-red-400/70 w-5 h-5 mx-auto" /> : row.browser === "yes" ? <CheckCircle className="text-green-500 w-5 h-5 mx-auto" /> : <Minus className="text-gray-300 w-5 h-5 mx-auto" />}
                    </td>
                    <td className="py-5 px-6 text-center">
                      {row.cloud === "no" ? <X className="text-red-400/70 w-5 h-5 mx-auto" /> : row.cloud === "yes" ? <CheckCircle className="text-green-500 w-5 h-5 mx-auto" /> : <Minus className="text-gray-300 w-5 h-5 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-12 px-6 bg-white relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-brand-orange/[0.03] rounded-bl-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-12 items-start relative z-10 w-full">
          {/* Left Column */}
          <div className="md:w-5/12 md:sticky md:top-24">
            <div className="inline-block px-3 py-1 mb-4 rounded bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest shadow-sm">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight leading-[1.1] mb-3">
              Answers to your questions.
            </h2>
            <p className="text-brand-gray text-base leading-relaxed mb-5 max-w-sm">
              We've collected the most common questions about Devise. Can't find what you're looking for? 
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 text-brand-orange font-bold hover:text-orange-600 transition-colors group text-sm">
              Chat with our team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Column */}
          <div className="md:w-7/12 w-full mt-2 md:mt-0">
            <Accordion.Root type="single" collapsible className="flex flex-col gap-2">
              {[
                { value: "q1", q: "What is Devise?", a: "Devise is an enterprise AI governance platform that installs a lightweight agent on employee devices to detect every AI tool in use — and turns that usage into security, compliance, adoption, and cost intelligence." },
                { value: "q2", q: "How does it work?", a: "A browser extension and desktop agent monitor AI tool usage at the network and navigation layer. No conversation content is ever captured — only which tool was used, by whom, and when. Events flow into the Devise dashboard in real time." },
                { value: "q3", q: "What data does it collect?", a: "Tool name, domain, user identity, department, timestamp, and source (browser or desktop). We deliberately never capture conversation content, keystrokes, clipboard data, or any user-generated input." },
                { value: "q4", q: "Is it legal?", a: "Yes. Monitoring company-owned devices with employee disclosure is lawful under GDPR and applicable labour law. Devise is SOC 2 Type I certified and architected for GDPR compliance." },
                { value: "q5", q: "How do I get support?", a: "Email us at support@devise.ai or book a demo to speak directly with our team." },
              ].map((faq) => (
                <Accordion.Item 
                  key={faq.value} 
                  value={faq.value} 
                  className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:border-brand-orange/20 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-brand-orange/30 data-[state=open]:ring-1 data-[state=open]:ring-brand-orange/5 group"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between p-4 px-5 text-left font-bold text-brand-dark text-sm hover:text-brand-orange transition-colors outline-none cursor-pointer">
                      {faq.q}
                      <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors shrink-0 ml-4 group-data-[state=open]:bg-brand-orange/10 group-data-[state=open]:rotate-180 duration-500">
                        <Plus className="text-gray-400 group-hover:text-brand-orange w-3.5 h-3.5 group-data-[state=open]:hidden transition-colors" />
                        <Minus className="text-brand-orange w-3.5 h-3.5 group-data-[state=closed]:hidden transition-colors" />
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="text-brand-gray text-[13px] leading-relaxed px-5 pb-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="pt-2 border-t border-gray-50">
                      <p>{faq.a}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-48 px-6 bg-white flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl md:text-7xl lg:text-[88px] font-black text-brand-dark tracking-tighter leading-[0.95] mb-8 max-w-5xl">
          Ready to govern your <br className="hidden md:block"/>
          <span className="text-brand-orange">AI landscape?</span>
        </h2>
        <p className="text-brand-gray font-medium text-xl md:text-2xl max-w-2xl mb-12 leading-snug">
          Join 200+ enterprise teams using Devise to surface every AI tool and turn invisible usage into intelligence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link to="/login" className="bg-brand-dark text-white rounded-full px-10 py-4 font-bold text-lg hover:bg-black transition-transform hover:-translate-y-1 shadow-xl shadow-brand-dark/10">
            Get Started Free
          </Link>
          <Link to="/demo" className="bg-white text-brand-dark border-2 border-brand-dark rounded-full px-10 py-4 font-bold text-lg hover:bg-gray-50 transition-transform hover:-translate-y-1">
            Book a Demo
          </Link>
        </div>
      </section>

    </Layout>
  );
};

const ModuleCard = ({ tag, title, desc, borderColor, tagBg, tagText, accentColor, items, ctaText, ctaLink }: {
  tag: string; title: string; desc: string; borderColor: string; tagBg: string; tagText: string; accentColor: string; items: string[]; ctaText: string; ctaLink?: string;
}) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg border-l-4 ${borderColor} hover:shadow-heavy transition-all`}>
    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${tagBg} ${tagText}`}>
      {tag}
    </div>
    <h3 className="text-2xl font-bold text-brand-dark mb-4">{title}</h3>
    <p className="text-brand-gray text-sm mb-8 leading-relaxed">{desc}</p>
    <ul className="space-y-4 mb-8">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm font-medium text-brand-dark">
          <CheckCircle className={`${accentColor} shrink-0`} size={18} />
          {item}
        </li>
      ))}
    </ul>
    {ctaLink ? (
      <Link to={ctaLink} className={`font-bold ${accentColor} flex items-center gap-2 hover:translate-x-1 transition-transform`}>
        {ctaText}
      </Link>
    ) : (
      <button className={`font-bold ${accentColor} flex items-center gap-2 hover:translate-x-1 transition-transform`}>
        {ctaText}
      </button>
    )}
  </div>
);
