
// components/board/board.js
Component({
  properties: {
    // 当前玩家: 1-黑棋, -1-白棋
    currentPlayer: {
      type: Number,
      value: 1
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    ctx: null, // canvas上下文
    size: 15,  // 棋盘大小15x15
    cellSize: 0, // 每个格子的像素大小
    padding: 20, // 棋盘边距
    boardWidth: 0, // 棋盘总宽度
    grid: [],   // 棋盘数据 0:空 1:黑 -1:白
    history: [] // 历史记录用于悔棋
  },

  lifetimes: {
    ready() {
      const query = wx.createSelectorQuery().in(this)
      query.select('#board')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const systemInfo = wx.getSystemInfoSync()

            // 设置canvas的像素比，提高清晰度
            const dpr = systemInfo.pixelRatio || 1
            const canvasWidth = systemInfo.windowWidth - 40

            canvas.width = canvasWidth * dpr
            canvas.height = canvasWidth * dpr

            // 样式宽高
            const styleWidth = canvasWidth + 'px'
            const styleHeight = canvasWidth + 'px'

            this.setData({
              boardWidth: canvasWidth,
              cellSize: (canvasWidth - this.data.padding * 2) / (this.data.size - 1),
              grid: Array(this.data.size * this.data.size).fill(0),
              styleWidth,
              styleHeight
            })

            // 保存canvas和上下文
            this.canvas = canvas
            this.data.ctx = ctx

            // 缩放上下文以适应高DPI
            ctx.scale(dpr, dpr)

            this.drawBoard()
            this.triggerEvent('ready', this) // 通知父组件准备就绪
          }
        })
    }
  },

  methods: {
    // 初始化棋盘
    initBoard() {
      const systemInfo = wx.getSystemInfoSync()
      const canvasWidth = systemInfo.windowWidth - 40
      this.setData({
        boardWidth: canvasWidth,
        cellSize: (canvasWidth - this.data.padding * 2) / (this.data.size - 1),
        grid: Array(this.data.size * this.data.size).fill(0)
      })

      // 获取canvas上下文
      this.data.ctx = wx.createCanvasContext('board', this)
      this.drawBoard()
    },

    // 绘制棋盘
    drawBoard() {
      const { ctx, size, padding, boardWidth, cellSize } = this.data

      ctx.fillStyle = '#DCB35C'
      ctx.fillRect(0, 0, boardWidth, boardWidth)

      // 绘制网格线
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      for (let i = 0; i < size; i++) {
        // 横线
        ctx.beginPath()
        ctx.moveTo(padding, padding + i * cellSize)
        ctx.lineTo(boardWidth - padding, padding + i * cellSize)
        ctx.stroke()

        // 竖线
        ctx.beginPath()
        ctx.moveTo(padding + i * cellSize, padding)
        ctx.lineTo(padding + i * cellSize, boardWidth - padding)
        ctx.stroke()
      }

      // 绘制棋子
      this.data.grid.forEach((val, index) => {
        if (val !== 0) {
          const row = Math.floor(index / size)
          const col = index % size
          this.drawPiece(col, row, val)
        }
      })
    },

    // 绘制棋子
    drawPiece(x, y, player) {
      const { ctx, padding, cellSize } = this.data
      const centerX = padding + x * cellSize
      const centerY = padding + y * cellSize
      const radius = cellSize * 0.4

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = player === 1 ? '#000000' : '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = '#999999'
      ctx.lineWidth = 1
      ctx.stroke()
    },

    // 处理触摸事件
    handleTouchStart(e) {
      if (this.properties.disabled) return

      const touch = e.touches[0]
      const { padding, cellSize, size, boardWidth } = this.data
      const rect = e.currentTarget

      // 获取canvas的位置信息
      const query = wx.createSelectorQuery().in(this)
      query.select('#board').boundingClientRect()
      query.exec((res) => {
        if (res[0]) {
          const rect = res[0]
          // 计算相对于canvas的坐标
          const x = touch.clientX - rect.left
          const y = touch.clientY - rect.top

          // 计算点击的格子坐标
          const col = Math.round((x - padding) / cellSize)
          const row = Math.round((y - padding) / cellSize)

          // 检查是否在棋盘内
          if (col >= 0 && col < size && row >= 0 && row < size) {
            const index = row * size + col
            if (this.data.grid[index] === 0) {
              this.placePiece(col, row)
            }
          }
        }
      })
    },

    // 放置棋子
    placePiece(col, row) {
      const { size, grid } = this.data
      const index = row * size + col
      const newGrid = [...grid]

      // 保存当前状态到历史记录
      this.data.history.push([...grid])

      // 更新棋盘数据（使用当前玩家的值：1-黑棋，-1-白棋）
      newGrid[index] = this.properties.currentPlayer
      this.setData({ grid: newGrid })

      // 重绘棋盘
      this.drawBoard()

      // 检查胜负
      const player = this.properties.currentPlayer
      if (this.checkWin(col, row, player)) {
        this.triggerEvent('gameover', {
          winner: player === 1 ? 'black_win' : 'white_win'
        })
      } else if (this.checkDraw()) {
        // 检查平局
        this.triggerEvent('gameover', {
          winner: 'draw'
        })
      } else {
        this.triggerEvent('switchplayer')
      }
    },

    // 检查是否获胜
    checkWin(col, row, player) {
      const { size, grid } = this.data
      const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1] // 横、竖、斜、反斜
      ]

      for (const [dx, dy] of directions) {
        let count = 1

        // 正向检查
        for (let i = 1; i < 5; i++) {
          const x = col + dx * i
          const y = row + dy * i
          if (x >= 0 && x < size && y >= 0 && y < size &&
              grid[y * size + x] === player) {
            count++
          } else {
            break
          }
        }

        // 反向检查
        for (let i = 1; i < 5; i++) {
          const x = col - dx * i
          const y = row - dy * i
          if (x >= 0 && x < size && y >= 0 && y < size &&
              grid[y * size + x] === player) {
            count++
          } else {
            break
          }
        }

        if (count >= 5) return true
      }

      return false
    },

    // 检查是否平局
    checkDraw() {
      const { grid } = this.data
      // 棋盘上没有空位即为平局
      return !grid.some(cell => cell === 0)
    },

    // 悔棋
    undo() {
      if (this.data.history.length > 0) {
        const lastState = this.data.history.pop()
        this.setData({ grid: lastState })
        this.drawBoard()
      }
    },

    // 重置棋盘
    reset() {
      this.setData({
        grid: Array(this.data.size * this.data.size).fill(0),
        history: []
      })
      this.drawBoard()
    }
  }
})