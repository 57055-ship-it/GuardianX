import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, AlertTriangle, Smartphone, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">
              GUARDIAN<span className="text-indigo-500">X</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Shield className="w-4 h-4" /> Next-Gen SaaS Platform for Child Digital Wellbeing
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Safer Digital Lives for Your Family with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">GuardianX</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitor live locations, enforce safe geofence boundaries, receive instant emergency SOS alerts, and guide your child's digital wellbeing with explainable safety scores.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full" icon={<ArrowRight className="w-5 h-5" />}>
              Create Parent Account
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Parent Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100">Complete Family Protection Features</h2>
            <p className="text-slate-400 text-sm mt-2">Designed for peace of mind, privacy, and seamless multi-device monitoring.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl w-fit mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Real-Time Location Tracking</h3>
              <p className="text-sm text-slate-400">
                View your child's current GPS location live on OpenStreetMap with timestamped history timelines.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Custom Safe Zones</h3>
              <p className="text-sm text-slate-400">
                Set up geofence radii for home, school, or parks and get notified instantly when your child arrives or leaves.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl w-fit mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Emergency SOS Protection</h3>
              <p className="text-sm text-slate-400">
                Immediate high-priority alert dispatch if your child triggers the panic button from their mobile device.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl w-fit mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Digital Wellbeing & Screen Time</h3>
              <p className="text-sm text-slate-400">
                Track daily app usage and screen time statistics to foster healthier digital habits for your family.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl w-fit mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Family Routines & Values</h3>
              <p className="text-sm text-slate-400">
                Establish positive daily routines and share daily Hadith reflections with your household.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl w-fit mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Explainable Safety Scores</h3>
              <p className="text-sm text-slate-400">
                Automated daily safety insights powered by multi-factor evaluations across battery, location, and routine adherence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100">How GuardianX Works</h2>
          <p className="text-slate-400 text-sm mt-2">Get up and running in less than 3 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">1</div>
            <h4 className="font-bold text-slate-200 mb-1">Create Account</h4>
            <p className="text-xs text-slate-400">Register your Parent account on the Web Portal.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">2</div>
            <h4 className="font-bold text-slate-200 mb-1">Add Child Profile</h4>
            <p className="text-xs text-slate-400">Create a child profile under your family account.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">3</div>
            <h4 className="font-bold text-slate-200 mb-1">Generate Code</h4>
            <p className="text-xs text-slate-400">Get a 6-character pairing code or QR code.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-4">4</div>
            <h4 className="font-bold text-slate-200 mb-1">Pair & Monitor</h4>
            <p className="text-xs text-slate-400">Enter code on child's mobile app to pair!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 GuardianX Team. All rights reserved. Live SaaS Backend Integration.</p>
        </div>
      </footer>
    </div>
  );
};
