// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArctounonNFT
 * @notice 2,222 pandas on Arc Chain.
 *
 *   - Public — anyone mints for {publicPrice} each while {publicMintOpen}.
 *   - Owner — {ownerMint} mints straight to any address for free (team,
 *     treasury, and allowlist distributions handled off-chain).
 *
 * There is no on-chain allowlist and no free public claim: the website only
 * collects wallets off-chain. The owner decides who receives a mint and issues
 * it with {ownerMint}. A single hard cap, {MAX_PER_WALLET} (5), applies to the
 * public phase; owner mints are exempt but still bounded by total supply.
 */
contract ArctounonNFT is ERC721A, Ownable, ReentrancyGuard {
    // ---- Immutable collection limits ----------------------------------------
    uint256 public constant MAX_SUPPLY = 2222;
    uint256 public constant MAX_PER_WALLET = 5;

    // ---- Phase switch (owner controlled) ------------------------------------
    bool public publicMintOpen;

    // ---- Economics / config -------------------------------------------------
    /// @notice Price per token for the public phase, in wei of the native
    /// currency (USDC, 18 decimals on Arc).
    uint256 public publicPrice;

    string private _baseTokenURI;

    // ---- Per-wallet tracking ------------------------------------------------
    /// @notice Public mints per wallet (enforces the per-wallet cap).
    mapping(address => uint256) public minted;

    event PublicMinted(address indexed wallet, uint256 quantity);

    error PublicClosed();
    error ZeroQuantity();
    error ExceedsWalletCap();
    error ExceedsSupply();
    error WrongPayment();
    error WithdrawFailed();

    constructor(address initialOwner, string memory baseURI_)
        ERC721A("Arctounon", "ARCT")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseURI_;
    }

    // ---- Minting ------------------------------------------------------------

    /// @notice Paid mint open to everyone, bounded by the per-wallet cap.
    function publicMint(uint256 quantity) external payable nonReentrant {
        if (!publicMintOpen) revert PublicClosed();
        if (quantity == 0) revert ZeroQuantity();
        if (minted[msg.sender] + quantity > MAX_PER_WALLET) revert ExceedsWalletCap();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        if (msg.value != publicPrice * quantity) revert WrongPayment();

        minted[msg.sender] += quantity;
        _mint(msg.sender, quantity);
        emit PublicMinted(msg.sender, quantity);
    }

    // ---- Owner --------------------------------------------------------------

    /// @notice Mint straight to an address for free (team/treasury reserves and
    /// allowlist distributions), still bounded by total supply but exempt from
    /// the per-wallet cap.
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (quantity == 0) revert ZeroQuantity();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        _mint(to, quantity);
    }

    function setPublicMintOpen(bool value) external onlyOwner {
        publicMintOpen = value;
    }

    function setPublicPrice(uint256 value) external onlyOwner {
        publicPrice = value;
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function withdraw(address payable to) external onlyOwner {
        (bool ok, ) = to.call{value: address(this).balance}("");
        if (!ok) revert WithdrawFailed();
    }

    // ---- Views / overrides --------------------------------------------------

    /// @notice Total tokens minted so far (for supply progress UIs).
    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    /// @notice Public mints a wallet can still make under the per-wallet cap.
    function remainingForWallet(address wallet) external view returns (uint256) {
        uint256 used = minted[wallet];
        return used >= MAX_PER_WALLET ? 0 : MAX_PER_WALLET - used;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        string memory base = _baseURI();
        return
            bytes(base).length != 0
                ? string(abi.encodePacked(base, _toString(tokenId), ".json"))
                : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
