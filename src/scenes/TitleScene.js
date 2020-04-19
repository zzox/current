import { Scene, Input } from 'phaser'
import store from 'store'

export default class TitleScene extends Scene {
  constructor () {
    super({ key: 'TitleScene' })
  }

  create () {
    const { ENTER, SPACE, UP, DOWN } = Input.Keyboard.KeyCodes
    this.cameras.main.setBackgroundColor('#262b44')

    this.add.image(120, 48, 'logo').setScale(2)

    this.add.bitmapText(116, 92, 'font', 'New Game', 8)
    this.menuPos = 1

    const continuedGame = store.get('current-the-game')
    if (continuedGame) {
      this.continuedLevel = continuedGame
      this.add.bitmapText(116, 106, 'font', 'Continue', 8)
      this.menuPositions = 2
    } else {
      this.menuPositions = 1
    }

    // ADD SELECTOR

    this.prevState = {
      enter: true,
      space: true,
      upKey: true,
      downKey: true
    }

    this.enter = this.input.keyboard.addKey(ENTER)
    this.space = this.input.keyboard.addKey(SPACE)
    this.upKey = this.input.keyboard.addKey(UP)
    this.downKey = this.input.keyboard.addKey(DOWN)

    this.cameras.main.fadeIn(1000)

    // PLAY SONG

    // this.title = this.add.sprite(160, 64)
    // this.title.play('title-flash')
    // this.title.setScale(2)
  }

  update () {
    if ((this.enter.isDown && !this.prevState.enter) || (this.space.isDown && !this.prevState.space)) {
      this.pauseMusic()
      if (this.menuPos === 1) {
        this.newGame()
      }

      if (this.menuPos === 2) {
        this.loadGame()
      }

      return
    }

    if (this.downKey.isDown && this.downKey.isDown !== this.prevState.downKey) {
      if (this.menuPos === this.menuPositions) {
        this.menuPos = this.menuPositions
      } else {
        // this.sound.playAudioSprite('soundtrack', 'selector', { volume: 0.5 })
        this.menuPos++
      }
    } else if (this.upKey.isDown && this.upKey.isDown !== this.prevState.upKey) {
      if (this.menuPos === 1) {
        this.menuPos = 1
      } else {
        // this.sound.playAudioSprite('soundtrack', 'selector', { volume: 0.5 })
        this.menuPos--
      }
    }

    // move selector to correct position
    // this.spr.y = this.menuPos * 20 + 120

    this.prevState = {
      enter: this.enter.isDown,
      space: this.space.isDown,
      upKey: this.upKey.isDown,
      downKey: this.downKey.isDown
    }

    // this.bgGfx.update()
  }

  newGame () {
    this.scene.start('GameScene', { level: 0 })
  }

  loadGame () {
    this.scene.start('GameScene', { level: continuedLevel })
  }

  pauseMusic () {
    // fade out
    const sounds = this.sound.sounds
    for (let i = 0; i < sounds.length; i++) {
      if (sounds[i].key === 'songs') {
        this.sound.sounds[i].pause()
      }
    }
  }
}
