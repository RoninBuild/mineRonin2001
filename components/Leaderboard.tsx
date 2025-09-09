

import { useReadContract } from 'wagmi'
export function Leaderboard() {
    const { data } = useReadContract({ abi, functionName: 'getLeaderboard' })
    return <ol>{data?.map((s, i) => <li key={i}>{s.player}: {s.time}s</li>)}</ol>
}

