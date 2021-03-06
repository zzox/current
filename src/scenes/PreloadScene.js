import { Scene } from 'phaser'

export default class PreloadScene extends Scene {
  constructor () {
    super({ key: 'PreloadScene' })
  }

  preload () {
    this.resize()

    this.cameras.main.setBackgroundColor('#151515')
    this.add.image(120, 65, 'zzoxLogo')

    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x7b7b7b).fillRect(95, 75, 50, 1)
    this.progressBar = this.add.graphics()

    this.load.on('progress', (val) => {
      this.progressBar.clear().fillStyle(0xffffff).fillRect(95, 75, 50 * val, 1)
    })

    this.load.bitmapFont('font', 'assets/fonts/miniset.png', 'assets/fonts/miniset.fnt')
    this.load.json('animations', 'assets/data/animations.json')
    this.load.text('levels', 'assets/data/levels.txt')
    this.load.spritesheet('sprites', 'assets/images/sprites.png', { frameWidth: 16, frameHeight: 16, spacing: 2, margin: 1 })
    this.load.spritesheet('wave', 'assets/images/wave.png', { frameWidth: 16, frameHeight: 8, spacing: 2, margin: 1 })
    this.load.spritesheet('rock', 'assets/images/rock.png', { frameWidth: 24, frameHeight: 24 })
    this.load.image('logo', 'assets/images/logo.png')
    this.load.image('background', 'assets/images/background1.png')

    this.load.audioSprite('sfx',
      'assets/sound/sfx.json',
      [
        'assets/sound/sfx.mp3',
        'assets/sound/sfx.ac3',
        'assets/sound/sfx.m4a',
        'assets/sound/sfx.ogg'
      ],
      { instances: 4 }
    )

    this.load.audioSprite('soundtrack',
      'assets/sound/soundtrack.json',
      [
        'assets/sound/soundtrack.mp3',
        'assets/sound/soundtrack.ac3',
        'assets/sound/soundtrack.m4a',
        'assets/sound/soundtrack.ogg'
      ],
      { instances: 4 }
    )
  }

  create () {
    const animations = this.cache.json.get('animations')
    this.createAnimations(animations)

    const levels = this.cache.text.get('levels')
    this.parseLevels(levels)

    window.addEventListener('resize', () => {
      this.resize()
    })

    setTimeout(() => {
      // ATTN: if deploying on itch.io, skip the ClickStart scene, already taken care of.
      this.progressBar.destroy()
      this.progressBox.destroy()
      this.scene.start('ClickStart')
    }, 666)
  }

  parseLevels (levelsText) {
    const levels = []
    let level = { items: [] }
    let yIndex = 0

    const levelsLines = levelsText.split('\n')
    for (let i = 0; i < levelsLines.length; i++) {
      let line = levelsLines[i]
      line = line.trim()

      if (line === '\n') {
        continue
      }

      if (line === '===') {
        levels.push(level)
        level = { items: [] }
        continue
      }

      if (line === '~*~') {
        yIndex = 0
        continue
      }

      if (line === 'END') {
        break
      }

      if (level.name) {
        const items = line.split('')
        for (let j = 0; j < items.length; j++) {
          const item = items[j]

          if (item !== '.') {
            level.items.push({ name: this.itemDict(item), x: j, y: yIndex })
          }
        }
      } else {
        const data = line.split(';')
        level.index = parseInt(data[0])
        level.name = data[1]
        level.tries = parseInt(data[2])
        level.leakShock = data[3] === 'shock'
      }

      yIndex++
    }

    window.gameLevels = levels
  }

  itemDict (str) {
    switch (str) {
      case 'P': return 'player'
      case 'f': return 'fish-left'
      case 'F': return 'fish-right'
      case 'O': return 'pipe-node-start'
      case 'o': return 'pipe-node-end'
      case '-': return 'pipe-left-right'
      case '|': return 'pipe-up-down'
      case 'q': return 'pipe-down-right'
      case 'e': return 'pipe-left-down'
      case 'z': return 'pipe-up-right'
      case 'c': return 'pipe-left-up'
      case '+': return 'lead-left-right'
      case '/': return 'lead-up-down'
      case 'r': return 'lead-down-right'
      case 'y': return 'lead-left-down'
      case 'v': return 'lead-up-right'
      case 'n': return 'lead-left-up'
      case 'x': return 'supports'
      case 'X': return 'rock'
    }
  }

  createAnimations (animations) {
    for (const item in animations) {
      const it = animations[item]

      it.anims.map(anim => {
        this.anims.create({
          key: `${item}-${anim.key}`,
          frames: this.anims.generateFrameNumbers('sprites', anim.frames),
          frameRate: anim.frameRate ? anim.frameRate : 1,
          repeat: anim.repeat || anim.repeat === 0 ? anim.repeat : -1,
          repeatDelay: anim.repeatDelay ? anim.repeatDelay : 0
        })
      })
    }

    // extras
    this.anims.create({
      key: 'wave',
      frames: this.anims.generateFrameNumbers('wave', { start: 0, end: 3 }),
      frameRate: 9,
      repeat: -1
    })

    this.anims.create({
      key: 'rock',
      frames: this.anims.generateFrameNumbers('rock', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1
    })
  }

  resize () {
    document.body.style.overflow = 'hidden'

    const maxMulti = 20
    // overflow pixels
    const padding = 1
    const w = 240
    const h = 135
    const availW = window.innerWidth
    const availH = window.innerHeight
    // - 20 for padding
    const maxW = Math.floor(availW / (w - padding))
    const maxH = Math.floor(availH / (h - padding))
    let multi = maxW < maxH ? maxW : maxH

    if (multi > maxMulti) multi = maxMulti

    const canvas = document.getElementsByTagName('canvas')[0]
    canvas.style.width = `${multi * w}px`
    canvas.style.height = `${multi * h}px`
  }
}
