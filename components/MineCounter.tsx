

export function MineCounter({ total, flagged }: { total: number; flagged: number }) {
    return <span>💣 {total - flagged}</span>
}

