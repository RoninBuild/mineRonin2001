

export function ShareGame({ seed }: { seed: string }) {
    const url = `${window.location.origin}/play?seed=${seed}`
    return <button onClick={() => navigator.clipboard.writeText(url)}>Copy challenge link</button>
}

