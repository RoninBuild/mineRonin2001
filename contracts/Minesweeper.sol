

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



function _floodFill(uint8 x, uint8 y) internal {
    for (int8 dx = -1; dx <= 1; dx++)
        for (int8 dy = -1; dy <= 1; dy++)
            if (_inBounds(x+dx, y+dy) && board[uint8(x+dx)][uint8(y+dy)].state == CellState.Hidden)
                reveal(uint8(x+dx), uint8(y+dy));
}



function toggleFlag(uint8 x, uint8 y) external {
    require(board[x][y].state != CellState.Revealed, "Already revealed");
    board[x][y].state = board[x][y].state == CellState.Flagged ? CellState.Hidden : CellState.Flagged;
}



function checkWin() public view returns (bool) {
    for (uint8 x = 0; x < SIZE; x++)
        for (uint8 y = 0; y < SIZE; y++)
            if (!board[x][y].isMine && board[x][y].state != CellState.Revealed) return false;
    return true;
}



mapping(address => bool) public players;
function joinGame() external { require(players[msg.sender] == false); players[msg.sender] = true; }



uint256 public totalGames;
uint256 public totalWins;
mapping(address => uint256) public wins;
function _recordWin(address player) internal { totalWins++; wins[player]++; }

