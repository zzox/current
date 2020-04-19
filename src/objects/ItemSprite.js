import { GameObjects } from 'phaser'

export default class ItemSprite extends GameObjects.Sprite {
  constructor ({ scene, x, y, type, anim, canShock, canFlip }) {
    super(scene, x, y)
    scene.add.existing(this)

    if (canShock) {
      this.shocker = this.scene.add.sprite(x, y)
      scene.add.existing(this.shocker)
      this.shocker.setVisible(false)
      this.shocker.on('animationcomplete', (animation) => {
        if (animation.key === 'shock-once') {
          this.shocker.setVisible(false)
        }
      })
    }

    this.canFlip = canFlip
    this.anims.play(anim)
  }

  moveTo (x, y, fromGravity = false) {
    const duration = fromGravity ? 666 : 133

    if (this.x !== x) {
      this.scene.tweens.add({
        targets: this,
        x: { from: this.x, to: x },
        ease: 'Power1',
        duration,
        repeat: 0
      })

      if (this.canFlip) {
        if (this.x > x) {
          this.flipX = true
        }

        if (this.x < x) {
          this.flipX = false
        }
      }
    }

    if (this.y !== y) {
      this.scene.tweens.add({
        targets: this,
        y: { from: this.y, to: y },
        ease: 'Power1',
        duration,
        repeat: 0
      })
    }
  }

  update () {
    if (this.shocker) {
      this.shocker.x = this.x
      this.shocker.y = this.y
    }
  }

  shock (delay) {
    this.shocker.setVisible(true)
    this.shocker.x = this.x
    this.shocker.y = this.y
    this.shocker.anims.delayedPlay(delay, 'shock-once')
  }

  shockRepeat (delay) {
    this.shocker.setVisible(true)
    this.shocker.x = this.x
    this.shocker.y = this.y
    this.shocker.anims.delayedPlay(delay, 'shock-repeat')
  }

  destroyShocker () {
    if (this.shocker) {
      this.shocker.destroy()
    }
  }
}
