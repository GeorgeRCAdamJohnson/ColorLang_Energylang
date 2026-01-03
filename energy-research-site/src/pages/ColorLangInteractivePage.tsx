import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Code, Palette } from 'lucide-react'
import { InteractiveExamples } from '../components/colorlang'
import { useProgressTracking } from '../hooks/useProgressTracking'
import { SEOHead } from '../components/seo/SEOHead'

export function ColorLangInteractivePage() {
  const { visitSection, completeInteraction } = useProgressTracking()

  useEffect(() => {
    visitSection('colorlang-interactive')
  }, [visitSection])

  const handleInteraction = (type: string) => {
    completeInteraction(`colorlang-interactive-${type}`)
  }

  return (
    <>
      <SEOHead
        title="ColorLang Interactive Examples - Visual Programming Playground"
        description="Explore working ColorLang programs with an interactive visual interpreter. Modify color-encoded instructions, step through execution, and see how 2D color fields create computational behavior."
        keywords={["ColorLang", "visual programming", "interactive examples", "color programming", "HSV instructions", "programming playground"]}
        url="/colorlang/interactive"
      />
      
      <div className="section-padding">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="mb-8">
              <Link
                to="/colorlang"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to ColorLang Overview</span>
              </Link>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl">
                  <Play className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <h1 className="heading-xl mb-6">ColorLang Interactive Playground</h1>
              <p className="text-body-lg max-w-4xl mx-auto mb-8">
                Experience ColorLang programs in action with our interactive visual interpreter. 
                Explore working examples, modify color-encoded instructions, and watch as 2D color 
                fields execute computational behavior in real-time.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full">
                  <Play size={16} />
                  <span>Live Execution</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full">
                  <Code size={16} />
                  <span>Step-by-Step Debugging</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full">
                  <Palette size={16} />
                  <span>Visual Programming</span>
                </div>
              </div>
            </div>

            {/* Interactive Examples */}
            <div onClick={() => handleInteraction('examples')}>
              <InteractiveExamples />
            </div>

            {/* Getting Started Guide */}
            <section className="mt-16 mb-12">
              <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  How to Use the Interactive Playground
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-300">1</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Program</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose from example programs ranging from simple arithmetic to complex neural network demonstrations
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-green-600 dark:text-green-300">2</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Execute & Debug</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Run programs step-by-step, watch the program counter move, and observe register states change
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-300">3</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Modify & Experiment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch to edit mode to click pixels and change instructions, then see how it affects program behavior
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Program Categories */}
            <section className="mb-12">
              <h2 className="heading-lg text-center mb-8">Program Categories</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beginner Programs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Simple examples like Hello World and basic arithmetic to understand ColorLang fundamentals
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">Hello World</span>
                    <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">Arithmetic</span>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Intermediate Programs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    More complex logic with loops, conditionals, and state management
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">Counter</span>
                    <span className="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">Fibonacci</span>
                    <span className="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">Color Demo</span>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Advanced Programs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Sophisticated examples including AI behavior trees and interactive games
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">Neural Network</span>
                    <span className="bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">Monkey Game</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Features */}
            <section className="mb-12">
              <div className="card bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Interactive Features
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Execution Engine
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Real-time HSV instruction decoding and execution</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Step-by-step debugging with program counter visualization</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Register state monitoring and output capture</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Automatic program reset when switching examples</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Interactive Editing
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Click-to-edit pixel instructions in real-time</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Cycle through common instruction types</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Visual feedback for modified programs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Reset to original program functionality</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation Footer */}
            <div className="text-center">
              <Link
                to="/colorlang"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Return to ColorLang Overview</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}