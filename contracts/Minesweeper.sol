

// SPDX-License-Identifier: MIT
contract Minesweeper {
    uint8 constant SIZE = 8;
    uint8 constant MINES = 10;
    mapping(uint8 => mapping(uint8 => Cell)) public board;
    enum CellState { Hidden, Revealed, Flagged }
    struct Cell { bool isMine; CellState state; uint8 adjacentMines; }
}



function _generateBoard(bytes32 seed) internal {
    uint8 placed = 0;
    while (placed < MINES) {
        uint256 rand = uint256(keccak256(abi.encodePacked(seed, placed)));
        (uint8 x, uint8 y) = (uint8(rand % SIZE), uint8((rand >> 8) % SIZE));
        if (!board[x][y].isMine) { board[x][y].isMine = true; placed++; }
    }
}



function reveal(uint8 x, uint8 y) external {
    require(board[x][y].state == CellState.Hidden, "Already revealed");
    board[x][y].state = CellState.Revealed;
    if (board[x][y].isMine) { /* game over */ }
    else if (board[x][y].adjacentMines == 0) { /* flood fill */ }
}

