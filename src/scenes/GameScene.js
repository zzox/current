import { Scene, Input } from 'phaser'
import State from '../GameState'
import ItemSprite from '../objects/ItemSprite'

const FINAL_LEVEL = 14

export default class GameScene extends Scene {
  constructor () {
    super({ key: 'GameScene' })
  }

  init ({ level }) {
    // TODO: move to only work with the elements and not the whole window.
    // these need to be destroyed
    window.addEventListener('blur', () => this.pauseScene)
    window.addEventListener('focus', () => this.resumeScene)

    this.levelNum = level
  }

  create () {
    this.cameras.main.setBackgroundColor('#0095e9')
    this.add.image(480, 67, 'background').setAlpha(0.6)
    this.addWaves()

    this.newLevel(this.levelNum, true)

    this.addKeys()

    // add title up top, before adding to the screen

    // pools for environment objects
    //

    this.canMove = true
  }

  update (time, delta) {
    const dir = this.dirFromInput()
    if (this.canMove && dir) {
      console.log(dir)
      this.state.movePlayer(dir)
    }

    this.updatePrevState()

    this.items.map(item => item.update(delta))
  }

  dirFromInput () {
    if (this.keys.right.isDown && !this.prevState.right) {
      return 'right'
    }

    if (this.keys.left.isDown && !this.prevState.left) {
      return 'left'
    }

    if (this.keys.up.isDown && !this.prevState.up) {
      return 'up'
    }

    if (this.keys.down.isDown && !this.prevState.down) {
      return 'down'
    }

    return null
  }

  updatePrevState () {
    this.prevState = {
      up: this.keys.up.isDown,
      down: this.keys.down.isDown,
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      restart: this.keys.restart.isDown
    }
  }

  createSprite (rest) {
    const spr = new ItemSprite({ scene: this, ...rest })

    this.items.push(spr)

    return spr
  }

  addKeys () {
    const { UP, DOWN, LEFT, RIGHT, R } = Input.Keyboard.KeyCodes

    this.keys = {
      up: this.input.keyboard.addKey(UP),
      down: this.input.keyboard.addKey(DOWN),
      left: this.input.keyboard.addKey(LEFT),
      right: this.input.keyboard.addKey(RIGHT),
      restart: this.input.keyboard.addKey(R)
    }

    this.prevState = {
      up: null,
      down: null,
      left: null,
      right: null,
      restart: null
    }
  }

  resumeScene () {
    this.scene.resume()
  }

  pauseScene () {
    this.scene.pause()
  }

  winLevel () {
    this.newLevel(this.levelNum + 1)
  }

  loseLevel () {
    this.newLevel(this.levelNum)
  }

  newLevel (levelNum, newScene = false) {
    this.levelNum = levelNum
    this.canMove = false

    if (!newScene) {
      // tween stuff closed
      this.destroyItems()
    }

      this.levelData = { ...window.gameLevels[levelNum] }
      this.items = []
      this.state = new State(this.levelData, this)

      console.log('levelData', this.levelData)

      this.canMove = true
  }

  destroyItems () {
    this.items.map(item => {
      item.destroyShocker()
      item.destroy()
    })
  }

  addWaves () {
    for (let i = 0; i < 16; i++) {
      const spr = this.add.sprite(i * 16 + 8, 4)
      spr.play('wave')
    }
  }
}
