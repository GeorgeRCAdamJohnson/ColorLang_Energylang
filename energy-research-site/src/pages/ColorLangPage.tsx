import { useEffect } from 'react'
import {
  ColorLangConcepts,
  HSVInstructionMapping,
  CompressionFramework,
  InteractiveExamples,
  ProgrammingGuide,
  QuickReferenceButton,
} from '../components/colorlang'
import { useProgressTracking } from '../hooks/useProgressTracking'

export function ColorLangPage() {
  const { visitSection, completeInteraction } = useProgressTracking()

  useEffect(() => {
    visitSection('colorlang')
  }, [visitSection])

  const handleConceptInteraction = (concept: string) => {
    completeInteraction(`colorlang-${concept}`)
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-6">ColorLang Visual Programming Framework</h1>
            <p className="text-body-lg max-w-4xl mx-auto mb-8">
              A revolutionary programming paradigm that uses 2D color fields as executable programs,
              where each pixel represents an instruction encoded in HSV color space. ColorLang
              demonstrates the potential for machine-native programming languages optimized for
              computer vision and parallel processing.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <span>Visual Programming</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                <span>Machine-Native</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <span>GPU Accelerated</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
                <span>Compressed</span>
              </div>
            </div>
          </div>

          {/* Core Concepts */}
          <div onClick={() => handleConceptInteraction('core-concepts')}>
            <ColorLangConcepts />
          </div>

          {/* HSV Instruction Mapping */}
          <div onClick={() => handleConceptInteraction('hsv-mapping')}>
            <HSVInstructionMapping />
          </div>

          {/* Compression Framework */}
          <div onClick={() => handleConceptInteraction('compression')}>
            <CompressionFramework />
          </div>

          {/* Programming Guide */}
          <div onClick={() => handleConceptInteraction('programming-guide')}>
            <ProgrammingGuide />
          </div>

          {/* Interactive Examples */}
          <div onClick={() => handleConceptInteraction('interactive-examples')}>
            <InteractiveExamples />
          </div>

          {/* Research Context */}
          <section className="mb-12">
            <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Research Innovation</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Technical Achievements</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        Complete virtual machine implementation with HSV instruction decoding
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Advanced compression algorithms achieving 60-95% size reduction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Parallel execution engine with GPU acceleration support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Working examples including AI behavior trees and neural networks</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Innovation Impact</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Demonstrates machine-first programming language design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        Opens new possibilities for visual debugging and program understanding
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Enables natural parallelization through spatial program structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        Provides foundation for future energy-efficient computing research
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="text-center">
            <div className="card bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ColorLang Research Impact
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ColorLang demonstrates the potential for machine-native programming languages that
                prioritize visual representation and parallel processing over human readability.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                This research opens new avenues for energy-efficient computing through specialized
                language design.
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Quick Reference Button */}
      <QuickReferenceButton />
    </div>
  )
}
