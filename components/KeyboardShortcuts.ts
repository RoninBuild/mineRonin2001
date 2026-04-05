

useEffect(() => {
    const handler = (e: KeyboardEvent) => {
        if (e.key === 'r') onReveal()
        if (e.key === 'f') onFlag()
        if (e.key === 'n') onNewGame()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
}, [])

