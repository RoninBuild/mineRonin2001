

const MODES = { easy: { size: 8, mines: 8 }, medium: { size: 12, mines: 20 }, hard: { size: 16, mines: 40 } }
export function DifficultySelector({ onSelect }: { onSelect: (m: string) => void }) {
    return <select>{Object.keys(MODES).map(m => <option key={m}>{m}</option>)}</select>
}

