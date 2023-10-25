import sound from 'sound-play'

export const playSound = async (filename: string) => {
    await sound.play(filename)
}