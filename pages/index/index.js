
// pages/index/index.js
const app = getApp()

Page({
  data: {
    gameMode: null, // 当前选择的游戏模式
    aiDifficulty: 0, // 当前选择的AI难度
    showDifficulty: false // 是否显示难度选择
  },

  // 选择游戏模式
  selectMode(e) {
    const mode = parseInt(e.currentTarget.dataset.mode)
    this.setData({
      gameMode: mode,
      showDifficulty: mode === 1 // 人机模式显示难度选择
    })
  },

  // 选择AI难度
  selectDifficulty(e) {
    this.setData({
      aiDifficulty: parseInt(e.currentTarget.dataset.difficulty)
    })
  },

  // 开始游戏
  startGame() {
    if (this.data.gameMode === null) {
      wx.showToast({
        title: '请选择游戏模式',
        icon: 'none'
      })
      return
    }

    // 保存全局设置
    app.globalData.gameMode = this.data.gameMode
    app.globalData.aiDifficulty = this.data.aiDifficulty

    // 跳转到游戏页
    wx.navigateTo({
      url: '/pages/game/game'
    })
  }
})