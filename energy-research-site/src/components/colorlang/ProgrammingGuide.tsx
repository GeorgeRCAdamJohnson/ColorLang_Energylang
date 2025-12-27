import { useState } from 'react'
import { BookOpen, Lightbulb, Code2, Palette, ArrowRight, CheckCircle } from 'lucide-react'

interface TutorialStep {
  title: string
  description: string
  colorCode: string
  hue: number
  saturation: number
  value: number
  instruction: string
  data?: number
  tip: string
}

interface Tutorial {
  id: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  steps: TutorialStep[]
  finalProgram: {
    width: number
    height: number
    colorField: Array<
      Array<{
        hue: number
        saturation: number
        value: number
        instruction: string
        data: number
      }>
    >
  }
}

const tutorials: Tutorial[] = [
  {
    id: 'simple-print',
    title: 'Your First Program: Print a Number',
    difficulty: 'Beginner',
    description: 'Learn to create a simple program that prints the number 42',
    steps: [
      {
        title: 'Step 1: Load the Number',
        description: 'First, we need to load the number 42 into a register',
        colorCode: 'hsl(95, 80%, 70%)',
        hue: 95,
        saturation: 80,
        value: 70,
        instruction: 'LOAD',
        data: 42,
        tip: 'LOAD instructions use green hues (91-100°). The data field contains the value to load.',
      },
      {
        title: 'Step 2: Print the Number',
        description: 'Now we print the loaded value to the output',
        colorCode: 'hsl(275, 80%, 70%)',
        hue: 275,
        saturation: 80,
        value: 70,
        instruction: 'PRINT',
        data: 0,
        tip: 'PRINT instructions use purple hues (271-280°). Data=0 means print from register.',
      },
      {
        title: 'Step 3: Halt the Program',
        description: 'Finally, we halt the program execution',
        colorCode: 'hsl(335, 80%, 70%)',
        hue: 335,
        saturation: 80,
        value: 70,
        instruction: 'HALT',
        data: 0,
        tip: 'HALT instructions use red hues (331-340°). This stops program execution.',
      },
    ],
    finalProgram: {
      width: 3,
      height: 1,
      colorField: [
        [
          { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 42 },
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
          { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        ],
      ],
    },
  },
  {
    id: 'simple-math',
    title: 'Basic Math: Addition',
    difficulty: 'Beginner',
    description: 'Create a program that adds two numbers and prints the result',
    steps: [
      {
        title: 'Step 1: Load First Number',
        description: 'Load the first number (10) into register R0',
        colorCode: 'hsl(95, 80%, 70%)',
        hue: 95,
        saturation: 80,
        value: 70,
        instruction: 'LOAD',
        data: 10,
        tip: 'Each LOAD instruction automatically uses the next available register (R0, R1, R2...)',
      },
      {
        title: 'Step 2: Load Second Number',
        description: 'Load the second number (5) into register R1',
        colorCode: 'hsl(95, 80%, 70%)',
        hue: 95,
        saturation: 80,
        value: 70,
        instruction: 'LOAD',
        data: 5,
        tip: 'This will automatically go into R1 since R0 is already used',
      },
      {
        title: 'Step 3: Add the Numbers',
        description: 'Add the two loaded numbers together',
        colorCode: 'hsl(35, 80%, 70%)',
        hue: 35,
        saturation: 80,
        value: 70,
        instruction: 'ADD',
        data: 0,
        tip: 'ADD instructions use orange hues (31-40°). Data=0 means add all register values.',
      },
      {
        title: 'Step 4: Print Result',
        description: 'Print the calculated result',
        colorCode: 'hsl(275, 80%, 70%)',
        hue: 275,
        saturation: 80,
        value: 70,
        instruction: 'PRINT',
        data: 0,
        tip: 'This will print the result from the accumulator (ACC register)',
      },
      {
        title: 'Step 5: Halt',
        description: 'Stop the program',
        colorCode: 'hsl(335, 80%, 70%)',
        hue: 335,
        saturation: 80,
        value: 70,
        instruction: 'HALT',
        data: 0,
        tip: 'Always end your programs with HALT to prevent undefined behavior',
      },
    ],
    finalProgram: {
      width: 5,
      height: 1,
      colorField: [
        [
          { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 10 },
          { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 5 },
          { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 0 },
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
          { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        ],
      ],
    },
  },
  {
    id: 'custom-message',
    title: 'Print Custom Text',
    difficulty: 'Intermediate',
    description: 'Learn to print custom text using ASCII character codes',
    steps: [
      {
        title: 'Step 1: Understand ASCII',
        description: 'Each character has an ASCII code: A=65, B=66, space=32, etc.',
        colorCode: 'hsl(275, 80%, 70%)',
        hue: 275,
        saturation: 80,
        value: 70,
        instruction: 'PRINT',
        data: 65,
        tip: 'PRINT with a data value prints that ASCII character. Try A=65, B=66, space=32',
      },
      {
        title: 'Step 2: Plan Your Message',
        description: 'Decide what text you want to print and look up ASCII codes',
        colorCode: 'hsl(275, 80%, 70%)',
        hue: 275,
        saturation: 80,
        value: 70,
        instruction: 'PRINT',
        data: 72,
        tip: 'Common ASCII: H=72, i=105, space=32, !=33. Use an ASCII table for reference.',
      },
      {
        title: 'Step 3: Create Print Sequence',
        description: 'Add one PRINT instruction for each character',
        colorCode: 'hsl(275, 80%, 70%)',
        hue: 275,
        saturation: 80,
        value: 70,
        instruction: 'PRINT',
        data: 105,
        tip: 'For "Hi": PRINT(72) for H, PRINT(105) for i, then HALT',
      },
      {
        title: 'Step 4: End with HALT',
        description: 'Always finish with a HALT instruction',
        colorCode: 'hsl(335, 80%, 70%)',
        hue: 335,
        saturation: 80,
        value: 70,
        instruction: 'HALT',
        data: 0,
        tip: 'HALT stops execution. Without it, the program might continue into undefined memory.',
      },
    ],
    finalProgram: {
      width: 4,
      height: 1,
      colorField: [
        [
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 72 }, // H
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 105 }, // i
          { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 33 }, // !
          { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        ],
      ],
    },
  },
]

const programmingTips = [
  {
    category: 'Color Basics',
    tips: [
      'Green hues (91-100°) are for LOAD operations - loading data into registers',
      'Orange hues (31-40°) are for ADD operations - mathematical addition',
      'Purple hues (271-280°) are for PRINT operations - outputting data',
      'Red hues (331-340°) are for HALT operations - stopping the program',
    ],
  },
  {
    category: 'Program Structure',
    tips: [
      'Programs execute left-to-right for single rows, top-to-bottom for multiple rows',
      'Always end your programs with a HALT instruction',
      'Use consistent saturation (80%) and value (70%) for standard instructions',
      'Each pixel represents exactly one instruction or data element',
    ],
  },
  {
    category: 'Common Patterns',
    tips: [
      'Load-Print pattern: LOAD(value) → PRINT(0) → HALT(0)',
      'Math pattern: LOAD(a) → LOAD(b) → ADD(0) → PRINT(0) → HALT(0)',
      'Text pattern: PRINT(ascii1) → PRINT(ascii2) → ... → HALT(0)',
      'Use data=0 in operations to work with register values',
    ],
  },
  {
    category: 'Debugging Tips',
    tips: [
      'Use the step-by-step execution to see exactly what each pixel does',
      'Check the register values to see if data is loading correctly',
      "Verify your ASCII codes if text isn't printing as expected",
      'Make sure your program has the right width and height dimensions',
    ],
  },
]

interface TutorialStepProps {
  step: TutorialStep
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

function TutorialStepComponent({
  step,
  stepNumber,
  isActive,
  isCompleted,
  onClick,
}: TutorialStepProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : isCompleted
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isCompleted ? <CheckCircle size={14} /> : stepNumber}
        </div>
        <h4 className="font-semibold text-gray-900">{step.title}</h4>
      </div>

      <p className="text-sm text-gray-600 mb-3">{step.description}</p>

      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 border border-gray-300 rounded"
          style={{ backgroundColor: step.colorCode }}
          title={`HSV(${step.hue}, ${step.saturation}%, ${step.value}%)`}
        />
        <div className="text-sm">
          <span className="font-mono font-semibold">{step.instruction}</span>
          {step.data !== undefined && <span className="text-gray-600"> (data: {step.data})</span>}
        </div>
      </div>

      <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
        <Lightbulb size={12} className="inline mr-1" />
        {step.tip}
      </div>
    </div>
  )
}

export function ProgrammingGuide() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<'tutorials' | 'tips'>('tutorials')

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    const newCompleted = new Set(completedSteps)
    newCompleted.add(stepIndex)
    setCompletedSteps(newCompleted)
  }

  const resetTutorial = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="heading-lg mb-4">ColorLang Programming Guide</h2>
        <p className="text-body max-w-3xl mx-auto">
          Learn to create your own ColorLang programs with step-by-step tutorials, programming tips,
          and interactive examples.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tutorials'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="inline mr-2" size={16} />
            Tutorials
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lightbulb className="inline mr-2" size={16} />
            Tips & Hints
          </button>
        </div>
      </div>

      {activeTab === 'tutorials' && (
        <div>
          {!selectedTutorial ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map(tutorial => (
                <div
                  key={tutorial.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="text-blue-600" size={20} />
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tutorial.difficulty === 'Beginner'
                          ? 'bg-green-100 text-green-800'
                          : tutorial.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tutorial.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                  <div className="flex items-center text-sm text-blue-600">
                    <span>Start Tutorial</span>
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTutorial.title}</h3>
                  <p className="text-gray-600">{selectedTutorial.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetTutorial}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setSelectedTutorial(null)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Back to Tutorials
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Tutorial Steps</h4>
                  <div className="space-y-3">
                    {selectedTutorial.steps.map((step, index) => (
                      <TutorialStepComponent
                        key={index}
                        step={step}
                        stepNumber={index + 1}
                        isActive={currentStep === index}
                        isCompleted={completedSteps.has(index)}
                        onClick={() => handleStepClick(index)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Program Preview</h4>
                  <div className="card">
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">Final Program Structure</h5>
                      <div className="text-sm text-gray-600 mb-3">
                        Size: {selectedTutorial.finalProgram.width} ×{' '}
                        {selectedTutorial.finalProgram.height}
                      </div>
                      <div className="inline-block border border-gray-300 bg-white">
                        {selectedTutorial.finalProgram.colorField.map((row, y) => (
                          <div key={y} className="flex">
                            {row.map((pixel, x) => (
                              <div
                                key={`${x}-${y}`}
                                className="w-8 h-8 border border-gray-200"
                                style={{
                                  backgroundColor: `hsl(${pixel.hue}, ${pixel.saturation}%, ${pixel.value}%)`,
                                }}
                                title={`${pixel.instruction} (${pixel.data})`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <h6 className="font-medium text-gray-800 mb-2">Instructions:</h6>
                      <div className="space-y-1">
                        {selectedTutorial.finalProgram.colorField[0].map((pixel, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 border border-gray-300"
                              style={{
                                backgroundColor: `hsl(${pixel.hue}, ${pixel.saturation}%, ${pixel.value}%)`,
                              }}
                            />
                            <span className="font-mono text-xs">
                              {pixel.instruction}({pixel.data})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="grid md:grid-cols-2 gap-6">
          {programmingTips.map((category, index) => (
            <div key={index} className="card">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="text-purple-600" size={20} />
                <h3 className="font-semibold text-gray-900">{category.category}</h3>
              </div>
              <ul className="space-y-3">
                {category.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ready to Create Your Own Program?
        </h3>
        <p className="text-gray-700 mb-4">
          Use the Interactive Examples section to experiment with the existing programs, or try
          creating your own using the programming patterns you've learned here.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Start with simple LOAD → PRINT → HALT patterns</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Use the step debugger to understand execution flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Experiment with different color combinations</span>
          </div>
        </div>
      </div>
    </section>
  )
}
