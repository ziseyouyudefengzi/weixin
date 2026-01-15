
// pages/game/game.js
const app = getApp()

Page({
  data: {
    currentPlayer: 1, // 1: 黑棋 -1: 白棋
    gameStatus: 'playing', // playing, black_win, white_win, draw
    steps: 0, // 步数计数
    board: null, // 棋盘组件实例
    showControl: false // 是否显示控制面板
  },

  onLoad() {
    // 初始化游戏设置
    this.initGame()
  },

  // 初始化游戏
  initGame() {
    this.setData({
      currentPlayer: -1,  // -1: 白棋先手
      gameStatus: 'playing',
      steps: 0
    })
  },

  // 获取棋盘组件实例
  handleBoardReady(e) {
    this.setData({
      board: e.detail
    })
  },

  // 切换玩家
  switchPlayer() {
    this.setData({
      currentPlayer: -this.data.currentPlayer,
      steps: this.data.steps + 1
    })
  },

  // 处理游戏结束
  handleGameOver(e) {
    const winner = e.detail.winner
    
    this.setData({
      gameStatus: winner
    })
    
    // 震动提示
    wx.vibrateShort()
  },

  // 悔棋
  undoMove() {
    if (this.data.board) {
      this.data.board.undo()
      this.switchPlayer()
    }
  },

  // 重新开始
  restartGame() {
    if (this.data.board) {
      this.data.board.reset()
    }
    this.setData({
      currentPlayer: -1,  // 重新开始时白棋先手
      gameStatus: 'playing',
      steps: 0
    })
  },

  // 显示/隐藏控制面板
  toggleControl() {
    this.setData({
      showControl: !this.data.showControl
    })
  }
})