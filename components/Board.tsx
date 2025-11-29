

export function Board({ cells, onReveal, onFlag }: Props) {
    return <div className="grid grid-cols-8 gap-1 w-96 h-96">
        {cells.map((row, y) => row.map((cell, x) => (
            <Cell key={`${x}-${y}`} cell={cell} onReveal={() => onReveal(x, y)} onFlag={() => onFlag(x, y)} />
        )))}
    </div>
}



export const Board = React.memo(function Board({ cells, onReveal, onFlag }: Props) {

