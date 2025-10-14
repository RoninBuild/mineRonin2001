

export async function getContractOrDeploy() {
    const saved = loadGame()
    if (saved) return saved.contractAddr
    return await deployNewGame()
}

