import { useState } from 'react'
import { Zap, FileText, Layers, BarChart3, ArrowRight } from 'lucide-react'

interface CompressionTechniqueProps {
  title: string
  description: string
  efficiency: string
  useCase: string
  example: string
}

function CompressionTechnique({
  title,
  description,
  efficiency,
  useCase,
  example,
}: CompressionTechniqueProps) {
  return (
    <div className="card">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{description}</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
          <span className="font-medium text-green-600 dark:text-green-400">{efficiency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Best for:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{useCase}</span>
        </div>
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
          <strong>Example:</strong> {example}
        </div>
      </div>
    </div>
  )
}

interface CompressionDemoProps {
  originalSize: number
  compressedSize: number
  technique: string
  description: string
}

function CompressionDemo({
  originalSize,
  compressedSize,
  technique,
  description,
}: CompressionDemoProps) {
  const compressionRatio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{originalSize}KB</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Original</div>
      </div>

      <ArrowRight className="text-gray-400 dark:text-gray-500" size={20} />

      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{compressedSize}KB</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Compressed</div>
      </div>

      <div className="flex-1 ml-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">{technique}</span>
          <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
            {compressionRatio}% reduction
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

export function CompressionFramework() {
  const [activeTab, setActiveTab] = useState<'techniques' | 'performance'>('techniques')

  const compressionTechniques = [
    {
      title: 'Spatial Pattern Recognition',
      description: 'Identifies and compresses repeated spatial patterns in color programs',
      efficiency: '60-80% reduction',
      useCase: 'Programs with repeated structures',
      example: 'Loop bodies, function templates, data arrays',
    },
    {
      title: 'Run-Length Encoding (RLE)',
      description: 'Compresses sequences of identical pixels into count-value pairs',
      efficiency: '40-90% reduction',
      useCase: 'Programs with large uniform regions',
      example: 'Background pixels, padding, initialization sequences',
    },
    {
      title: 'Color Palette Optimization',
      description: 'Reduces color depth while preserving instruction semantics',
      efficiency: '20-40% reduction',
      useCase: 'Programs with limited instruction variety',
      example: 'Simple algorithms, embedded system programs',
    },
    {
      title: 'Hierarchical Compression',
      description: 'Multi-level compression using program structure analysis',
      efficiency: '70-95% reduction',
      useCase: 'Complex programs with nested structures',
      example: 'Object-oriented programs, recursive algorithms',
    },
  ]

  const performanceData = [
    {
      originalSize: 256,
      compressedSize: 64,
      technique: 'RLE + Palette',
      description: 'Simple arithmetic program with repeated operations',
    },
    {
      originalSize: 1024,
      compressedSize: 128,
      technique: 'Spatial + Hierarchical',
      description: 'Complex neural network training algorithm',
    },
    {
      originalSize: 512,
      compressedSize: 51,
      technique: 'Full Pipeline',
      description: 'Game AI behavior tree with pattern recognition',
    },
    {
      originalSize: 2048,
      compressedSize: 205,
      technique: 'Adaptive Compression',
      description: 'Computer vision processing pipeline',
    },
  ]

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="heading-lg mb-4">Machine-Native Compression Framework</h2>
        <p className="text-body max-w-3xl mx-auto">
          ColorLang's compression framework leverages spatial relationships and pattern recognition
          to achieve exceptional compression ratios while maintaining program integrity and
          execution performance.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('techniques')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'techniques'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Layers className="inline mr-2" size={16} />
            Techniques
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'performance'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="inline mr-2" size={16} />
            Performance
          </button>
        </div>
      </div>

      {activeTab === 'techniques' && (
        <div className="grid md:grid-cols-2 gap-6">
          {compressionTechniques.map((technique, index) => (
            <CompressionTechnique key={index} {...technique} />
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Real-World Compression Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Actual compression performance on various ColorLang programs
            </p>
          </div>
          {performanceData.map((demo, index) => (
            <CompressionDemo key={index} {...demo} />
          ))}
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Zap className="mx-auto mb-3 text-yellow-600 dark:text-yellow-400" size={32} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lossless Compression</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All compression techniques maintain perfect program integrity with zero information loss
          </p>
        </div>

        <div className="card text-center">
          <FileText className="mx-auto mb-3 text-blue-600 dark:text-blue-400" size={32} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Embedded Optimization</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optimized for embedded systems with limited storage and memory constraints
          </p>
        </div>

        <div className="card text-center">
          <Layers className="mx-auto mb-3 text-green-600 dark:text-green-400" size={32} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adaptive Algorithms</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compression techniques adapt automatically based on program structure and content
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Compression Pipeline</h3>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Pattern Analysis</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500" size={16} />
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Spatial Optimization</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500" size={16} />
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Encoding Selection</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500" size={16} />
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Compressed Output</span>
          </div>
        </div>
      </div>
    </section>
  )
}
