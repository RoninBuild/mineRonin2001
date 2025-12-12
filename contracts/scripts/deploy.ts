

import { ethers } from 'hardhat'
async function main() {
    const Minesweeper = await ethers.getContractFactory('Minesweeper')
    const contract = await Minesweeper.deploy()
    console.log('Deployed to:', contract.address)
}

