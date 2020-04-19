import { Scene } from 'phaser'

export default class EndScene extends Scene {
  constructor () {
    super({ key: 'EndScene' })
  }

  create () {
    this.add.image(120, 48, 'logo').setScale(2)
    this.add.bitmapText(96, 80, 'font', 'Congulations!', 8)
    this.add.bitmapText(16, 106, 'font', 'DM on twitter @zzo__x for modding and more info', 8)

    this.cameras.main.setBackgroundColor('#151515')

    this.music = this.sound.playAudioSprite('soundtrack', 'end', { loop: true })
  }
}
