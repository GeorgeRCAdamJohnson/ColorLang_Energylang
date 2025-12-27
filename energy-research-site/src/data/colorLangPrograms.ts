import type { ColorProgram } from '../types'

export const examplePrograms: ColorProgram[] = [
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'Classic "Hello, World!" program that prints the traditional greeting',
    width: 14,
    height: 1,
    colorField: [
      [
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 72 }, // H
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 101 }, // e
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 108 }, // l
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 108 }, // l
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 111 }, // o
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 44 }, // ,
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 32 }, // (space)
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 87 }, // W
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 111 }, // o
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 114 }, // r
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 108 }, // l
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 100 }, // d
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 33 }, // !
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
      ],
    ],
  },
  {
    id: 'arithmetic',
    name: 'Simple Arithmetic',
    description: 'Loads two numbers (5 and 3), adds them, and prints the result (8)',
    width: 6,
    height: 1,
    colorField: [
      [
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 5 },
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 3 },
        { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
    ],
  },
  {
    id: 'counter',
    name: 'Counter Loop',
    description: 'Counts from 1 to 5 using a simple loop structure',
    width: 4,
    height: 3,
    colorField: [
      [
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 1 },
        { hue: 105, saturation: 80, value: 70, instruction: 'STORE', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 1 },
      ],
      [
        { hue: 105, saturation: 80, value: 70, instruction: 'STORE', data: 0 },
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 5 },
        { hue: 155, saturation: 80, value: 70, instruction: 'IF', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
      [
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
    ],
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Sequence',
    description: 'Generates the first few Fibonacci numbers',
    width: 5,
    height: 2,
    colorField: [
      [
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 0 },
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 1 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 1 },
        { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 0 },
      ],
      [
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 115, saturation: 80, value: 70, instruction: 'MOVE', data: 0 },
        { hue: 115, saturation: 80, value: 70, instruction: 'MOVE', data: 0 },
        { hue: 155, saturation: 80, value: 70, instruction: 'IF', data: 0 },
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
      ],
    ],
  },
  {
    id: 'color-demo',
    name: 'Color Processing',
    description: 'Demonstrates color manipulation and HSV operations',
    width: 6,
    height: 2,
    colorField: [
      [
        { hue: 0, saturation: 100, value: 100, instruction: 'LOAD', data: 255 }, // Red
        { hue: 120, saturation: 100, value: 100, instruction: 'LOAD', data: 255 }, // Green
        { hue: 240, saturation: 100, value: 100, instruction: 'LOAD', data: 255 }, // Blue
        { hue: 60, saturation: 100, value: 100, instruction: 'ADD', data: 0 }, // Yellow
        { hue: 300, saturation: 100, value: 100, instruction: 'MUL', data: 0 }, // Magenta
        { hue: 180, saturation: 100, value: 100, instruction: 'DIV', data: 2 }, // Cyan
      ],
      [
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
    ],
  },
  {
    id: 'neural-network',
    name: 'Neural Network Demo',
    description: 'Simplified neural network forward pass demonstration',
    width: 4,
    height: 4,
    colorField: [
      [
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 1 }, // Input 1
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 2 }, // Input 2
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 3 }, // Weight 1
        { hue: 95, saturation: 80, value: 70, instruction: 'LOAD', data: 4 }, // Weight 2
      ],
      [
        { hue: 55, saturation: 80, value: 70, instruction: 'MUL', data: 0 }, // Multiply
        { hue: 55, saturation: 80, value: 70, instruction: 'MUL', data: 0 }, // Multiply
        { hue: 35, saturation: 80, value: 70, instruction: 'ADD', data: 0 }, // Sum
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 }, // Output
      ],
      [
        { hue: 20, saturation: 80, value: 70, instruction: 'NN_FORWARD', data: 0 }, // Neural forward
        { hue: 275, saturation: 80, value: 70, instruction: 'PRINT', data: 0 },
        { hue: 335, saturation: 80, value: 70, instruction: 'HALT', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
      [
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
        { hue: 0, saturation: 0, value: 100, instruction: 'NOP', data: 0 },
      ],
    ],
  },
]

export function getExampleProgram(id: string): ColorProgram | undefined {
  return examplePrograms.find(program => program.id === id)
}

export function getAllExamplePrograms(): ColorProgram[] {
  return examplePrograms
}
