// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SkinsNFT.sol";
import "../src/MineRoninShop.sol";
import "../src/WeeklyChallengePool.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS"); // Base mainnet USDC
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy SkinsNFT
        SkinsNFT skinsNFT = new SkinsNFT();
        console.log("SkinsNFT deployed at:", address(skinsNFT));
        
        // 2. Deploy Shop
        MineRoninShop shop = new MineRoninShop(
            usdc,
            address(skinsNFT),
            treasury
        );
        console.log("MineRoninShop deployed at:", address(shop));
        
        // 3. Authorize shop as minter
        skinsNFT.setMinter(address(shop), true);
        console.log("Shop authorized as minter");
        
        // 4. Deploy WeeklyChallengePool
        WeeklyChallengePool pool = new WeeklyChallengePool(usdc);
        console.log("WeeklyChallengePool deployed at:", address(pool));
        
        vm.stopBroadcast();
    }
}
