'use client';

import { useState, useSyncExternalStore } from 'react';
import { ThemeToggle } from '@/resources/components/ui/ThemeToggle';

// Feature data
const features = [
  {
    icon: '⚡',
    title: 'Service Container',
    description: 'Powerful IoC container with dependency injection, singleton management, and circular dependency detection.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: '🔐',
    title: 'Multi-Guard Auth',
    description: 'Enterprise authentication with session & JWT guards, password resets, and Gate/Policy authorization.',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    icon: '🗃️',
    title: 'Active Record ORM',
    description: 'Laravel-like models wrapping Drizzle ORM with relationships, scopes, and lifecycle events.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: '🚀',
    title: 'CLI Generators',
    description: 'Code generators for controllers, models, migrations, and more with customizable stubs.',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    icon: '📡',
    title: 'Queue System',
    description: 'Background job processing with BullMQ, delayed dispatching, retries, and worker management.',
    gradient: 'from-rose-500 to-pink-400',
  },
  {
    icon: '🛡️',
    title: 'Form Validation',
    description: 'Zod-powered validation with 20+ Laravel-style rules and automatic error formatting.',
    gradient: 'from-indigo-500 to-blue-400',
  },
];

// Stats data
const stats = [
  { value: '50+', label: 'TypeScript Files', icon: '📁' },
  { value: '8', label: 'Core Phases', icon: '🔧' },
  { value: '20+', label: 'Validation Rules', icon: '✅' },
  { value: '100%', label: 'Type-Safe', icon: '🎯' },
];

// Tech stack
const techStack = [
  { name: 'Next.js 15', color: 'bg-black dark:bg-white dark:text-black' },
  { name: 'React 19', color: 'bg-cyan-500' },
  { name: 'TypeScript', color: 'bg-blue-600' },
  { name: 'Drizzle ORM', color: 'bg-emerald-500' },
  { name: 'Tailwind CSS', color: 'bg-sky-500' },
  { name: 'BullMQ', color: 'bg-red-500' },
  { name: 'Zod', color: 'bg-violet-500' },
  { name: 'Vitest', color: 'bg-amber-500' },
];

// Hydration-safe client detection
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <span className="text-xl">⚗️</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Catalyst</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors">Features</a>
              <a href="#architecture" className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors">Architecture</a>
              <a href="#tech" className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors">Tech Stack</a>
              <a href="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white transition-colors">Login</a>
              <ThemeToggle />
            </div>
            <a 
              href="/dashboard"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className={`w-full max-w-full mx-auto text-center transition-all duration-1000 px-6 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Enterprise-Grade Next.js Framework
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
            <span className="block">Build Like</span>
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Laravel
            </span>
            <span className="block">Ship Like</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Next.js
            </span>
          </h1>
          
          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Catalyst brings Laravel&apos;s developer experience to Next.js. 
            <span className="text-slate-900 dark:text-white font-medium"> Service Container, Active Record ORM, CLI generators, </span>
            and enterprise patterns — all with TypeScript&apos;s full type safety.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/register"
              className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-[2px] transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/25"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-lg font-semibold transition-all group-hover:bg-transparent">
                <span>Start Building</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="w-full max-w-full mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/10 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{stat.label}</div>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="w-full max-w-full mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">Core Features</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Enterprise Patterns,
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Modern Stack
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
              Every pattern you love from Laravel, reimagined for the Next.js ecosystem with full TypeScript support.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 text-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
                
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent transition-all duration-500 ${activeFeature === index ? `border-gradient-to-r ${feature.gradient}` : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="relative py-24 px-6">
        <div className="w-full max-w-full mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className={`transition-all duration-700 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <span className="inline-block text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4">Architecture</span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
                Built for
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Scale & Speed
                </span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Catalyst leverages AsyncLocalStorage for request-scoped context, 
                enabling true dependency injection without global state pollution.
              </p>
              
              {/* Architecture Points */}
              <div className="space-y-4">
                {[
                  { label: 'Request Context', desc: 'AsyncLocalStorage-based isolation' },
                  { label: 'Middleware Pipeline', desc: 'Onion architecture pattern' },
                  { label: 'Service Providers', desc: 'Lazy-loaded service registration' },
                  { label: 'Zero N+1 Queries', desc: 'Eager loading with relationships' },
                ].map((point, index) => (
                  <div key={point.label} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{point.label}</h4>
                      <p className="text-sm text-slate-500">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Code Preview */}
            <div className={`relative transition-all duration-700 delay-200 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                {/* Window Controls */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-950/50">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs text-slate-500">UserController.ts</span>
                </div>
                
                {/* Code */}
                <pre className="p-6 text-sm overflow-x-auto">
                  <code className="text-slate-300">
                    <span className="text-purple-400">import</span> {'{'}  Container {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@/backend/Core&apos;</span>;{'\n'}
                    <span className="text-purple-400">import</span> {'{'} UserService {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@/backend/Services&apos;</span>;{'\n'}
                    {'\n'}
                    <span className="text-purple-400">export class</span> <span className="text-cyan-400">UserController</span> {'{'}{'\n'}
                    {'  '}<span className="text-purple-400">async</span> <span className="text-yellow-400">index</span>() {'{'}{'\n'}
                    {'    '}<span className="text-purple-400">const</span> users = <span className="text-purple-400">await</span> Container{'\n'}
                    {'      '}.<span className="text-yellow-400">make</span>(<span className="text-emerald-400">&apos;UserService&apos;</span>){'\n'}
                    {'      '}.<span className="text-yellow-400">with</span>([<span className="text-emerald-400">&apos;posts&apos;</span>]){'\n'}
                    {'      '}.<span className="text-yellow-400">paginate</span>(<span className="text-amber-400">15</span>);{'\n'}
                    {'\n'}
                    {'    '}<span className="text-purple-400">return</span> Inertia.<span className="text-yellow-400">render</span>({'\n'}
                    {'      '}<span className="text-emerald-400">&apos;Users/Index&apos;</span>,{'\n'}
                    {'      '}{'{'} users {'}'}{'\n'}
                    {'    '});{'\n'}
                    {'  }'}{'\n'}
                    {'}'}
                  </code>
                </pre>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 blur-3xl rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="relative py-24 px-6">
        <div className="w-full max-w-full mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-pink-400 uppercase tracking-widest mb-4">Technology</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
            Modern
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"> Tech Stack</span>
          </h2>
          <p className="text-lg text-slate-400 mb-12">
            Built with the best tools for enterprise development
          </p>
          
          {/* Tech Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, index) => (
              <div
                key={tech.name}
                className={`${tech.color} px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="w-full max-w-full mx-auto">
          <div className={`relative overflow-hidden rounded-[3rem] border border-slate-200 dark:border-white/10 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-pink-600/10 dark:from-violet-600/20 dark:via-purple-600/20 dark:to-pink-600/20 p-12 sm:p-16 text-center backdrop-blur-xl transition-all duration-700 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            {/* Background Elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                Ready to
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transform Your Stack?
                </span>
              </h2>
              <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-10">
                Join developers building enterprise applications with the power of Laravel patterns and Next.js performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 text-lg font-bold text-white dark:text-slate-900 transition-all hover:bg-opacity-90 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20"
                >
                  Get Started Free
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a 
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/20 px-8 py-4 text-lg font-semibold transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 dark:border-white/10 py-12 px-6">
        <div className="w-full max-w-full mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <span className="text-xl">⚗️</span>
                </div>
                <span className="text-xl font-bold">Catalyst</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                The enterprise Next.js framework that brings Laravel&apos;s elegance to the modern web.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/catalyst"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/catalystdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a 
                  href="https://discord.gg/catalyst"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</a></li>
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400">
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Examples</a></li>
                <li><a href="https://discord.gg/catalyst" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2026 Catalyst Framework. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
