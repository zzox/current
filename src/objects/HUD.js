export default class HUD {
  constructor (scene) {
    this.scene = scene
    this.levelName = this.scene.add.bitmapText(2, 9, 'font', '', 8)
      .setTint(0x262b44)
    this.moves = this.scene.add.bitmapText(220, 9, 'font', '', 16)
      .setTint(0x262b44)
  }

  updateName (text) {
    this.levelName.text = text
  }

  updateMoves (moves) {
    if (moves <= 3) {
      this.moves.setTint(0x9e2835)
    } else {
      this.moves.setTint(0x262b44)
    }
    this.moves.text = moves
  }
}
