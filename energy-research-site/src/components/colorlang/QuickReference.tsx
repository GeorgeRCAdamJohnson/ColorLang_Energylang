import { useState } from 'react'
import { HelpCircle, X, Palette, Code, Hash } from 'lucide-react'

interface ColorReference {
  instruction: string
  hue: number
  color: string
  description: string
  example: string
}

const colorReferences: ColorReference[] = [
  {
    instruction: 'LOAD',
    hue: 95,
    color: 'hsl(95, 80%, 70%)',
    description: 'Load value into register',
    example: 'LOAD(42)',
  },
  {
    instruction: 'ADD',
    hue: 35,
    color: 'hsl(35, 80%, 70%)',
    description: 'Add values together',
    example: 'ADD(0)',
  },
  {
    instruction: 'MUL',
    hue: 300,
    color: 'hsl(300, 80%, 70%)',
    description: 'Multiply values',
    example: 'MUL(0)',
  },
  {
    instruction: 'DIV',
    hue: 180,
    color: 'hsl(180, 80%, 70%)',
    description: 'Divide values',
    example: 'DIV(2)',
  },
  {
    instruction: 'PRINT',
    hue: 275,
    color: 'hsl(275, 80%, 70%)',
    description: 'Print to output',
    example: 'PRINT(65) → A',
  },
  {
    instruction: 'HALT',
    hue: 335,
    color: 'hsl(335, 80%, 70%)',
    description: 'Stop execution',
    example: 'HALT(0)',
  },
]

const commonAscii = [
  { char: 'A', code: 65 },
  { char: 'B', code: 66 },
  { char: 'C', code: 67 },
  { char: 'a', code: 97 },
  { char: 'b', code: 98 },
  { char: 'c', code: 99 },
  { char: 'H', code: 72 },
  { char: 'i', code: 105 },
  { char: '!', code: 33 },
  { char: 'Space', code: 32 },
  { char: '0', code: 48 },
  { char: '1', code: 49 },
]

const quickPatterns = [
  {
    name: 'Print Number',
    pattern: 'LOAD(value) → PRINT(0) → HALT(0)',
    description: 'Load a number and print it',
  },
  {
    name: 'Simple Math',
    pattern: 'LOAD(a) → LOAD(b) → ADD(0) → PRINT(0) → HALT(0)',
    description: 'Add two numbers and print result',
  },
  {
    name: 'Print Text',
    pattern: 'PRINT(ascii1) → PRINT(ascii2) → ... → HALT(0)',
    description: 'Print text using ASCII codes',
  },
]

interface QuickReferenceProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickReferenceModal({ isOpen, onClose }: QuickReferenceProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'ascii' | 'patterns'>('colors')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">ColorLang Quick Reference</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'colors'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="inline mr-2" size={16} />
            Color Codes
          </button>
          <button
            onClick={() => setActiveTab('ascii')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'ascii'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Hash className="inline mr-2" size={16} />
            ASCII Codes
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'patterns'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="inline mr-2" size={16} />
            Patterns
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {activeTab === 'colors' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Common instruction colors with standard saturation (80%) and value (70%)
              </p>
              {colorReferences.map((ref, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 border border-gray-200 rounded"
                >
                  <div
                    className="w-8 h-8 border border-gray-300 rounded"
                    style={{ backgroundColor: ref.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{ref.instruction}</span>
                      <span className="text-xs text-gray-500">({ref.hue}°)</span>
                    </div>
                    <div className="text-xs text-gray-600">{ref.description}</div>
                  </div>
                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {ref.example}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ascii' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Common ASCII character codes for text output
              </p>
              <div className="grid grid-cols-3 gap-2">
                {commonAscii.map((ascii, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded"
                  >
                    <span className="font-mono font-semibold">
                      {ascii.char === 'Space' ? '␣' : ascii.char}
                    </span>
                    <span className="text-sm text-gray-600">{ascii.code}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm text-blue-800">
                  <strong>Tip:</strong> Use PRINT(ascii_code) to output characters. For example,
                  PRINT(72) outputs "H".
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Common programming patterns to get you started
              </p>
              {quickPatterns.map((pattern, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">{pattern.name}</h4>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                    {pattern.pattern}
                  </div>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                </div>
              ))}
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm text-green-800">
                  <strong>Remember:</strong> Always end your programs with HALT(0) to prevent
                  undefined behavior. Use data=0 in operations to work with register values.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function QuickReferenceButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Quick Reference"
      >
        <HelpCircle size={24} />
      </button>
      <QuickReferenceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
