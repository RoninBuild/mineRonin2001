// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SkinsNFT.sol";

/**
 * @title MineRoninShop
 * @dev Accepts USDC payments and mints NFT skins
 */
contract MineRoninShop is Ownable {
    IERC20 public immutable usdc;
    SkinsNFT public immutable skinsNFT;
    address public treasury;
    
    // Skin catalog: tier => (category => names[])
    mapping(uint8 => mapping(string => string[])) public catalog;
    
    event SkinPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        string category,
        uint8 tier,
        uint256 usdcAmount
    );
    
    constructor(
        address _usdc,
        address _skinsNFT,
        address _treasury
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        skinsNFT = SkinsNFT(_skinsNFT);
        treasury = _treasury;
        
        // Initialize catalog
        _initializeCatalog();
    }
    
    function _initializeCatalog() private {
        // Tier 1 skins
        catalog[1]["field"] = ["Classic Dark", "Minimal Grid"];
        catalog[1]["flag"] = ["Base Flag", "Simple Mark"];
        
        // Tier 5 skins
        catalog[5]["field"] = ["Neon Grid", "Carbon Fiber"];
        catalog[5]["flag"] = ["Ronin Mark", "Elite Flag"];
        
        // Tier 10 skins
        catalog[10]["field"] = ["Cyber Matrix", "Holographic"];
        catalog[10]["flag"] = ["Elite Emblem", "Legendary Mark"];
    }
    
    function updateTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    function addSkinToCatalog(
        uint8 tier,
        string memory category,
        string memory name
    ) external onlyOwner {
        catalog[tier][category].push(name);
    }
    
    function purchaseSkin(
        string memory category,
        uint8 tier,
        uint256 skinIndex
    ) external returns (uint256) {
        require(
            tier == 1 || tier == 5 || tier == 10,
            "Invalid tier"
        );
        
        string[] memory skins = catalog[tier][category];
        require(skinIndex < skins.length, "Invalid skin index");
        
        uint256 usdcAmount = uint256(tier) * 1e6; // USDC has 6 decimals
        
        // Transfer USDC from buyer to treasury
        require(
            usdc.transferFrom(msg.sender, treasury, usdcAmount),
            "USDC transfer failed"
        );
        
        // Mint NFT to buyer
        uint256 tokenId = skinsNFT.mint(
            msg.sender,
            category,
            tier,
            skins[skinIndex]
        );
        
        emit SkinPurchased(msg.sender, tokenId, category, tier, usdcAmount);
        
        return tokenId;
    }
    
    function getCatalogSkins(uint8 tier, string memory category)
        external
        view
        returns (string[] memory)
    {
        return catalog[tier][category];
    }
}
