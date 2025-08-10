

import { useEffect, useState } from 'react'
export function Timer({ startTime }: { startTime: number }) {
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => { const i = setInterval(() => setElapsed(Date.now() - startTime), 1000); return () => clearInterval(i) }, [])
    return <span>{Math.floor(elapsed / 1000)}s</span>
}

