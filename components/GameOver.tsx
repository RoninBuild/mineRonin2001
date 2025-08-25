

export function GameOver({ won, time, onRestart }: Props) {
    return <div className="text-center">
        <h2>{won ? '🎉 You Win!' : '💥 Game Over'}</h2>
        <p>Time: {time}s</p>
        <button onClick={onRestart}>Play Again</button>
    </div>
}

