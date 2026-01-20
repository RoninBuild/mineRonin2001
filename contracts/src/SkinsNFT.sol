// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkinsNFT
 * @dev ERC721 for Mine Ronin skins (fields + flags)
 */
contract SkinsNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Mapping from tokenId to skin metadata
    mapping(uint256 => SkinMetadata) public skins;
    
    // Authorized minters (shop contract)
    mapping(address => bool) public minters;
    
    struct SkinMetadata {
        string category; // "field" or "flag"
        uint8 tier; // 1, 5, or 10 (USDC price tier)
        string name;
    }
    
    event SkinMinted(
        address indexed to,
        uint256 indexed tokenId,
        string category,
        uint8 tier,
        string name
    );
    
    constructor() ERC721("MineRoninSkins", "MRSKIN") Ownable(msg.sender) {}
    
    function setMinter(address minter, bool authorized) external onlyOwner {
        minters[minter] = authorized;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized minter");
        _;
    }
    
    function mint(
        address to,
        string memory category,
        uint8 tier,
        string memory name
    ) external onlyMinter returns (uint256) {
        require(
            tier == 1 || tier == 5 || tier == 10,
            "Invalid tier"
        );
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        skins[tokenId] = SkinMetadata({
            category: category,
            tier: tier,
            name: name
        });
        
        emit SkinMinted(to, tokenId, category, tier, name);
        
        return tokenId;
    }
    
    function getSkin(uint256 tokenId) external view returns (SkinMetadata memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return skins[tokenId];
    }
    
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i < _nextTokenId && index < balance; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index++] = i;
            }
        }
        
        return tokens;
    }
}
