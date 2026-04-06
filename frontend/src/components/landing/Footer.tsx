import { Link } from "react-router-dom";
import { Grid2x2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-6 relative overflow-hidden flex flex-col justify-between">
      <div className="max-w-7xl mx-auto relative z-10 w-full mt-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12 md:mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-5">
              <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                <Grid2x2 className="text-white w-5 h-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-white tracking-wide">Devise</span>
            </div>
            <p className="text-gray-400 max-w-sm text-balance leading-relaxed text-sm">
              See, understand, and govern enterprise AI. The system of record for the AI-first organization.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest text-brand-orange">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/product/oversight" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Oversight</Link></li>
              <li><Link to="/product/pulse" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Pulse</Link></li>
              <li><Link to="/product/spend" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Spend</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest text-brand-orange">Use Cases</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/use-cases" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Adoption Scoreboard</Link></li>
              <li><Link to="/use-cases" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Confidential Data Risks</Link></li>
              <li><Link to="/use-cases" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Did Your Deployment Work?</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest text-brand-orange">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">About</Link></li>
              <li><Link to="/login" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Sign in</Link></li>
              <li><Link to="/signup" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Create account</Link></li>
              <li><span className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200 cursor-pointer">Security</span></li>
              <li><span className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200 cursor-pointer">Careers</span></li>
              <li><span className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200 cursor-pointer">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-medium">
          <div>© {new Date().getFullYear()} Devise, Inc. · SOC 2 · GDPR</div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors hover:underline underline-offset-4">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors hover:underline underline-offset-4">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors hover:underline underline-offset-4">Cookies</span>
          </div>
        </div>
      </div>

      {/* Large background text */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] md:bottom-[-10px] font-black tracking-[0.02em] pointer-events-none select-none text-center z-0 w-full flex justify-center overflow-hidden bg-gradient-to-b from-[#FFFAFA]/15 to-transparent bg-clip-text text-transparent"
        style={{
          fontSize: 'clamp(5rem, 15vw, 14rem)',
          lineHeight: '0.75'
        }}
      >
        DEVISE
      </div>
    </footer>
  );
};
