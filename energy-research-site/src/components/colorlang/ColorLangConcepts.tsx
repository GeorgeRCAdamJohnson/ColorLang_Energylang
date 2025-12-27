import React from 'react'
import { Palette, Grid3X3, Cpu, Zap } from 'lucide-react'

interface ConceptCardProps {
  icon: React.ReactNode
  title: string
  description: string
  details: string[]
}

function ConceptCard({ icon, title, description, details }: ConceptCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-700 mb-4">{description}</p>
      <ul className="space-y-2">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ColorLangConcepts() {
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="heading-lg mb-4">Core Concepts</h2>
        <p className="text-body max-w-3xl mx-auto">
          ColorLang revolutionizes programming by using 2D color fields as executable programs,
          where each pixel represents an instruction encoded in HSV color space.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ConceptCard
          icon={<Palette size={24} />}
          title="2D Color Fields as Programs"
          description="Programs are visual images where each pixel contains executable instructions"
          details={[
            'Each pixel represents one instruction or data element',
            'Program execution flows left-to-right, top-to-bottom',
            'Visual debugging through direct program state observation',
            'Spatial relationships define program structure and flow',
          ]}
        />

        <ConceptCard
          icon={<Grid3X3 size={24} />}
          title="HSV-Based Color Encoding"
          description="Instructions and data are encoded using Hue, Saturation, and Value components"
          details={[
            'Hue (0-360°): Operation type and data category',
            'Saturation (0-100%): Operation parameters and memory addresses',
            'Value (0-100%): Data values and execution flags',
            'Complete instruction set mapped to color spectrum',
          ]}
        />

        <ConceptCard
          icon={<Cpu size={24} />}
          title="Machine-Native Processing"
          description="Optimized for computer vision and parallel processing systems"
          details={[
            'Direct GPU acceleration through image processing',
            'Parallel execution across multiple image regions',
            'Native support for computer vision algorithms',
            'Efficient spatial sampling and compression',
          ]}
        />

        <ConceptCard
          icon={<Zap size={24} />}
          title="Compression Framework"
          description="Advanced compression techniques for efficient program storage and transmission"
          details={[
            'Spatial pattern recognition and optimization',
            'Run-length encoding for repeated instructions',
            'Lossless compression maintaining program integrity',
            'Compact representation for embedded systems',
          ]}
        />
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Why ColorLang?</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Visual Programming</h4>
            <p className="text-gray-600">
              Programs are inherently visual, making debugging and understanding intuitive through
              direct observation of program state.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Machine Optimization</h4>
            <p className="text-gray-600">
              Designed for machine processing rather than human readability, enabling unprecedented
              optimization opportunities.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Parallel by Design</h4>
            <p className="text-gray-600">
              Spatial nature enables natural parallelization and GPU acceleration for
              high-performance computing applications.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
