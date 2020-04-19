const GAME_HEIGHT = 8
const GAME_WIDTH = 15
const TOP_OFFSET = 7
const GRID_ITEM_SIZE = 16
const GRID_ITEM_OFFSET = 8
const SHOCK_DELAY = 66

export default class GameState {
  constructor ({ items, tries, leakShock }, scene) {
    this.scene = scene

    this.gridItems = []
    this.player = null
    this.tries = tries
    this.moves = 0
    this.won = false
    this.leakShock = leakShock
    console.log(leakShock)
    this.createGrid()
    this.createItems(items)
    this.checkGravity()
    this.checkVoltage()
  }

  movePlayer (dir) {
    const result = this.move(this.player, dir)

    if (result) {
      this.moves++
      this.scene.playMove(this.moves)
      this.scene.hud.updateMoves(this.tries - this.moves)
    } else {
      this.scene.playShock(this.moves)
    }

    this.moveChars()

    this.checkGravity()

    this.checkVoltage()

    if (this.moves === this.tries && !this.won) {
      this.lose()
    }
  }

  move (item, dir, forGravity = false) {
    const { x, y } = item

    const { x: newX, y: newY } = getDirXAndY(dir, x, y)

    const tile = this.getItemAt(newX, newY)
    if (!tile) {
      return false
    }

    if (tile.item) {
      if (!tile.item.movable) {
        return false
      }

      const results = this.move(tile.item, dir, forGravity)

      if (!results) {
        return false
      }
    }

    item.x = newX
    item.y = newY
    tile.item = item

    const oldTile = this.getItemAt(x, y, this.grid)
    oldTile.item = null

    item.sprite.moveTo(tile.xPos, tile.yPos, forGravity)
    return true
  }

  moveChars () {
    this.allItems.map(item => {
      if (item.isChar) {
        const move = this.move(item, item.facing)

        if (!move) {
          item.facing = item.facing === 'left' ? 'right' : 'left'
        }
      }
    })
  }

  checkGravity () {
    this.allItems.map(item => {
      if (item.gravity) {
        let it = this.move(item, 'down', true)
        if (it) {
          this.scene.playGravity()
        }

        while (it) {
          it = this.move(item, 'down', true)
        }
      }
    })
  }

  checkVoltage () {
    let curr = this.startNode
    let currDir = this.startNode.dirs[0]
    const items = [curr.sprite]

    while (true) {
      const inverse = getInverse(currDir)
      const { x: newX, y: newY } = getDirXAndY(currDir, curr.x, curr.y)
      const toTile = this.getItemAt(newX, newY)

      if (toTile && toTile.item && toTile.item.dirs && toTile.item.dirs.includes(inverse)) {
        curr = toTile.item
        items.push(curr.sprite)

        if (curr.end) {
          if (this.leakShock) {
            this.scene.hideShocker()
          }
          this.win(items)
          return
        } else {
          currDir = toTile.item.dirs.find(it => it !== inverse)
        }
      } else {
        if (toTile && this.leakShock) {
          this.scene.moveShocker(toTile.xPos, toTile.yPos)
          if (toTile.item && toTile.item.isPlayer) {
            // kill player
            this.scene.loseLevel('death')
          }
        }
        break
      }
    }

    this.sendShocks(items)
  }

  sendShocks (items, won = false) {
    items.map((item, i) => {
      if (won) {
        item.shockRepeat(i * SHOCK_DELAY)
      } else {
        item.shock(i * SHOCK_DELAY)
      }
    })
  }

  win (items) {
    this.won = true
    this.sendShocks(items, true)
    this.scene.winLevel()
  }

  lose () {
    this.scene.loseLevel('shock')
  }

  createItems (items) {
    this.allItems = []

    items.map(({ name, x, y }) => {
      const { xPos, yPos } = this.gridItems[x][y]

      const sprite = this.scene.createSprite({
        spriteType: 'name',
        x: xPos,
        y: yPos,
        facing: 'right',
        ...spriteData(name)
      })

      let item
      switch (name.split('-')[0]) {
        case 'player':
          item = {
            x,
            y,
            sprite,
            isPlayer: true,
            movable: true,
            canDie: true,
            gravity: false
          }
          this.player = item
          break
        case 'fish':
          item = {
            x,
            y,
            sprite,
            isChar: true,
            facing: name.split('-')[1],
            movable: true,
            canDie: true,
            gravity: false
          }
          break
        case 'pipe':
          if (name.split('-')[1] === 'node') {
            item = {
              x,
              y,
              sprite,
              movable: false,
              canDie: false,
              gravity: false
            }
            if (name.split('-')[2] === 'start') {
              item.dirs = ['right']
              this.startNode = item
            } else {
              item.dirs = ['left']
              item.end = true
              this.endNode = item
            }
          } else {
            item = {
              x,
              y,
              sprite,
              movable: true,
              canDie: false,
              gravity: false,
              dirs: [name.split('-')[1], name.split('-')[2]]
            }
          }
          break
        case 'lead':
          item = {
            x,
            y,
            sprite,
            movable: true,
            canDie: false,
            gravity: true,
            dirs: [name.split('-')[1], name.split('-')[2]]
          }
          break
        case 'rock':
        case 'supports':
          item = {
            x,
            y,
            sprite,
            movable: false,
            canDie: false,
            gravity: false
          }
          break
      }

      this.allItems.push(item)
      this.gridItems[x][y].item = item
    })
  }

  createGrid () {
    for (let x = 0; x < GAME_WIDTH; x++) {
      const yArr = []

      for (let y = 0; y < GAME_HEIGHT; y++) {
        const xPos = x * GRID_ITEM_SIZE + GRID_ITEM_OFFSET
        const yPos = y * GRID_ITEM_SIZE + GRID_ITEM_OFFSET + TOP_OFFSET

        yArr.push({ xPos, yPos, item: null })
      }

      this.gridItems.push(yArr)
    }
  }

  getItemAt (x, y) {
    if (x < 0 || x >= GAME_WIDTH || y < 0 || y >= GAME_HEIGHT) {
      return null
    }

    return this.gridItems[x][y]
  }
}

const getDirXAndY = (dir, x, y) => {
  switch (dir) {
    case 'up': return { x, y: y - 1 }
    case 'down': return { x, y: y + 1 }
    case 'left': return { x: x - 1, y }
    case 'right': return { x: x + 1, y }
    default:
      throw new Error('No dir in State.move()')
  }
}

const spriteData = (name) => {
  switch (name.split('-')[0]) {
    case 'pipe':
    case 'lead':
      return {
        canShock: true,
        anim: name
      }
    case 'supports':
      return {
        canShock: false,
        anim: `${name}-still`
      }
    case 'rock':
      return {
        canShock: false,
        anim: name
      }
    case 'player':
      return {
        canFlip: true,
        canShock: true,
        anim: `${name}-idle`
      }
    case 'fish':
      return {
        facing: name.split('-')[1],
        canFlip: true,
        canShock: true,
        anim: 'fish-idle'
      }
    default:
      return {
        canShock: true,
        anim: `${name}-idle`
      }
  }
}

const getInverse = (str) => {
  switch (str) {
    case 'up': return 'down'
    case 'down': return 'up'
    case 'left': return 'right'
    case 'right': return 'left'
  }
}
