

export async function getContractOrDeploy() {
    const saved = loadGame()
    if (saved) return saved.contractAddr
    return await deployNewGame()
}



// Only reveal cells that have been actually revealed — don't trust client
export function getVisibleBoard(board: Cell[][]) {
    return board.map(row => row.map(c => c.state === 'Revealed' ? c : HIDDEN_CELL))
}

