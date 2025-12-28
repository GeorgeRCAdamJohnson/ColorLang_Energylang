import { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'

interface InstructionCategory {
  name: string
  hueRange: string
  color: string
  operations: {
    name: string
    hueRange: string
    description: string
    operands: number
    example?: string
  }[]
}

const instructionCategories: InstructionCategory[] = [
  {
    name: 'Arithmetic Operations',
    hueRange: '31-90°',
    color: 'bg-yellow-500',
    operations: [
      {
        name: 'ADD',
        hueRange: '31-40°',
        description: 'Addition operation',
        operands: 3,
        example: '[operand1][ADD][operand2] → result',
      },
      {
        name: 'SUB',
        hueRange: '41-50°',
        description: 'Subtraction operation',
        operands: 3,
        example: '[operand1][SUB][operand2] → result',
      },
      {
        name: 'MUL',
        hueRange: '51-60°',
        description: 'Multiplication operation',
        operands: 3,
        example: '[operand1][MUL][operand2] → result',
      },
      {
        name: 'DIV',
        hueRange: '61-70°',
        description: 'Division operation',
        operands: 3,
        example: '[operand1][DIV][operand2] → result',
      },
      {
        name: 'MOD',
        hueRange: '71-80°',
        description: 'Modulo operation',
        operands: 3,
        example: '[operand1][MOD][operand2] → result',
      },
      {
        name: 'POW',
        hueRange: '81-90°',
        description: 'Power/exponentiation',
        operands: 3,
        example: '[operand1][POW][operand2] → result',
      },
    ],
  },
  {
    name: 'Memory Operations',
    hueRange: '91-150°',
    color: 'bg-green-500',
    operations: [
      {
        name: 'LOAD',
        hueRange: '91-100°',
        description: 'Load value from memory',
        operands: 2,
        example: '[address][LOAD] → register',
      },
      {
        name: 'STORE',
        hueRange: '101-110°',
        description: 'Store value to memory',
        operands: 2,
        example: '[register][STORE] → address',
      },
      {
        name: 'MOVE',
        hueRange: '111-120°',
        description: 'Move between registers',
        operands: 2,
        example: '[source][MOVE] → destination',
      },
      {
        name: 'COPY',
        hueRange: '121-130°',
        description: 'Copy between registers',
        operands: 2,
        example: '[source][COPY] → destination',
      },
      {
        name: 'ALLOC',
        hueRange: '131-140°',
        description: 'Allocate memory block',
        operands: 2,
        example: '[size][ALLOC] → pointer',
      },
      {
        name: 'FREE',
        hueRange: '141-150°',
        description: 'Free memory block',
        operands: 1,
        example: '[pointer][FREE]',
      },
    ],
  },
  {
    name: 'Control Flow',
    hueRange: '151-210°',
    color: 'bg-cyan-500',
    operations: [
      {
        name: 'IF',
        hueRange: '151-160°',
        description: 'Conditional jump if true',
        operands: 2,
        example: '[condition][IF] → jump_address',
      },
      {
        name: 'ELSE',
        hueRange: '161-170°',
        description: 'Alternative branch',
        operands: 1,
        example: '[ELSE] → jump_address',
      },
      {
        name: 'WHILE',
        hueRange: '171-180°',
        description: 'Loop while condition true',
        operands: 2,
        example: '[condition][WHILE] → loop_start',
      },
      {
        name: 'FOR',
        hueRange: '181-190°',
        description: 'For loop with counter',
        operands: 4,
        example: '[counter][FOR][limit][increment]',
      },
      {
        name: 'BREAK',
        hueRange: '191-200°',
        description: 'Break out of loop',
        operands: 0,
        example: '[BREAK]',
      },
      {
        name: 'CONTINUE',
        hueRange: '201-210°',
        description: 'Continue loop iteration',
        operands: 0,
        example: '[CONTINUE]',
      },
    ],
  },
  {
    name: 'Function Operations',
    hueRange: '211-270°',
    color: 'bg-blue-500',
    operations: [
      {
        name: 'CALL',
        hueRange: '211-220°',
        description: 'Call function',
        operands: 2,
        example: '[function_address][CALL][arg_count]',
      },
      {
        name: 'RETURN',
        hueRange: '221-230°',
        description: 'Return from function',
        operands: 1,
        example: '[RETURN][return_value]',
      },
      {
        name: 'FUNC_DEF',
        hueRange: '231-240°',
        description: 'Define function',
        operands: 3,
        example: '[FUNC_DEF][name][param_count]',
      },
      {
        name: 'PARAM',
        hueRange: '241-250°',
        description: 'Function parameter',
        operands: 2,
        example: '[PARAM][name][type]',
      },
      {
        name: 'LOCAL',
        hueRange: '251-260°',
        description: 'Local variable',
        operands: 2,
        example: '[LOCAL][name][initial_value]',
      },
    ],
  },
  {
    name: 'I/O Operations',
    hueRange: '271-330°',
    color: 'bg-purple-500',
    operations: [
      {
        name: 'PRINT',
        hueRange: '271-280°',
        description: 'Print value to output',
        operands: 1,
        example: '[PRINT][value]',
      },
      {
        name: 'INPUT',
        hueRange: '281-290°',
        description: 'Read input to register',
        operands: 1,
        example: '[INPUT] → register',
      },
      {
        name: 'READ_FILE',
        hueRange: '291-300°',
        description: 'Read file contents',
        operands: 2,
        example: '[filename][READ_FILE] → content',
      },
      {
        name: 'WRITE_FILE',
        hueRange: '301-310°',
        description: 'Write content to file',
        operands: 2,
        example: '[filename][WRITE_FILE][content]',
      },
    ],
  },
  {
    name: 'System Operations',
    hueRange: '331-360°, 0-30°',
    color: 'bg-red-500',
    operations: [
      {
        name: 'HALT',
        hueRange: '331-340°',
        description: 'Halt program execution',
        operands: 1,
        example: '[HALT][exit_code]',
      },
      {
        name: 'DEBUG',
        hueRange: '341-350°',
        description: 'Debug breakpoint',
        operands: 1,
        example: '[DEBUG][debug_info]',
      },
      {
        name: 'THREAD_SPAWN',
        hueRange: '351-360°',
        description: 'Spawn execution thread',
        operands: 2,
        example: '[function][THREAD_SPAWN] → thread_id',
      },
      {
        name: 'THREAD_JOIN',
        hueRange: '0-10°',
        description: 'Wait for thread completion',
        operands: 1,
        example: '[thread_id][THREAD_JOIN]',
      },
    ],
  },
]

interface ExpandableCategoryProps {
  category: InstructionCategory
  isExpanded: boolean
  onToggle: () => void
}

function ExpandableCategory({ category, isExpanded, onToggle }: ExpandableCategoryProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${category.color}`} />
          <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">({category.hueRange})</span>
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="space-y-3">
            {category.operations.map((op, index) => (
              <div key={index} className="border-l-4 border-gray-200 dark:border-gray-600 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{op.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({op.hueRange})</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                    {op.operands} operand{op.operands !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{op.description}</p>
                {op.example && (
                  <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">
                    {op.example}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function HSVInstructionMapping() {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([0]))

  const toggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="heading-lg mb-4">HSV Instruction Mapping</h2>
        <p className="text-body max-w-3xl mx-auto">
          ColorLang maps the complete instruction set to HSV color space, with each hue range
          representing different operation categories. Click on categories to explore the full
          instruction set.
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Color Encoding System</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Hue (0-360°):</strong> Operation type and data category
              </div>
              <div>
                <strong>Saturation (0-100%):</strong> Operation parameters and memory addresses
              </div>
              <div>
                <strong>Value (0-100%):</strong> Data values and execution flags
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {instructionCategories.map((category, index) => (
          <ExpandableCategory
            key={index}
            category={category}
            isExpanded={expandedCategories.has(index)}
            onToggle={() => toggleCategory(index)}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Data Type Encoding</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Primitive Types</h4>
            <ul className="space-y-1 text-gray-600">
              <li>
                <strong>Integer (0-15°):</strong> Saturation = magnitude, Value = sign
              </li>
              <li>
                <strong>Float (16-30°):</strong> Saturation = whole part, Value = fractional
              </li>
              <li>
                <strong>Boolean:</strong> Hue = 0°, Saturation = 0%, Value = truth value
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Complex Types</h4>
            <ul className="space-y-1 text-gray-600">
              <li>
                <strong>Arrays:</strong> Horizontal sequences of colored pixels
              </li>
              <li>
                <strong>Objects:</strong> 2D grids with structured pixel patterns
              </li>
              <li>
                <strong>Functions:</strong> Vertical strips with parameter encoding
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
