

export function DailyChallenge() {
    const seed = keccak256(toHex(new Date().toISOString().slice(0, 10)))
    return <Board seed={seed} />
}

