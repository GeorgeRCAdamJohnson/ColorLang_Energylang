import { useState, useCallback } from 'react'
import { Play, Pause, RotateCcw, Edit3, Eye } from 'lucide-react'
import type { ColorProgram, ColorPixel, ExecutionStep } from '../../types'
import { MonkeyGame } from './MonkeyGame'

interface ColorLangViewerProps {
  program: ColorProgram
  onProgramChange?: (program: ColorProgram) => void
  interactive?: boolean
}

interface ExecutionState {
  isRunning: boolean
  currentStep: number
  steps: ExecutionStep[]
  output: string[]
  registers: Record<string, number>
  programCounter: { x: number; y: number }
}

function ColorPixelDisplay({
  pixel,
  isActive,
  onClick,
}: {
  pixel: ColorPixel
  isActive?: boolean
  onClick?: () => void
}) {
  const hslColor = `hsl(${pixel.hue}, ${pixel.saturation}%, ${pixel.value}%)`

  return (
    <div
      className={`w-8 h-8 border cursor-pointer transition-all duration-200 ${
        isActive ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-300'
      }`}
      style={{ backgroundColor: hslColor }}
      onClick={onClick}
      title={`H:${pixel.hue}° S:${pixel.saturation}% V:${pixel.value}%${
        pixel.instruction ? ` | ${pixel.instruction}` : ''
      }${pixel.data !== undefined ? ` | Data: ${pixel.data}` : ''}`}
    />
  )
}

function ProgramGrid({
  program,
  activePixel,
  onPixelClick,
}: {
  program: ColorProgram
  activePixel?: { x: number; y: number }
  onPixelClick?: (x: number, y: number) => void
}) {
  return (
    <div className="inline-block border border-gray-400 bg-white">
      {program.colorField.map((row, y) => (
        <div key={y} className="flex">
          {row.map((pixel, x) => (
            <ColorPixelDisplay
              key={`${x}-${y}`}
              pixel={pixel}
              isActive={activePixel?.x === x && activePixel?.y === y}
              onClick={() => onPixelClick?.(x, y)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ExecutionControls({
  state,
  onPlay,
  onPause,
  onReset,
  onStep,
}: {
  state: ExecutionState
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onStep: () => void
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <button
        onClick={state.isRunning ? onPause : onPlay}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {state.isRunning ? <Pause size={16} /> : <Play size={16} />}
        {state.isRunning ? 'Pause' : 'Run'}
      </button>

      <button
        onClick={onStep}
        disabled={state.isRunning}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        Step
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      >
        <RotateCcw size={16} />
        Reset
      </button>

      <div className="ml-4 text-sm text-gray-600">
        Step: {state.currentStep} / {state.steps.length}
      </div>

      <div className="ml-4 text-sm text-gray-600">
        PC: ({state.programCounter.x}, {state.programCounter.y})
      </div>
    </div>
  )
}

function ExecutionOutput({
  output,
  registers,
}: {
  output: string[]
  registers: Record<string, number>
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Output</h4>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-32 overflow-y-auto">
          {output.length > 0 ? (
            output.map((line, index) => <div key={index}>{line}</div>)
          ) : (
            <div className="text-gray-500">No output yet...</div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Registers</h4>
        <div className="bg-gray-100 p-3 rounded text-sm h-32 overflow-y-auto">
          {Object.entries(registers).length > 0 ? (
            Object.entries(registers).map(([reg, value]) => (
              <div key={reg} className="flex justify-between">
                <span className="font-mono">{reg}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No register values...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ColorLangViewer({
  program,
  onProgramChange,
  interactive = false,
}: ColorLangViewerProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isRunning: false,
    currentStep: 0,
    steps: [],
    output: [],
    registers: {},
    programCounter: { x: 0, y: 0 },
  })

  // Enhanced ColorLang interpreter simulation
  const executeProgram = useCallback(() => {
    const steps: ExecutionStep[] = []
    const output: string[] = []
    const registers: Record<string, number> = {}
    let accumulator = 0
    let registerIndex = 0

    // Simulate program execution by analyzing the color field
    // Use different execution orders based on program structure
    if (program.height === 1) {
      // Single row programs: execute left-to-right (like Hello World)
      for (let x = 0; x < program.width; x++) {
        const pixel = program.colorField[0][x]

        // Decode instruction based on hue
        let instruction = 'NOP'
        const data = pixel.data || 0
        let stepOutput: string | undefined

        if (pixel.hue >= 271 && pixel.hue < 280) {
          // PRINT instruction
          instruction = 'PRINT'
          let printValue: string

          if (program.id === 'hello-world') {
            // For Hello World, convert ASCII codes to characters
            printValue = String.fromCharCode(data)
            output.push(printValue)
            stepOutput = printValue
          } else if (data === 0 && accumulator !== 0) {
            // Print accumulator value if data is 0 but we have a computed result
            printValue = accumulator.toString()
            output.push(printValue)
            stepOutput = printValue
          } else {
            // Print the data value
            printValue = data.toString()
            output.push(printValue)
            stepOutput = printValue
          }
        } else if ((pixel.hue >= 31 && pixel.hue < 40) || pixel.hue === 60) {
          // ADD instruction (standard range 31-40 or exact Yellow hue 60)
          instruction = 'ADD'
          if (data === 0) {
            // Add previous register values
            const regValues = Object.values(registers)
            accumulator = regValues.reduce((sum, val) => sum + val, 0)
            registers['ACC'] = accumulator
          } else {
            accumulator += data
            registers['ACC'] = accumulator
          }
        } else if ((pixel.hue >= 55 && pixel.hue < 65) || pixel.hue === 300) {
          // MUL instruction (standard range 55-65 or exact Magenta hue 300)
          instruction = 'MUL'
          if (data === 0) {
            // Multiply previous register values
            const regValues = Object.values(registers)
            accumulator = regValues.reduce((product, val) => product * val, 1)
            registers['ACC'] = accumulator
          } else {
            accumulator *= data
            registers['ACC'] = accumulator
          }
        } else if ((pixel.hue >= 175 && pixel.hue < 185) || pixel.hue === 180) {
          // DIV instruction (standard range 175-185 or exact Cyan hue 180)
          instruction = 'DIV'
          if (data === 0) {
            // Use accumulator as dividend, divide by last register value
            const regValues = Object.values(registers)
            if (regValues.length > 0) {
              accumulator = accumulator / regValues[regValues.length - 1]
              registers['ACC'] = accumulator
            }
          } else {
            accumulator = Math.floor(accumulator / data)
            registers['ACC'] = accumulator
          }
        } else if (pixel.hue >= 295 && pixel.hue < 305) {
          // MUL instruction (around hue 300 - Magenta)
          instruction = 'MUL'
          if (data === 0) {
            // Multiply previous register values
            const regValues = Object.values(registers)
            accumulator = regValues.reduce((product, val) => product * val, 1)
            registers['ACC'] = accumulator
          } else {
            accumulator *= data
            registers['ACC'] = accumulator
          }
        } else if (
          (pixel.hue >= 91 && pixel.hue < 100) ||
          pixel.hue === 0 ||
          pixel.hue === 120 ||
          pixel.hue === 240
        ) {
          // LOAD instruction (standard range 91-100 or exact RGB colors 0, 120, 240)
          instruction = 'LOAD'
          registers[`R${registerIndex}`] = data
          registerIndex++
        } else if (pixel.hue >= 331 && pixel.hue < 340) {
          // HALT instruction
          instruction = 'HALT'
          steps.push({
            position: { x, y: 0 },
            instruction,
            data,
            output: stepOutput,
          })
          break
        }

        steps.push({
          position: { x, y: 0 },
          instruction,
          data,
          output: stepOutput,
        })
      }
    } else {
      // Multi-row programs: execute top-to-bottom, then left-to-right (traditional order)
      outerLoop: for (let y = 0; y < program.height; y++) {
        for (let x = 0; x < program.width; x++) {
          const pixel = program.colorField[y][x]

          // Decode instruction based on hue
          let instruction = 'NOP'
          const data = pixel.data || 0
          let stepOutput: string | undefined

          if (pixel.hue >= 271 && pixel.hue < 280) {
            // PRINT instruction
            instruction = 'PRINT'
            let printValue: string

            if (program.id === 'hello-world') {
              // For Hello World, convert ASCII codes to characters
              printValue = String.fromCharCode(data)
              output.push(printValue)
              stepOutput = printValue
            } else if (data === 0 && accumulator !== 0) {
              // Print accumulator value if data is 0 but we have a computed result
              printValue = accumulator.toString()
              output.push(printValue)
              stepOutput = printValue
            } else {
              // Print the data value
              printValue = data.toString()
              output.push(printValue)
              stepOutput = printValue
            }
          } else if ((pixel.hue >= 31 && pixel.hue < 40) || pixel.hue === 60) {
            // ADD instruction (standard range 31-40 or exact Yellow hue 60)
            instruction = 'ADD'
            if (data === 0) {
              // Add previous register values
              const regValues = Object.values(registers)
              accumulator = regValues.reduce((sum, val) => sum + val, 0)
              registers['ACC'] = accumulator
            } else {
              accumulator += data
              registers['ACC'] = accumulator
            }
          } else if ((pixel.hue >= 55 && pixel.hue < 65) || pixel.hue === 300) {
            // MUL instruction (standard range 55-65 or exact Magenta hue 300)
            instruction = 'MUL'
            if (data === 0) {
              // Multiply previous register values
              const regValues = Object.values(registers)
              accumulator = regValues.reduce((product, val) => product * val, 1)
              registers['ACC'] = accumulator
            } else {
              accumulator *= data
              registers['ACC'] = accumulator
            }
          } else if ((pixel.hue >= 175 && pixel.hue < 185) || pixel.hue === 180) {
            // DIV instruction (standard range 175-185 or exact Cyan hue 180)
            instruction = 'DIV'
            if (data === 0) {
              // Use accumulator as dividend, divide by last register value
              const regValues = Object.values(registers)
              if (regValues.length > 0) {
                accumulator = accumulator / regValues[regValues.length - 1]
                registers['ACC'] = accumulator
              }
            } else {
              accumulator = Math.floor(accumulator / data)
              registers['ACC'] = accumulator
            }
          } else if (pixel.hue >= 295 && pixel.hue < 305) {
            // MUL instruction (around hue 300 - Magenta)
            instruction = 'MUL'
            if (data === 0) {
              // Multiply previous register values
              const regValues = Object.values(registers)
              accumulator = regValues.reduce((product, val) => product * val, 1)
              registers['ACC'] = accumulator
            } else {
              accumulator *= data
              registers['ACC'] = accumulator
            }
          } else if (
            (pixel.hue >= 91 && pixel.hue < 100) ||
            pixel.hue === 0 ||
            pixel.hue === 120 ||
            pixel.hue === 240
          ) {
            // LOAD instruction (standard range 91-100 or exact RGB colors 0, 120, 240)
            instruction = 'LOAD'
            registers[`R${registerIndex}`] = data
            registerIndex++
          } else if (pixel.hue >= 331 && pixel.hue < 340) {
            // HALT instruction
            instruction = 'HALT'
            steps.push({
              position: { x, y },
              instruction,
              data,
              output: stepOutput,
            })
            break outerLoop
          }

          steps.push({
            position: { x, y },
            instruction,
            data,
            output: stepOutput,
          })
        }
      }
    }

    setExecutionState(prev => ({
      ...prev,
      steps,
      output,
      registers,
      currentStep: 0,
    }))
  }, [program])

  const handlePlay = useCallback(() => {
    if (executionState.steps.length === 0) {
      executeProgram()
    }
    setExecutionState(prev => ({ ...prev, isRunning: true }))

    // Simulate step-by-step execution
    const interval = setInterval(() => {
      setExecutionState(prev => {
        if (prev.currentStep >= prev.steps.length - 1) {
          clearInterval(interval)
          return { ...prev, isRunning: false }
        }

        const nextStep = prev.currentStep + 1
        const step = prev.steps[nextStep]

        return {
          ...prev,
          currentStep: nextStep,
          programCounter: step.position,
        }
      })
    }, 500)
  }, [executionState.steps.length, executeProgram])

  const handlePause = useCallback(() => {
    setExecutionState(prev => ({ ...prev, isRunning: false }))
  }, [])

  const handleReset = useCallback(() => {
    setExecutionState({
      isRunning: false,
      currentStep: 0,
      steps: [],
      output: [],
      registers: {},
      programCounter: { x: 0, y: 0 },
    })
  }, [])

  const handleStep = useCallback(() => {
    if (executionState.steps.length === 0) {
      executeProgram()
      return
    }

    setExecutionState(prev => {
      if (prev.currentStep >= prev.steps.length - 1) {
        return prev
      }

      const nextStep = prev.currentStep + 1
      const step = prev.steps[nextStep]

      return {
        ...prev,
        currentStep: nextStep,
        programCounter: step.position,
      }
    })
  }, [executionState.steps.length, executeProgram])

  const handlePixelClick = useCallback(
    (x: number, y: number) => {
      if (viewMode === 'edit' && onProgramChange) {
        // Simple pixel editing - cycle through some common instruction colors
        const commonInstructions = [
          { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 1 },
          { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 5 },
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 42 },
          { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
          { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        ]

        const currentPixel = program.colorField[y][x]
        const currentIndex = commonInstructions.findIndex(
          inst => Math.abs(inst.hue - currentPixel.hue) < 5
        )
        const nextIndex = (currentIndex + 1) % commonInstructions.length
        const nextInstruction = commonInstructions[nextIndex]

        const newColorField = program.colorField.map((row, rowIndex) =>
          row.map((pixel, colIndex) =>
            rowIndex === y && colIndex === x ? { ...nextInstruction } : pixel
          )
        )

        onProgramChange({
          ...program,
          colorField: newColorField,
        })
      }
    },
    [viewMode, program, onProgramChange]
  )

  const currentStep = executionState.steps[executionState.currentStep]
  const activePixel =
    executionState.isRunning || executionState.currentStep > 0
      ? executionState.programCounter
      : undefined

  // Special handling for monkey game - render interactive game instead of interpreter
  if (program.id === 'monkey-game') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{program.description}</p>
        </div>
        <MonkeyGame width={program.width} height={program.height} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
          <p className="text-sm text-gray-600">{program.description}</p>
        </div>

        {interactive && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                viewMode === 'edit'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {viewMode === 'edit' ? <Eye size={16} /> : <Edit3 size={16} />}
              {viewMode === 'edit' ? 'View' : 'Edit'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Program Visualization</h4>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <ProgramGrid
                program={program}
                activePixel={activePixel}
                onPixelClick={interactive ? handlePixelClick : undefined}
              />
            </div>
            {viewMode === 'edit' && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click pixels to cycle through common instructions
              </p>
            )}
          </div>

          <ExecutionControls
            state={executionState}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onStep={handleStep}
          />
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-2">Execution State</h4>

          {currentStep && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <div>
                  <strong>Current Instruction:</strong> {currentStep.instruction}
                </div>
                <div>
                  <strong>Position:</strong> ({currentStep.position.x}, {currentStep.position.y})
                </div>
                <div>
                  <strong>Data:</strong> {currentStep.data}
                </div>
                {currentStep.output && (
                  <div>
                    <strong>Output:</strong> {currentStep.output}
                  </div>
                )}
              </div>
            </div>
          )}

          <ExecutionOutput output={executionState.output} registers={executionState.registers} />
        </div>
      </div>
    </div>
  )
}
