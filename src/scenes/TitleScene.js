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

    this.spr = this.add.sprite(106, 100)
    this.spr.play('bolt-show')

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

    this.music = this.sound.playAudioSprite('soundtrack', 'theme', { loop: true })
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
        this.sound.playAudioSprite('sfx', 'select', { volume: 0.7 })
        this.menuPos++
      }
    } else if (this.upKey.isDown && this.upKey.isDown !== this.prevState.upKey) {
      if (this.menuPos === 1) {
        this.menuPos = 1
      } else {
        this.sound.playAudioSprite('sfx', 'select', { volume: 0.7 })
        this.menuPos--
      }
    }

    this.spr.y = this.menuPos * 16 + 80

    this.prevState = {
      enter: this.enter.isDown,
      space: this.space.isDown,
      upKey: this.upKey.isDown,
      downKey: this.downKey.isDown
    }
  }

  newGame () {
    this.scene.start('GameScene', { level: 0 })
  }

  loadGame () {
    console.log(this.continuedLevel)
    this.scene.start('GameScene', { level: this.continuedLevel })
  }

  pauseMusic () {
    // fade out
    const sounds = this.sound.sounds
    for (let i = 0; i < sounds.length; i++) {
      if (sounds[i].key === 'soundtrack') {
        this.sound.sounds[i].pause()
      }
    }
  }
}
