// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WeeklyChallengePool
 * @dev Manages weekly paid challenge entries and payouts
 */
contract WeeklyChallengePool is Ownable {
    IERC20 public immutable usdc;
    uint256 public constant ENTRY_FEE = 1e6; // 1 USDC (6 decimals)
    
    struct WeeklyPool {
        uint256 totalEntries;
        uint256 prizePool;
        bool distributed;
        mapping(address => bool) hasEntered;
        address[] participants;
    }
    
    // week number => pool data
    mapping(uint256 => WeeklyPool) public pools;
    
    event EntryPaid(address indexed player, uint256 indexed week, uint256 amount);
    event PrizeDistributed(uint256 indexed week, address[] winners, uint256[] amounts);
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    function getCurrentWeek() public view returns (uint256) {
        // Week starts Monday 00:00 UTC
        // Week number since epoch
        return (block.timestamp / 1 weeks);
    }
    
    function enterChallenge() external returns (bool) {
        uint256 week = getCurrentWeek();
        WeeklyPool storage pool = pools[week];
        
        require(!pool.hasEntered[msg.sender], "Already entered this week");
        
        // Transfer entry fee from player
        require(
            usdc.transferFrom(msg.sender, address(this), ENTRY_FEE),
            "USDC transfer failed"
        );
        
        pool.hasEntered[msg.sender] = true;
        pool.participants.push(msg.sender);
        pool.totalEntries++;
        pool.prizePool += ENTRY_FEE;
        
        emit EntryPaid(msg.sender, week, ENTRY_FEE);
        
        return true;
    }
    
    function hasEntered(address player, uint256 week) external view returns (bool) {
        return pools[week].hasEntered[player];
    }
    
    function getPoolInfo(uint256 week)
        external
        view
        returns (
            uint256 totalEntries,
            uint256 prizePool,
            bool distributed
        )
    {
        WeeklyPool storage pool = pools[week];
        return (pool.totalEntries, pool.prizePool, pool.distributed);
    }
    
    function getParticipants(uint256 week) external view returns (address[] memory) {
        return pools[week].participants;
    }
    
    /**
     * @dev Distribute prizes to winners (admin only)
     * @param week The week to distribute
     * @param winners Array of winner addresses
     * @param amounts Array of prize amounts (must sum to pool total)
     */
    function distributePrizes(
        uint256 week,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyOwner {
        WeeklyPool storage pool = pools[week];
        require(!pool.distributed, "Already distributed");
        require(winners.length == amounts.length, "Length mismatch");
        
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalDistributed += amounts[i];
        }
        require(totalDistributed <= pool.prizePool, "Exceeds prize pool");
        
        // Transfer prizes
        for (uint256 i = 0; i < winners.length; i++) {
            require(usdc.transfer(winners[i], amounts[i]), "Transfer failed");
        }
        
        pool.distributed = true;
        
        emit PrizeDistributed(week, winners, amounts);
    }
}
