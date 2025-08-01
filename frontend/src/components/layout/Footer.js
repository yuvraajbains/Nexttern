import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-10 flex flex-col items-center bg-gradient-to-b from-[#232526] via-[#232526]/80 to-[#1a1a1a] text-white relative overflow-hidden">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 blur-2xl opacity-30 pointer-events-none select-none" style={{zIndex:0}}>
        <div className="w-96 h-32 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 rounded-full animate-pulse" />
      </div>
      <div className="w-full max-w-6xl px-4 mb-8 z-10">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img src="/NextternLogo.png" alt="Nexttern Logo" className="w-10 h-10 rounded-xl shadow-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#b993fe] via-[#f9f9f9] to-[#6dd5fa] bg-clip-text text-transparent tracking-wide animate-gradient-x">Nexttern</span>
          </div>
          {/* Connect */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/nexttern.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-gray-800 z-10">
        <div className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0 flex items-center space-x-2">
            <svg className="w-4 h-4 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2a1 1 0 00-.97.757l-2.5 10A1 1 0 0011 14h2.382l-1.053 5.263a1 1 0 001.97.474l2.5-10A1 1 0 0015 10h-2.382l1.053-5.263A1 1 0 0013.5 2z" /></svg>
            <span>© {new Date().getFullYear()} <span className="font-semibold text-gradient bg-gradient-to-r from-[#b993fe] to-[#6dd5fa] bg-clip-text text-transparent">Nexttern</span>. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}