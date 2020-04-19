import { Scene, Input } from 'phaser'
import State from '../GameState'
import ItemSprite from '../objects/ItemSprite'
import HUD from '../objects/HUD'

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

    this.hud = new HUD(this)
    this.newLevel(this.levelNum, true)

    this.addKeys()

    // add title up top, before adding to the screen

    // pools for environment objects
    //

    this.canMove = true

    this.cameras.main.fadeIn(1000)



    // this.yellow = this.add.graphics()
    //   .fillStyle(0x1A1A1A)
    //   .fillRect(0, 0, 240, 135)

    // this.red = this.add.graphics()
    //   .fillStyle(0x1A1A1A)
    //   .fillRect(0, 0, 240, 135)
    this.shockTransition = this.add.sprite(120, 67).setVisible(false).setScale(0.1).setDepth(1)
    this.shockTransition.anims.play('bolt-show')

    this.teethTransition = this.add.sprite(120, 67).setVisible(false).setScale(0.1).setDepth(1)
    this.teethTransition.anims.play('teeth-show')

    this.diverTransition = this.add.sprite(120, 67).setVisible(false).setScale(0.1).setDepth(1)
    this.diverTransition.anims.play('diver-show')
  }

  update (time, delta) {
    const dir = this.dirFromInput()
    if (this.canMove && dir) {
      console.log(dir)
      this.state.movePlayer(dir)
    }

    if (this.keys.restart.isDown && !this.prevState.restart && this.canMove) {
      this.loseLevel('restart')
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

  hideShocker () {
    this.shocker.setVisible(false)
  }

  moveShocker (x, y) {
    this.shocker.x = x
    this.shocker.y = y
    this.shocker.setVisible(true)
    this.shocker.anims.play('shock-twice')
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
    this.newLevel(this.levelNum + 1, false, 'win')
  }

  loseLevel (type) {
    this.newLevel(this.levelNum, false, type)
  }

  newLevel (levelNum, newScene = false, type = 'restart') {
    this.levelNum = levelNum
    this.canMove = false

    if (newScene) {
      this.makeLevelItems(levelNum)
    } else {
      // tween stuff closed

      let itemType, delay
      switch (type) {
        case 'death':
          delay = 250
          itemType = this.shockTransition
          break
        case 'shock':
          delay = 1000
          itemType = this.shockTransition
          break
        case 'eaten':
          delay = 500
          itemType = this.teethTransition
          break
        case 'win':
          delay = 1000
          itemType = this.diverTransition
          break
        case 'restart':
          delay = 0
          itemType = this.diverTransition
          break
      }

      itemType.setVisible(true)

      this.add.tween({
        delay,
        targets: itemType,
        scaleX: { from: 0.1, to: 100 },
        scaleY: { from: 0.1, to: 100 },
        duration: 500,
        onComplete: () => {
          this.destroyItems()
          this.makeLevelItems(levelNum, itemType)
        }
      })
    }
  }

  makeLevelItems (levelNum, itemType) {
    this.levelData = { ...window.gameLevels[levelNum] }
    if (this.levelData.leakShock) {
      this.shocker = this.add.sprite()
      this.shocker.setVisible(false)
      this.shocker.on('animationcomplete', (animation) => {
        if (animation.key === 'shock-twice') {
          this.shocker.setVisible(false)
        }
      })
    }

    this.hud.updateName(`${this.levelData.index} - ${this.levelData.name}`)
    this.hud.updateMoves(this.levelData.tries)

    this.items = []
    this.state = new State(this.levelData, this)

    console.log('levelData', this.levelData)

    if (itemType) {
      this.add.tween({
        targets: itemType,
        scaleX: { from: 100, to: 0.1 },
        scaleY: { from: 100, to: 0.1 },
        duration: 500,
        onComplete: () => {
          itemType.setVisible(false)
          this.canMove = true
        }
      })
    } else {
      this.canMove = true
    }
  }

  destroyItems () {
    if (this.shocker) {
      this.shocker.destroy()
    }

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
