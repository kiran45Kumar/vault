import { useState } from "react";
import { ShieldCheck, Lock, Cloud, ArrowRight, Menu, X } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

export default function VaultLanding() {
    const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-black text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 border-b border-gray-800 relative">
        <h1 className="text-lg md:text-xl font-bold">Vault</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-gray-300">
          <a href="#" className="hover:text-white">Features</a>
          <a href="#" className="hover:text-white">Security</a>
          <a href="#" className="hover:text-white">Pricing</a>
        </div>

        {/* Desktop Button */}
        <button onClick={()=>{navigate('/login')}} className="hidden md:block bg-white text-black px-4 py-2 rounded-lg font-medium hover:scale-105 transition">
          Login
        </button>

        {/* Mobile Menu Icon */}
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>

        {/* Mobile Dropdown */}
        {open && (
          <div className="absolute top-full left-0 w-full bg-black border-t border-gray-800 flex flex-col items-center gap-6 py-6 md:hidden z-50">
            <a href="#">Features</a>
            <a href="#">Security</a>
            <a href="#">Pricing</a>
            <button onClick={()=>{navigate('/login')}} className="bg-white text-black px-6 py-2 rounded-lg">
              Login
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="text-center px-5 md:px-10 py-16 md:py-24">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
          Store Your Files <br />
          <span className="text-gray-400">Secure. Private. Fast.</span>
        </h2>

        <p className="mt-5 text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
          Vault keeps your documents encrypted and accessible anytime.
          Built for speed, designed for privacy.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={()=>{navigate('/login')}} className="bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition">
            Get Started <ArrowRight size={18} />
          </button>

          <button onClick={()=>{navigate('/login')}} className="border border-gray-700 px-6 py-3 rounded-xl hover:bg-gray-900 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5 md:px-12 py-16">
        <div className="bg-gray-900 p-6 rounded-2xl hover:shadow-xl transition">
          <ShieldCheck className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
          <p className="text-gray-400 text-sm">
            Your files are encrypted before they leave your device.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl hover:shadow-xl transition">
          <Cloud className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cloud Sync</h3>
          <p className="text-gray-400 text-sm">
            Access your files anytime, anywhere across devices.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl hover:shadow-xl transition">
          <Lock className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
          <p className="text-gray-400 text-sm">
            Multi-layer authentication ensures only you can access.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-5 py-16 md:py-20 border-t border-gray-800">
        <h2 className="text-2xl md:text-3xl font-bold">
          Ready to secure your data?
        </h2>

        <button onClick={()=>{navigate('/login')}} className="mt-6 bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition">
          Start Free
        </button>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-xs sm:text-sm py-6 border-t border-gray-800 px-4">
        © 2026 Vault. All rights reserved.
      </footer>
    </div>
  );
}