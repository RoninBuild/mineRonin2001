

export function Cell({ cell, onReveal, onFlag }: Props) {
    if (cell.state === 'Revealed') return <div>{cell.isMine ? '💣' : cell.adjacentMines || ''}</div>
    if (cell.state === 'Flagged') return <div onClick={onFlag}>🚩</div>
    return <div className="bg-gray-300 hover:bg-gray-400" onClick={onReveal} />
}



if (cell.state === 'Flagged') return <div onClick={onFlag}>🚩</div> // no reveal, only unflag



onContextMenu={(e) => { e.preventDefault(); onFlag(); }}



const longPressTimer = useRef<NodeJS.Timeout>()
onTouchStart={() => { longPressTimer.current = setTimeout(onFlag, 500) }}
onTouchEnd={() => clearTimeout(longPressTimer.current)}

