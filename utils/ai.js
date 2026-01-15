
// utils/ai.js
const { checkRules } = require('./game')

// AI难度级别
const AIDifficulty = {
  EASY: 0,
  MEDIUM: 1
}

// 简单AI - 随机落子
function easyAI(board, size) {
  const emptyCells = []
  board.forEach((cell, index) => {
    if (cell === 0) {
      emptyCells.push(index)
    }
  })

  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length)
    const index = emptyCells[randomIndex]
    return {
      x: index % size,
      y: Math.floor(index / size)
    }
  }
  return null
}

// 中等AI - 基础评估
function mediumAI(board, size, player) {
  // 评估每个空位的得分
  const scores = board.map((cell, index) => {
    if (cell !== 0) return -1 // 已有棋子
    
    const x = index % size
    const y = Math.floor(index / size)
    
    // 模拟落子
    const newBoard = [...board]
    newBoard[index] = player
    
    // 检查是否能直接获胜
    if (checkRules.checkWin(newBoard, size, x, y, player)) {
      return 1000 // 最高优先级
    }
    
    // 检查对手下一步是否能获胜（需要阻止）
    newBoard[index] = -player
    if (checkRules.checkWin(newBoard, size, x, y, -player)) {
      return 900 // 高优先级阻止
    }
    newBoard[index] = 0
    
    // 基础评估 - 计算周围棋子数量
    let score = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          const neighbor = board[ny * size + nx]
          if (neighbor === player) score += 5
          else if (neighbor === -player) score += 3
        }
      }
    }
    
    return score
  })
  
  // 找到最高分的落子点
  const maxScore = Math.max(...scores)
  if (maxScore === -1) return null // 没有空位
  
  const bestMoves = []
  scores.forEach((score, index) => {
    if (score === maxScore) {
      bestMoves.push(index)
    }
  })
  
  // 从最佳落子点中随机选择一个
  const randomIndex = Math.floor(Math.random() * bestMoves.length)
  const index = bestMoves[randomIndex]
  return {
    x: index % size,
    y: Math.floor(index / size)
  }
}

// AI决策入口
function makeAIMove(board, size, player, difficulty) {
  switch (difficulty) {
    case AIDifficulty.EASY:
      return easyAI(board, size)
    case AIDifficulty.MEDIUM:
      return mediumAI(board, size, player)
    default:
      return easyAI(board, size)
  }
}

module.exports = {
  AIDifficulty,
  makeAIMove
}