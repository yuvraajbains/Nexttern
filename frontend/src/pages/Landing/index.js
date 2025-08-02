import React, { useState, useEffect } from 'react';
import { Search, Clipboard, Bell, ChevronRight, Star, Users, TrendingUp, Award, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// DNA SVG Icon
const DnaIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-7 h-7"} {...props}>
    <path d="M17 3c-2.5 2.5-7.5 7.5-7.5 10.5S14.5 21 17 21" />
    <path d="M7 21c2.5-2.5 7.5-7.5 7.5-10.5S9.5 3 7 3" />
    <path d="M8.5 8.5l7 7" />
    <path d="M15.5 8.5l-7 7" />
  </svg>
);

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const FloatingOrb = ({ className, delay = 0 }) => (
    <div 
      className={`absolute rounded-full blur-xl opacity-30 animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '4s'
      }}
    />
  );

  const GradientCard = ({ children, className = "", delay = 0 }) => (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-700 hover:scale-[1.02] ${className}`}
      style={{
        animationDelay: `${delay}s`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <FloatingOrb className="w-96 h-96 bg-blue-500/20 -top-48 -left-48" delay={0} />
        <FloatingOrb className="w-64 h-64 bg-purple-500/20 top-1/4 right-1/4" delay={1} />
        <FloatingOrb className="w-80 h-80 bg-indigo-500/20 bottom-1/4 left-1/4" delay={2} />
        <FloatingOrb className="w-72 h-72 bg-cyan-500/20 -bottom-36 -right-36" delay={3} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Mouse follower gradient */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 px-6 py-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Nexttern
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 font-medium transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm"
                onClick={() => navigate('/signin')}
              >
                Log In
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white/80">Trusted by University Students</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white">The Internship</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Tracking Platform
                  </span>
                  <br />
                  <span className="text-white">All Students Need</span>
                </h1>
                
                <p className="text-xl text-white/70 max-w-2xl leading-relaxed">
                  Transform your internship search with AI-powered discovery, smart tracking, and personalized recommendations. Stop missing opportunities and start building your dream career.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center space-x-2"
                  onClick={() => navigate('/signup')}
                >
                  <span>Get Started for Free</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className={`relative transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute -top-8 -left-8 w-72 h-48 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 p-6 animate-float">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Application Success</div>
                      <div className="text-xs text-white/60">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">+127%</div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-8 w-64 h-40 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 p-6 animate-float-delayed">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">New Opportunities</div>
                      <div className="text-xs text-white/60">Updated daily</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">1,247</div>
                </div>

                {/* Main Dashboard Preview */}
                <GradientCard className="w-full h-96 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">My Applications</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="w-32 h-2 bg-white/20 rounded-full mb-2"></div>
                            <div className="w-24 h-2 bg-white/10 rounded-full"></div>
                          </div>
                          <div className="w-16 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GradientCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/80">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Everything You Need to Land Your
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Dream Internship
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with intuitive design to streamline your internship journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Search,
                title: "Automatic Internship Searching",
                description: "Our tool allows you to find internships that match your skills and interests without the hassle of manually searching online",
                gradient: "from-blue-500 to-cyan-500",
                delay: 0
              },
              {
                icon: Clipboard,
                title: "Smart Application Tracking",
                description: "Never lose track of your applications with automated reminders and status updates.",
                gradient: "from-purple-500 to-pink-500",
                delay: 0.1
              },
              {
                icon: Bell,
                title: "Personalized Alerts",
                description: "Get instant notifications for new opportunities matching your preferences and criteria.",
                gradient: "from-cyan-500 to-blue-500",
                delay: 0.2
              },
              {
                icon: TrendingUp,
                title: "Analytics & Insights",
                description: "Track your progress and optimize your strategy with detailed performance analytics.",
                gradient: "from-green-500 to-teal-500",
                delay: 0.3
              },
              {
                icon: Users,
                title: "Network Building",
                description: "Connect with industry professionals and fellow students to expand your network.",
                gradient: "from-orange-500 to-red-500",
                delay: 0.4
              },
              {
                icon: DnaIcon,
                title: "DNA Project Extractor",
                description: "Transform job descriptions into custom tailored projects guidelines that showcase your skills and creativity.",
                gradient: "from-violet-500 to-purple-500",
                delay: 0.5
              }
            ].map((feature, index) => (
              <GradientCard key={index} className="p-8 h-full" delay={feature.delay}>
                <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center`}>
                    <feature.icon className={`w-7 h-7 text-white`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </GradientCard>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Full Width Layout */}
      <section className="relative z-20 px-6 py-24 bg-gradient-to-br from-slate-900/50 via-blue-900/50 to-indigo-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up" style={{animationDelay:'0.2s', animationDuration:'1.2s', animationFillMode:'both'}}>
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white/80">Our Story</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-bold text-white">
                  About 
                  <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent ml-3">
                    Nexttern
                  </span>
                </h2>
                
                <div className="space-y-6 text-lg text-white/80 leading-relaxed">
                  <p>
                    Nexttern was born out of my own frustration with the traditional internship search process. I realized that students everywhere were spending countless hours scouring job boards, tracking applications in messy spreadsheets, and missing out on opportunities simply because there was no unified, intelligent platform to guide them.
                  </p>
                  
                  <p>
                    I wanted to create something that not only streamlined the search and application process, but also empowered students to take control of their career journey with confidence.
                  </p>
                  
                  <p>
                    My vision for Nexttern is to combine the power of automatic discovery, smart tracking, and a supportive community, all wrapped in a beautiful, modern interface. Every feature, from automatic internship searching to analytics and network building, is designed to save you time, reduce stress, and help you land the opportunities you deserve.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">YB</span>
                </div>
                <div>
                  <div className="text-xl font-semibold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Yuvraj Bains
                  </div>
                  <div className="text-white/70">Founder & Developer</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-fade-in-up" style={{animationDelay:'0.4s', animationDuration:'1.2s', animationFillMode:'both'}}>
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 animate-float" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 animate-float-delayed" />
                
                {/* Main Content Card */}
                <GradientCard className="p-8 h-full">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Our Mission</h3>
                        <p className="text-white/60 text-sm">Empowering student success</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-white mb-1">Streamlined Process</h4>
                          <p className="text-white/70 text-sm">No more scattered applications and missed deadlines</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-white mb-1">AI-Powered Customization</h4>
                          <p className="text-white/70 text-sm">Find opportunities that match your unique profile</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-white mb-1">Student-First Design</h4>
                          <p className="text-white/70 text-sm">Built by students, for students</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-white/60 text-sm italic">
                        "Thank you for being part of this journey. Whether you're just starting out or looking for your next big break, Nexttern is here to help you every step of the way."
                      </p>
                    </div>
                  </div>
                </GradientCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <GradientCard className="p-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-white">
                  Ready to Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Internship Journey?
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Join thousands of successful students who've landed their dream internships using Nexttern.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
                  onClick={() => navigate('/signup')}
                >
                  <span>Start Your Journey</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </GradientCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/80">© 2025 Nexttern. All rights reserved.</span>
            </div>
            
            <div className="flex space-x-8">
              <button type="button" className="text-white/60 hover:text-white transition-colors">Privacy Policy</button>
              <button type="button" className="text-white/60 hover:text-white transition-colors">Terms of Service</button>
              <button type="button" className="text-white/60 hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
      `}</style>
    </div>
  );
}