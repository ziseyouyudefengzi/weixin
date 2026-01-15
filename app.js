
// 游戏模式枚举
const GameMode = {
  PVP: 0, // 双人对战
  PVE: 1  // 人机对战
}

// AI难度级别
const AIDifficulty = {
  EASY: 0,
  MEDIUM: 1
}

App({
  globalData: {
    gameMode: null,    // 当前游戏模式
    aiDifficulty: AIDifficulty.EASY, // AI难度
    firstPlayer: 1,    // 1:黑棋先手 -1:白棋后手
  },
  
  onLaunch() {
    // 初始化云开发（如需）
    // wx.cloud.init()
  }
})