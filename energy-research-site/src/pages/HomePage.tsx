import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Award, Zap, Palette, ArrowRight, Users, Brain } from 'lucide-react'
import { useToast } from '../hooks/useToast'

export function HomePage() {
  const { showToast } = useToast()

  useEffect(() => {
    // Welcome toast for first-time visitors
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setTimeout(() => {
        showToast({
          type: 'info',
          title: 'Welcome to Energy Research Showcase!',
          message:
            'Discover how C++ is 6x more energy efficient than Python and explore innovative visual programming.',
          duration: 7000,
        })
        localStorage.setItem('hasVisited', 'true')
      }, 1000)
    }
  }, [showToast])

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 section-padding overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Key Finding Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-purple-100 dark:from-green-900/30 dark:to-purple-900/30 text-green-800 dark:text-green-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-green-200/50 dark:border-green-700/50 shadow-sm"
            >
              <TrendingUp size={16} />
              <span>Dual Innovation Showcase</span>
              <Award size={16} />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="heading-xl mb-6"
            >
              <span className="block text-gray-900 dark:text-gray-100 mb-2">
                Groundbreaking Research in
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                Programming Innovation
              </span>
            </motion.h1>

            {/* Key Finding Highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                {/* EnergyLang Finding */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap size={20} className="text-blue-600" />
                    <span className="font-bold text-lg text-blue-600">EnergyLang</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-bold text-lg text-blue-600">C++</span>
                    <div className="text-2xl font-bold text-green-600">6×</div>
                    <span className="text-gray-600 dark:text-gray-400">vs Python</span>
                  </div>
                </div>

                {/* ColorLang Finding */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Palette size={20} className="text-purple-600" />
                    <span className="font-bold text-lg text-purple-600">ColorLang</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-bold">2D Color Fields</span> as Programs
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                Revolutionary advances in both energy-efficient computing and visual programming
                paradigms
              </p>
            </motion.div>

            {/* Project Overview */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto"
            >
              Comprehensive research spanning <strong>energy-efficient computing</strong>,{' '}
              <strong>visual programming innovation</strong>, and{' '}
              <strong>AI-assisted development methodologies</strong>. Featuring EnergyLang's
              sophisticated benchmarking frameworks, ColorLang's revolutionary 2D color field
              programming, and advanced strategic decision-making processes.
            </motion.p>

            {/* Value Proposition Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  Programming Languages
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Energy Benchmarked</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-purple-600 mb-2">2D</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  Visual Programming
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Color Field Innovation
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  AI-Assisted Development
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  With Rigorous Methodology
                </div>
              </div>
            </motion.div>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/findings"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp size={20} />
                <span>Explore Key Findings</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/research"
                className="btn-outline inline-flex items-center space-x-2 text-lg px-8 py-4 hover:shadow-lg transition-all duration-300"
              >
                <Users size={20} />
                <span>View Research Methodology</span>
              </Link>
            </motion.div>

            {/* Quick Navigation Hints */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-12 text-sm text-gray-600 dark:text-gray-400"
            >
              <p>
                <span className="inline-flex items-center space-x-1">
                  <Zap size={14} />
                  <span>Interactive visualizations</span>
                </span>
                <span className="mx-3">•</span>
                <span className="inline-flex items-center space-x-1">
                  <Palette size={14} />
                  <span>Live ColorLang demos</span>
                </span>
                <span className="mx-3">•</span>
                <span className="inline-flex items-center space-x-1">
                  <Brain size={14} />
                  <span>AI collaboration insights</span>
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Projects Section */}
      <section className="section-padding bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="heading-lg mb-4">Two Groundbreaking Projects</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive research demonstrating technical depth across energy measurement, visual
              programming, and AI-assisted development methodologies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* EnergyLang Project */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card-hover"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="heading-md">EnergyLang Research</h3>
              </div>
              <p className="text-body mb-6">
                Sophisticated benchmarking framework revealing that C++ consumes ~6x less energy
                than Python for matrix multiplication. Features hardened measurement harnesses,
                profiler race condition solutions, and physics-based energy canonicalization.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Cross-language benchmarks (C++, Python, Rust, Go, Java)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>AMD uProf, NVIDIA-smi, pyJoules integration</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>File-sentinel handshake protocol for reliable profiling</span>
                </div>
              </div>
              <Link to="/research" className="btn-primary inline-flex items-center space-x-2">
                <span>Explore Research</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* ColorLang Project */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card-hover"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Palette className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <h3 className="heading-md">ColorLang Framework</h3>
              </div>
              <p className="text-body mb-6">
                Revolutionary visual programming paradigm using 2D color fields as executable
                programs. HSV-based color encoding enables machine-native computation with spatial
                sampling and compression frameworks.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>HSV color encoding for instructions and data</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Interactive visual programming interpreter</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Spatial sampling and compression algorithms</span>
                </div>
              </div>
              <Link to="/colorlang" className="btn-primary inline-flex items-center space-x-2">
                <span>Try ColorLang</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Collaboration Highlight */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Brain className="text-green-600 dark:text-green-400" size={32} />
              </div>
            </div>
            <h2 className="heading-lg mb-4">Advanced AI Collaboration</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Sophisticated AI-assisted development methodology featuring multi-persona reviews,
              evidence-based decision making, and strategic project pivots based on thorough
              stakeholder analysis and risk assessment.
            </p>
            <Link to="/lessons" className="btn-outline inline-flex items-center space-x-2">
              <span>Learn About Our AI Methodology</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
