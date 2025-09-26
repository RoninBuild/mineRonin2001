

const sounds = {
    reveal: new Audio('/sounds/reveal.mp3'),
    flag: new Audio('/sounds/flag.mp3'),
    boom: new Audio('/sounds/boom.mp3'),
}
export function playSound(name: keyof typeof sounds) { sounds[name].play() }

