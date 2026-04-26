export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white text-lg">🤝</span>
              </div>
              <span className="text-white font-bold text-lg">
                Community<span className="text-emerald-400">Pulse</span>
              </span>
            </div>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed text-center">
              Smart Resource Allocation platform that transforms scattered
              community data into actionable insights. Connecting volunteers
              with communities through intelligent matching.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            © 2026 CommunityPulse. Smart Resource Allocation for Social Impact.
          </p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs">
              API Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
