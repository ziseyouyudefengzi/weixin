
// utils/game.js

// 游戏状态枚举
const GameStatus = {
  PLAYING: 'playing',
  BLACK_WIN: 'black_win',
  WHITE_WIN: 'white_win',
  DRAW: 'draw'
}

// 游戏规则检查
const checkRules = {
  // 检查五子连珠
  checkWin(board, size, x, y, player) {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1] // 横、竖、斜、反斜
    ]

    for (const [dx, dy] of directions) {
      let count = 1
      
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i
        const ny = y + dy * i
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && 
            board[ny * size + nx] === player) {
          count++
        } else {
          break
        }
      }
      
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i
        const ny = y - dy * i
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && 
            board[ny * size + nx] === player) {
          count++
        } else {
          break
        }
      }
      
      if (count >= 5) return true
    }
    
    return false
  },

  // 检查平局
  checkDraw(board) {
    return board.every(cell => cell !== 0)
  }
}

// 游戏状态管理
const gameManager = {
  // 初始化游戏
  initGame(size) {
    return {
      board: Array(size * size).fill(0),
      currentPlayer: 1, // 1:黑棋 -1:白棋
      status: GameStatus.PLAYING,
      steps: 0,
      history: []
    }
  },

  // 执行落子
  makeMove(gameState, x, y) {
    const { board, size, currentPlayer } = gameState
    const index = y * size + x
    
    if (board[index] !== 0) return null // 非法移动
    
    const newState = { ...gameState }
    newState.board = [...board]
    newState.board[index] = currentPlayer
    newState.steps++
    newState.history.push([...board])
    
    // 检查游戏状态
    if (checkRules.checkWin(newState.board, size, x, y, currentPlayer)) {
      newState.status = currentPlayer === 1 ? GameStatus.BLACK_WIN : GameStatus.WHITE_WIN
    } else if (checkRules.checkDraw(newState.board)) {
      newState.status = GameStatus.DRAW
    } else {
      newState.currentPlayer = -currentPlayer
    }
    
    return newState
  },

  // 悔棋
  undoMove(gameState) {
    if (gameState.history.length === 0) return gameState
    
    const newState = { ...gameState }
    newState.board = gameState.history.pop()
    newState.currentPlayer = -gameState.currentPlayer
    newState.steps--
    newState.status = GameStatus.PLAYING
    
    return newState
  }
}

module.exports = {
  GameStatus,
  checkRules,
  gameManager
}