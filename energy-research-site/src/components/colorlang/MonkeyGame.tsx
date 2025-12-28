import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

interface GameState {
  monkeyX: number
  monkeyY: number
  bananas: Array<{ x: number; y: number; collected: boolean }>
  obstacles: Array<{ x: number; y: number }>
  score: number
  gameRunning: boolean
  gameOver: boolean
  message: string
}

interface MonkeyGameProps {
  width?: number
  height?: number
}

export function MonkeyGame({ width = 8, height = 6 }: MonkeyGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    monkeyX: 1,
    monkeyY: 1,
    bananas: [
      { x: 6, y: 2, collected: false },
      { x: 3, y: 4, collected: false },
      { x: 7, y: 1, collected: false },
      { x: 2, y: 5, collected: false },
      { x: 5, y: 3, collected: false },
    ],
    obstacles: [
      { x: 4, y: 2 },
      { x: 2, y: 3 },
      { x: 6, y: 4 },
      { x: 1, y: 4 },
    ],
    score: 0,
    gameRunning: false,
    gameOver: false,
    message: 'Use WASD keys or arrow buttons to move the monkey and collect bananas!',
  })

  const resetGame = useCallback(() => {
    setGameState({
      monkeyX: 1,
      monkeyY: 1,
      bananas: [
        { x: 6, y: 2, collected: false },
        { x: 3, y: 4, collected: false },
        { x: 7, y: 1, collected: false },
        { x: 2, y: 5, collected: false },
        { x: 5, y: 3, collected: false },
      ],
      obstacles: [
        { x: 4, y: 2 },
        { x: 2, y: 3 },
        { x: 6, y: 4 },
        { x: 1, y: 4 },
      ],
      score: 0,
      gameRunning: false,
      gameOver: false,
      message: 'Use WASD keys or arrow buttons to move the monkey and collect bananas!',
    })
  }, [])

  const moveMonkey = useCallback((dx: number, dy: number) => {
    if (!gameState.gameRunning || gameState.gameOver) return

    setGameState(prev => {
      const newX = Math.max(0, Math.min(width - 1, prev.monkeyX + dx))
      const newY = Math.max(0, Math.min(height - 1, prev.monkeyY + dy))

      // Check for obstacle collision
      const hitObstacle = prev.obstacles.some(obs => obs.x === newX && obs.y === newY)
      if (hitObstacle) {
        return {
          ...prev,
          gameOver: true,
          gameRunning: false,
          message: '💥 Game Over! You hit an obstacle! Click Reset to try again.',
        }
      }

      // Check for banana collection
      const updatedBananas = prev.bananas.map(banana => {
        if (banana.x === newX && banana.y === newY && !banana.collected) {
          return { ...banana, collected: true }
        }
        return banana
      })

      const newScore = updatedBananas.filter(b => b.collected).length * 10
      const allBananasCollected = updatedBananas.every(b => b.collected)

      let message = prev.message
      if (newScore > prev.score) {
        message = `🍌 Banana collected! Score: ${newScore}`
      }
      if (allBananasCollected) {
        message = '🎉 Congratulations! You collected all bananas! You win!'
        return {
          ...prev,
          monkeyX: newX,
          monkeyY: newY,
          bananas: updatedBananas,
          score: newScore,
          gameOver: true,
          gameRunning: false,
          message,
        }
      }

      return {
        ...prev,
        monkeyX: newX,
        monkeyY: newY,
        bananas: updatedBananas,
        score: newScore,
        message,
      }
    })
  }, [gameState.gameRunning, gameState.gameOver, width, height])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.gameRunning || gameState.gameOver) return

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          event.preventDefault()
          moveMonkey(0, -1)
          break
        case 's':
        case 'arrowdown':
          event.preventDefault()
          moveMonkey(0, 1)
          break
        case 'a':
        case 'arrowleft':
          event.preventDefault()
          moveMonkey(-1, 0)
          break
        case 'd':
        case 'arrowright':
          event.preventDefault()
          moveMonkey(1, 0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveMonkey, gameState.gameRunning, gameState.gameOver])

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameRunning: true,
      message: 'Game started! Collect all bananas while avoiding obstacles!',
    }))
  }

  const pauseGame = () => {
    setGameState(prev => ({
      ...prev,
      gameRunning: false,
      message: 'Game paused. Click Play to continue.',
    }))
  }

  const renderCell = (x: number, y: number) => {
    const isMonkey = gameState.monkeyX === x && gameState.monkeyY === y
    const banana = gameState.bananas.find(b => b.x === x && b.y === y && !b.collected)
    const obstacle = gameState.obstacles.find(o => o.x === x && o.y === y)

    let content = ''
    let bgColor = 'bg-green-100'
    let textColor = 'text-gray-400'

    if (isMonkey) {
      content = '🐵'
      bgColor = 'bg-yellow-200'
    } else if (banana) {
      content = '🍌'
      bgColor = 'bg-yellow-100'
    } else if (obstacle) {
      content = '🪨'
      bgColor = 'bg-gray-300'
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`w-12 h-12 border border-gray-300 flex items-center justify-center text-lg ${bgColor} ${textColor} transition-all duration-200`}
      >
        {content}
      </div>
    )
  }

  const remainingBananas = gameState.bananas.filter(b => !b.collected).length

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🐵 Monkey Banana Collector</h3>
        <p className="text-sm text-gray-600 mb-4">{gameState.message}</p>
      </div>

      {/* Game Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={gameState.gameRunning ? pauseGame : startGame}
          disabled={gameState.gameOver}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {gameState.gameRunning ? <Pause size={16} /> : <Play size={16} />}
          {gameState.gameRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <div className="text-sm text-gray-600">
          Score: <span className="font-bold">{gameState.score}</span>
        </div>

        <div className="text-sm text-gray-600">
          Bananas left: <span className="font-bold">{remainingBananas}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center">
        <div className="inline-block border-2 border-gray-400 bg-white rounded-lg overflow-hidden">
          {Array.from({ length: height }, (_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: width }, (_, x) => renderCell(x, y))}
            </div>
          ))}
        </div>
      </div>

      {/* Movement Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-600 mb-2">Movement Controls:</div>
        <div className="grid grid-cols-3 gap-1 w-32">
          <div></div>
          <button
            onClick={() => moveMonkey(0, -1)}
            disabled={!gameState.gameRunning || gameState.gameOver}
            className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded transition-colors"
            title="Move Up (W)"
          >
            <ArrowUp size={16} />
          </button>
          <div></div>
          <button
            onClick={() => moveMonkey(-1, 0)}
            disabled={!gameState.gameRunning || gameState.gameOver}
            className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded transition-colors"
            title="Move Left (A)"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="p-2 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">WASD</span>
          </div>
          <button
            onClick={() => moveMonkey(1, 0)}
            disabled={!gameState.gameRunning || gameState.gameOver}
            className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded transition-colors"
            title="Move Right (D)"
          >
            <ArrowRight size={16} />
          </button>
          <div></div>
          <button
            onClick={() => moveMonkey(0, 1)}
            disabled={!gameState.gameRunning || gameState.gameOver}
            className="p-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded transition-colors"
            title="Move Down (S)"
          >
            <ArrowDown size={16} />
          </button>
          <div></div>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          Use WASD keys or click the arrow buttons to move
        </div>
      </div>

      {/* Game Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐵</span>
          <span>Monkey (You)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🍌</span>
          <span>Banana (+10 points)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🪨</span>
          <span>Obstacle (Avoid!)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded"></div>
          <span>Safe ground</span>
        </div>
      </div>

      {/* ColorLang Connection */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🎨 ColorLang Implementation</h4>
        <p className="text-sm text-blue-800">
          This interactive monkey game demonstrates how ColorLang programs can create engaging
          experiences. The game logic includes position tracking, collision detection, scoring
          systems, and user input handling - all concepts that would be encoded in ColorLang's
          HSV-based instruction system.
        </p>
        <div className="mt-2 text-xs text-blue-700">
          <strong>Key ColorLang concepts demonstrated:</strong> INPUT instructions for movement,
          COMPARE for collision detection, ADD for scoring, conditional JUMP for game loops, and
          PRINT for status updates.
        </div>
      </div>
    </div>
  )
}