

contract Campaign {
    uint8 public currentLevel = 1;
    function nextLevel() external { currentLevel++; }
    function getLevelConfig() view returns (uint8 size, uint8 mines) {
        return (8 + currentLevel, 8 + currentLevel * 2);
    }
}



function getLevelConfig() view returns (uint8 size, uint8 mines) {
    uint8 lvl = currentLevel > 30 ? 30 : currentLevel;
    return (8 + lvl, 8 + lvl * 2);
}

