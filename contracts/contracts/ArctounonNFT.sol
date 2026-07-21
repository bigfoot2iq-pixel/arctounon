// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArctounonNFT
 * @notice 2,222 pandas on Arc Chain.
 *
 *   - Allowlist — owner-approved wallets mint for {allowlistPrice} each during
 *     the [{allowlistStart}, {allowlistEnd}] window, up to {allowlistMintLimit}
 *     tokens per wallet.
 *   - Public — anyone mints for {publicPrice} each while {publicMintOpen}.
 *   - Owner — {ownerMint} mints straight to any address for free (team,
 *     treasury, and any manual distributions), exempt from the caps.
 *
 * The allowlist is held on-chain: the owner sets the member list, the mint
 * window, the price, and the per-wallet limit. A single hard cap,
 * {MAX_PER_WALLET} (5), applies to the public phase; the allowlist phase uses
 * its own {allowlistMintLimit}. Owner mints are exempt from both caps but still
 * bounded by total supply.
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

    // ---- Allowlist phase (owner controlled) ---------------------------------
    /// @notice Wallets the owner has approved for the allowlist mint.
    mapping(address => bool) public allowlisted;

    /// @notice Price per token for the allowlist phase, in wei (USDC, 18 dp).
    uint256 public allowlistPrice;

    /// @notice Unix timestamps bounding the allowlist window (both inclusive).
    /// Left at 0 => the allowlist phase is closed.
    uint256 public allowlistStart;
    uint256 public allowlistEnd;

    /// @notice Max tokens each allowlisted wallet may mint in the allowlist phase.
    uint256 public allowlistMintLimit;

    // ---- Per-wallet tracking ------------------------------------------------
    /// @notice Public mints per wallet (enforces the per-wallet cap).
    mapping(address => uint256) public minted;

    /// @notice Allowlist mints per wallet (enforces {allowlistMintLimit}).
    mapping(address => uint256) public allowlistMinted;

    event PublicMinted(address indexed wallet, uint256 quantity);
    event AllowlistMinted(address indexed wallet, uint256 quantity);
    event AllowlistSet(address indexed wallet, bool allowed);
    event AllowlistWindowSet(uint256 start, uint256 end);

    error PublicClosed();
    error ZeroQuantity();
    error ExceedsWalletCap();
    error ExceedsSupply();
    error WrongPayment();
    error WithdrawFailed();
    error NotAllowlisted();
    error AllowlistClosed();
    error ExceedsAllowlistAllowance();
    error InvalidWindow();

    constructor(address initialOwner, string memory baseURI_)
        ERC721A("Arctounon", "ARCT")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseURI_;
    }

    // ---- Minting ------------------------------------------------------------

    /// @notice Paid mint restricted to allowlisted wallets during the window,
    /// bounded by the per-wallet {allowlistMintLimit}.
    function allowlistMint(uint256 quantity) external payable nonReentrant {
        if (!_allowlistOpen()) revert AllowlistClosed();
        if (!allowlisted[msg.sender]) revert NotAllowlisted();
        if (quantity == 0) revert ZeroQuantity();
        if (allowlistMinted[msg.sender] + quantity > allowlistMintLimit)
            revert ExceedsAllowlistAllowance();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        if (msg.value != allowlistPrice * quantity) revert WrongPayment();

        allowlistMinted[msg.sender] += quantity;
        _mint(msg.sender, quantity);
        emit AllowlistMinted(msg.sender, quantity);
    }

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

    /// @notice Approve or revoke a batch of wallets for the allowlist mint.
    function setAllowlist(address[] calldata wallets, bool allowed) external onlyOwner {
        for (uint256 i; i < wallets.length; ++i) {
            allowlisted[wallets[i]] = allowed;
            emit AllowlistSet(wallets[i], allowed);
        }
    }

    /// @notice Set the allowlist mint window (unix seconds, both inclusive).
    /// Requires start < end, or (0, 0) to close the phase.
    function setAllowlistWindow(uint256 start, uint256 end) external onlyOwner {
        if (!(start == 0 && end == 0) && start >= end) revert InvalidWindow();
        allowlistStart = start;
        allowlistEnd = end;
        emit AllowlistWindowSet(start, end);
    }

    function setAllowlistPrice(uint256 value) external onlyOwner {
        allowlistPrice = value;
    }

    /// @notice Max tokens each allowlisted wallet may mint in the allowlist phase.
    function setAllowlistMintLimit(uint256 value) external onlyOwner {
        allowlistMintLimit = value;
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

    /// @notice Whether the allowlist mint window is currently open.
    function allowlistOpen() external view returns (bool) {
        return _allowlistOpen();
    }

    /// @notice Allowlist mints a wallet can still make under {allowlistMintLimit}.
    function remainingAllowlistForWallet(address wallet) external view returns (uint256) {
        if (!allowlisted[wallet]) return 0;
        uint256 used = allowlistMinted[wallet];
        return used >= allowlistMintLimit ? 0 : allowlistMintLimit - used;
    }

    function _allowlistOpen() internal view returns (bool) {
        return
            allowlistStart != 0 &&
            block.timestamp >= allowlistStart &&
            block.timestamp <= allowlistEnd;
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
