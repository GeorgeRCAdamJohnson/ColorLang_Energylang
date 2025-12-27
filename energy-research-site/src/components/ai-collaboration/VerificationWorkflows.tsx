import { useState } from 'react'
import { CheckCircle, XCircle, Code, TestTube, Eye, ArrowRight } from 'lucide-react'

interface VerificationExample {
  id: string
  title: string
  context: string
  aiPrompt: string
  beforeCode: string
  afterCode: string
  verificationSteps: {
    type: 'automated' | 'review' | 'user'
    description: string
    result: 'pass' | 'fail' | 'improvement'
    details: string
  }[]
  outcome: string
  lessonsLearned: string[]
}

const verificationExamples: VerificationExample[] = [
  {
    id: 'benchmark-idempotency',
    title: 'Benchmark Database Idempotency',
    context:
      'Adding duplicate run detection to prevent data corruption in energy measurement database',
    aiPrompt:
      'Patch `tools/import_benchmark_runs_log_to_db.py` to add idempotency by computing `run_hash` from `source+benchmark+iteration` and skip inserts when present; add unit tests that assert duplicate runs are ignored.',
    beforeCode: `def import_benchmark_run(conn, run_data):
    """Import benchmark run without duplicate checking"""
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO benchmark_runs 
        (source, benchmark, iteration, runtime_ms, energy_j)
        VALUES (%s, %s, %s, %s, %s)
    """, (run_data['source'], run_data['benchmark'], 
          run_data['iteration'], run_data['runtime_ms'], 
          run_data['energy_j']))
    conn.commit()`,
    afterCode: `def import_benchmark_run(conn, run_data):
    """Import benchmark run with idempotency checking"""
    # Compute hash for duplicate detection
    run_hash = hashlib.sha256(
        f"{run_data['source']}{run_data['benchmark']}{run_data['iteration']}"
        .encode()
    ).hexdigest()
    
    cursor = conn.cursor()
    
    # Check if run already exists
    cursor.execute(
        "SELECT id FROM benchmark_runs WHERE run_hash = %s", 
        (run_hash,)
    )
    if cursor.fetchone():
        return  # Skip duplicate
    
    # Insert new run with hash
    cursor.execute("""
        INSERT INTO benchmark_runs 
        (source, benchmark, iteration, runtime_ms, energy_j, run_hash)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (run_data['source'], run_data['benchmark'], 
          run_data['iteration'], run_data['runtime_ms'], 
          run_data['energy_j'], run_hash))
    conn.commit()`,
    verificationSteps: [
      {
        type: 'automated',
        description: 'Unit tests for duplicate detection logic',
        result: 'pass',
        details:
          'Tests confirmed duplicate runs are properly skipped, hash computation is consistent',
      },
      {
        type: 'automated',
        description: 'Integration test with disposable PostgreSQL',
        result: 'improvement',
        details: 'Revealed need for database migration to add run_hash column',
      },
      {
        type: 'review',
        description: 'Code review for edge cases and performance',
        result: 'improvement',
        details: 'Added index on run_hash column for faster duplicate lookups',
      },
      {
        type: 'user',
        description: 'Manual testing with real benchmark data',
        result: 'pass',
        details: 'Confirmed no data loss, proper duplicate handling in production scenarios',
      },
    ],
    outcome:
      'Successfully prevented database corruption from duplicate imports while maintaining performance',
    lessonsLearned: [
      'AI-generated code needed database schema considerations',
      'Integration tests caught issues unit tests missed',
      'Performance implications required human architectural review',
    ],
  },
  {
    id: 'colorlang-interpreter',
    title: 'ColorLang Instruction Execution',
    context: 'Implementing HSV-based instruction parsing for visual programming language',
    aiPrompt:
      'Create a ColorLang interpreter that maps HSV hue values to instructions: 0°=LOAD, 60°=ADD, 120°=MUL, 180°=DIV, 240°=PRINT, 300°=HALT. Include exact hue matching with tolerance.',
    beforeCode: `function executeInstruction(hue: number, saturation: number, value: number) {
    // Simple hue-based instruction mapping
    if (hue < 30) return 'LOAD';
    if (hue < 90) return 'ADD';
    if (hue < 150) return 'MUL';
    if (hue < 210) return 'DIV';
    if (hue < 270) return 'PRINT';
    return 'HALT';
}`,
    afterCode: `function executeInstruction(hue: number, saturation: number, value: number): Instruction {
    const TOLERANCE = 5; // degrees
    const instructions = [
        { hue: 0, op: 'LOAD' },
        { hue: 60, op: 'ADD' },
        { hue: 120, op: 'MUL' },
        { hue: 180, op: 'DIV' },
        { hue: 240, op: 'PRINT' },
        { hue: 300, op: 'HALT' }
    ];
    
    // Find exact match within tolerance
    for (const instr of instructions) {
        const diff = Math.min(
            Math.abs(hue - instr.hue),
            360 - Math.abs(hue - instr.hue) // Handle wraparound
        );
        if (diff <= TOLERANCE) {
            return {
                operation: instr.op,
                operand: saturation > 50 ? value : null,
                position: { hue, saturation, value }
            };
        }
    }
    
    throw new Error(\`Invalid instruction hue: \${hue}°\`);
}`,
    verificationSteps: [
      {
        type: 'automated',
        description: 'Property-based tests with random HSV values',
        result: 'improvement',
        details: 'Discovered edge case with hue wraparound at 360°/0° boundary',
      },
      {
        type: 'automated',
        description: 'Unit tests for all 6 example programs',
        result: 'pass',
        details: 'All example programs execute correctly with expected output',
      },
      {
        type: 'review',
        description: 'Visual validation of color-to-instruction mapping',
        result: 'improvement',
        details: 'Added visual debugging mode to show instruction recognition',
      },
      {
        type: 'user',
        description: 'Interactive testing with color picker',
        result: 'pass',
        details: 'Users can successfully create and modify color programs',
      },
    ],
    outcome: 'Robust interpreter that handles edge cases and provides clear visual feedback',
    lessonsLearned: [
      'Property-based testing revealed mathematical edge cases',
      'Visual programming requires visual debugging tools',
      'User testing essential for intuitive color-to-code mapping',
    ],
  },
]

export function VerificationWorkflows() {
  const [selectedExample, setSelectedExample] = useState<string>(verificationExamples[0].id)
  const [showCode, setShowCode] = useState<'before' | 'after'>('before')

  const currentExample = verificationExamples.find(ex => ex.id === selectedExample)!

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'automated':
        return <TestTube className="w-5 h-5" />
      case 'review':
        return <Eye className="w-5 h-5" />
      case 'user':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Code className="w-5 h-5" />
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'improvement':
        return <ArrowRight className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-lg mb-4">Rigorous Verification Workflows</h2>
        <p className="text-body max-w-3xl mx-auto">
          Every AI-generated solution underwent three-layer verification: automated testing, human
          code review, and user validation. Here are real examples showing how this process caught
          issues and improved code quality.
        </p>
      </div>

      {/* Example Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {verificationExamples.map(example => (
          <button
            key={example.id}
            onClick={() => setSelectedExample(example.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedExample === example.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* Selected Example */}
      <div className="card">
        <div className="mb-6">
          <h3 className="heading-md mb-2">{currentExample.title}</h3>
          <p className="text-body mb-4">{currentExample.context}</p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">AI Prompt Used:</h4>
            <p className="text-sm text-blue-800 font-mono bg-blue-100 p-2 rounded">
              "{currentExample.aiPrompt}"
            </p>
          </div>
        </div>

        {/* Code Comparison */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCode('before')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCode === 'before'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Before (AI Initial)
            </button>
            <button
              onClick={() => setShowCode('after')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCode === 'after'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              After (Verified & Improved)
            </button>
          </div>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>
                {showCode === 'before' ? currentExample.beforeCode : currentExample.afterCode}
              </code>
            </pre>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Verification Process</h4>
          <div className="space-y-4">
            {currentExample.verificationSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div
                    className={`p-2 rounded-lg ${
                      step.type === 'automated'
                        ? 'bg-purple-100 text-purple-600'
                        : step.type === 'review'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {getStepIcon(step.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">{step.description}</h5>
                    {getResultIcon(step.result)}
                  </div>
                  <p className="text-sm text-gray-600">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome and Lessons */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Final Outcome</h4>
            <p className="text-sm text-gray-600">{currentExample.outcome}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Lessons Learned</h4>
            <ul className="space-y-1">
              {currentExample.lessonsLearned.map((lesson, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
