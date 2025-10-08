

export function saveGame(contractAddr: string, gameId: number) {
    localStorage.setItem('lastGame', JSON.stringify({ contractAddr, gameId }))
}
export function loadGame() { return JSON.parse(localStorage.getItem('lastGame') || 'null') }

