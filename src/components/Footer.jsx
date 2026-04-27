export default function Footer() {
  return (
    <footer className="bg-surface border-t border-primary/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 bg-hero-grad rounded-[1rem] flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white text-xl">🤝</span>
            </div>
            <span className="text-slate-dark font-heading font-bold text-xl tracking-tight">
              Community<span className="text-primary">Pulse</span>
            </span>
          </div>

          {/* Mission Statement */}
          <p className="text-slate-dark/40 max-w-xl text-sm font-medium leading-relaxed mb-10">
            A Smart Resource Allocation platform designed to bridge the gap 
            between scattered community data and meaningful action. 
            Empowering change through intelligent matching and data-driven empathy.
          </p>

          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-dark/20 text-[10px] font-bold uppercase tracking-widest">
            © 2026 CommunityPulse. Designed for Social Impact.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-dark/20 hover:text-slate-dark/40 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-dark/20 hover:text-slate-dark/40 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Terms of Service
            </a>
            <div className="h-4 w-px bg-primary/10 hidden md:block" />
            <a href="#" className="flex items-center gap-2 text-primary/60 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CP Version v1.0 Live
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}