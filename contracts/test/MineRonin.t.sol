// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SkinsNFT.sol";
import "../src/MineRoninShop.sol";
import "../src/WeeklyChallengePool.sol";

contract MineRoninTest is Test {
    SkinsNFT private skinsNFT;
    MineRoninShop private shop;
    WeeklyChallengePool private pool;

    address private usdc;
    address private treasury;

    function setUp() public {
        usdc = address(0x1234);
        treasury = address(0xBEEF);

        skinsNFT = new SkinsNFT();
        shop = new MineRoninShop(usdc, address(skinsNFT), treasury);
        pool = new WeeklyChallengePool(usdc);

        skinsNFT.setMinter(address(shop), true);
    }

    function testInitialSetup() public {
        assertTrue(address(skinsNFT) != address(0));
        assertTrue(address(shop) != address(0));
        assertTrue(address(pool) != address(0));
        assertEq(shop.treasury(), treasury);
    }
}
