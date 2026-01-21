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

    mapping(address => mapping(uint256 => bool)) public ownedFieldSkins;
    mapping(address => mapping(uint256 => bool)) public ownedFlags;

    mapping(uint256 => uint256) public fieldPrices;
    mapping(uint256 => uint256) public flagPrices;

    event Purchased(
        address indexed user,
        uint8 indexed itemType,
        uint256 indexed id,
        uint256 price
    );

    constructor(
        address _usdc,
        address _skinsNFT,
        address _treasury
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        skinsNFT = SkinsNFT(_skinsNFT);
        treasury = _treasury;

        _initializePrices();
    }

    function _initializePrices() private {
        fieldPrices[1] = 0;
        fieldPrices[2] = 5e6;
        fieldPrices[3] = 10e6;

        flagPrices[1] = 0;
        flagPrices[2] = 5e6;
        flagPrices[3] = 10e6;
    }

    function updateTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setFieldPrice(uint256 id, uint256 price) external onlyOwner {
        fieldPrices[id] = price;
    }

    function setFlagPrice(uint256 id, uint256 price) external onlyOwner {
        flagPrices[id] = price;
    }

    function buyFieldSkin(uint256 id) external {
        require(!ownedFieldSkins[msg.sender][id], "Already owned");
        uint256 price = fieldPrices[id];
        _chargeUSDC(price);
        ownedFieldSkins[msg.sender][id] = true;
        emit Purchased(msg.sender, 0, id, price);
    }

    function buyFlag(uint256 id) external {
        require(!ownedFlags[msg.sender][id], "Already owned");
        uint256 price = flagPrices[id];
        _chargeUSDC(price);
        ownedFlags[msg.sender][id] = true;
        emit Purchased(msg.sender, 1, id, price);
    }

    function _chargeUSDC(uint256 price) private {
        if (price == 0) {
            return;
        }

        require(
            usdc.transferFrom(msg.sender, treasury, price),
            "USDC transfer failed"
        );
    }
}
