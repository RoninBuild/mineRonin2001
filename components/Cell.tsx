

export function Cell({ cell, onReveal, onFlag }: Props) {
    if (cell.state === 'Revealed') return <div>{cell.isMine ? '💣' : cell.adjacentMines || ''}</div>
    if (cell.state === 'Flagged') return <div onClick={onFlag}>🚩</div>
    return <div className="bg-gray-300 hover:bg-gray-400" onClick={onReveal} />
}

