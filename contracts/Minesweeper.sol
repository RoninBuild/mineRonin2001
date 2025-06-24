

// SPDX-License-Identifier: MIT
contract Minesweeper {
    uint8 constant SIZE = 8;
    uint8 constant MINES = 10;
    mapping(uint8 => mapping(uint8 => Cell)) public board;
    enum CellState { Hidden, Revealed, Flagged }
    struct Cell { bool isMine; CellState state; uint8 adjacentMines; }
}

