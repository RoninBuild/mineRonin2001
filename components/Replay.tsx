

export function Replay({ moves }: { moves: Move[] }) {
    const [step, setStep] = useState(0)
    return <div><Board state={moves[step]} /><button onClick={() => setStep(s => s + 1)}>Next</button></div>
}

