import { useState } from 'react'
import { ChevronLeft, ChevronRight, Code, Cpu, Palette } from 'lucide-react'
import { ColorLangViewer } from './ColorLangViewer'
import { getAllExamplePrograms } from '../../data/colorLangPrograms'
import type { ColorProgram } from '../../types'

interface ExampleCardProps {
  program: ColorProgram
  isActive: boolean
  onClick: () => void
}

function ExampleCard({ program, isActive, onClick }: ExampleCardProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'hello-world':
      case 'arithmetic':
        return <Code size={20} />
      case 'counter':
      case 'fibonacci':
        return <Cpu size={20} />
      case 'color-demo':
      case 'neural-network':
      case 'monkey-game':
        return <Palette size={20} />
      default:
        return <Code size={20} />
    }
  }

  const getComplexity = (program: ColorProgram) => {
    // Define difficulty based on program complexity, not just size
    const difficultyMap: Record<string, string> = {
      'hello-world': 'Beginner',
      arithmetic: 'Beginner',
      counter: 'Intermediate',
      fibonacci: 'Intermediate',
      'color-demo': 'Intermediate',
      'neural-network': 'Advanced',
      'monkey-game': 'Advanced',
    }
    return difficultyMap[program.id] || 'Intermediate'
  }

  const complexity = getComplexity(program)
  const complexityColor = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800',
  }[complexity]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {getIcon(program.id)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{program.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${complexityColor}`}>
              {complexity}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>
              Size: {program.width}×{program.height}
            </span>
            <span>Instructions: {program.width * program.height}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function InteractiveExamples() {
  const programs = getAllExamplePrograms()
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0)
  const [modifiedPrograms, setModifiedPrograms] = useState<Record<string, ColorProgram>>({})

  const selectedProgram = programs[selectedProgramIndex]
  const currentProgram = modifiedPrograms[selectedProgram.id] || selectedProgram

  const handleProgramChange = (program: ColorProgram) => {
    setModifiedPrograms(prev => ({
      ...prev,
      [program.id]: program,
    }))
  }

  const handlePrevious = () => {
    setSelectedProgramIndex(prev => (prev === 0 ? programs.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedProgramIndex(prev => (prev === programs.length - 1 ? 0 : prev + 1))
  }

  const resetProgram = () => {
    setModifiedPrograms(prev => {
      const newPrograms = { ...prev }
      delete newPrograms[selectedProgram.id]
      return newPrograms
    })
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="heading-lg mb-4">Interactive ColorLang Examples</h2>
        <p className="text-body max-w-3xl mx-auto">
          Explore working ColorLang programs with a visual interpreter. Click on pixels to modify
          programs, step through execution, and see how color-encoded instructions create
          computational behavior.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Program Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Example Programs</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevious}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Previous program"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-500 px-2">
                  {selectedProgramIndex + 1} / {programs.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Next program"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {programs.map((program, index) => (
                <ExampleCard
                  key={program.id}
                  program={program}
                  isActive={index === selectedProgramIndex}
                  onClick={() => setSelectedProgramIndex(index)}
                />
              ))}
            </div>

            {modifiedPrograms[selectedProgram.id] && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-800">Program modified</span>
                  <button
                    onClick={resetProgram}
                    className="text-xs text-orange-600 hover:text-orange-800 underline"
                  >
                    Reset to original
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Program Viewer */}
        <div className="lg:col-span-2">
          <div className="card">
            <ColorLangViewer
              program={currentProgram}
              onProgramChange={handleProgramChange}
              interactive={true}
            />
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <Code className="mx-auto mb-3 text-blue-600" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">Select Programs</h3>
          <p className="text-sm text-gray-600">
            Choose from example programs ranging from simple arithmetic to neural network
            demonstrations
          </p>
        </div>

        <div className="card text-center">
          <Cpu className="mx-auto mb-3 text-green-600" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">Execute & Debug</h3>
          <p className="text-sm text-gray-600">
            Run programs step-by-step, watch the program counter, and observe register states
          </p>
        </div>

        <div className="card text-center">
          <Palette className="mx-auto mb-3 text-purple-600" size={32} />
          <h3 className="font-semibold text-gray-900 mb-2">Modify & Experiment</h3>
          <p className="text-sm text-gray-600">
            Click pixels in edit mode to change instructions and see how it affects program behavior
          </p>
        </div>
      </div>
    </section>
  )
}
