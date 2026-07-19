// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArctounonNFT
 * @notice 2,222 pandas on Arc Chain, minted across two phases:
 *
 *   1. Allowlist — wallets self-register with {joinAllowlist} while the
 *      registration window is open, then mint FREE up to their owner-set
 *      allowance once {allowlistMintOpen} is flipped on.
 *   2. Public — anyone mints for {publicPrice} each while {publicMintOpen}.
 *
 * A single hard cap, {MAX_PER_WALLET} (5), applies to the COMBINED total a
 * wallet mints across both phases.
 *
 * Allowlist eligibility lives entirely on-chain — no backend, no database.
 * A wallet is allowlisted iff `allowlistAllowance[wallet] > 0`. Because the
 * social tasks that gate the UI cannot be cryptographically verified, entry is
 * guarded instead by an owner-controlled registration window, an optional
 * global cap ({maxAllowlist}), one-registration-per-wallet, and gas cost.
 */
contract ArctounonNFT is ERC721A, Ownable, ReentrancyGuard {
    // ---- Immutable collection limits ----------------------------------------
    uint256 public constant MAX_SUPPLY = 2222;
    uint256 public constant MAX_PER_WALLET = 5;

    // ---- Phase switches (owner controlled) ----------------------------------
    bool public registrationOpen;
    bool public allowlistMintOpen;
    bool public publicMintOpen;

    // ---- Economics / config -------------------------------------------------
    /// @notice Price per token for the public phase, in wei of the native
    /// currency (USDC, 18 decimals on Arc).
    uint256 public publicPrice;
    /// @notice Free mints granted to a wallet when it self-registers.
    uint256 public allowlistDefaultAllowance = 1;
    /// @notice Optional cap on total registrations (0 = unlimited).
    uint256 public maxAllowlist;
    /// @notice Number of wallets currently holding a non-zero allowance.
    uint256 public allowlistCount;

    string private _baseTokenURI;

    // ---- Per-wallet tracking ------------------------------------------------
    /// @notice Free-mint quota per wallet. 0 means "not allowlisted".
    mapping(address => uint256) public allowlistAllowance;
    /// @notice Allowlist (free) mints a wallet has already used.
    mapping(address => uint256) public freeMinted;
    /// @notice Total mints per wallet across BOTH phases (enforces the cap).
    mapping(address => uint256) public minted;

    event Joined(address indexed wallet, uint256 allowance);
    event AllowlistMinted(address indexed wallet, uint256 quantity);
    event PublicMinted(address indexed wallet, uint256 quantity);

    error RegistrationClosed();
    error AllowlistClosed();
    error PublicClosed();
    error AlreadyRegistered();
    error AllowlistFull();
    error NotAllowlisted();
    error ZeroQuantity();
    error ExceedsAllowance();
    error ExceedsWalletCap();
    error ExceedsSupply();
    error WrongPayment();
    error AllowanceAboveCap();
    error WithdrawFailed();

    constructor(address initialOwner, string memory baseURI_)
        ERC721A("Arctounon", "ARCT")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseURI_;
    }

    // ---- Allowlist registration (the "reserve" tx) --------------------------

    /// @notice Self-register for a free-mint spot. Callable once per wallet
    /// while registration is open and the optional global cap isn't reached.
    function joinAllowlist() external {
        if (!registrationOpen) revert RegistrationClosed();
        if (allowlistAllowance[msg.sender] != 0) revert AlreadyRegistered();
        if (maxAllowlist != 0 && allowlistCount >= maxAllowlist) revert AllowlistFull();

        allowlistAllowance[msg.sender] = allowlistDefaultAllowance;
        unchecked {
            allowlistCount++;
        }
        emit Joined(msg.sender, allowlistDefaultAllowance);
    }

    // ---- Minting ------------------------------------------------------------

    /// @notice Free mint for allowlisted wallets, bounded by their allowance
    /// and the shared per-wallet cap.
    function allowlistMint(uint256 quantity) external nonReentrant {
        if (!allowlistMintOpen) revert AllowlistClosed();
        if (quantity == 0) revert ZeroQuantity();

        uint256 allowance = allowlistAllowance[msg.sender];
        if (allowance == 0) revert NotAllowlisted();
        if (freeMinted[msg.sender] + quantity > allowance) revert ExceedsAllowance();
        if (minted[msg.sender] + quantity > MAX_PER_WALLET) revert ExceedsWalletCap();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();

        freeMinted[msg.sender] += quantity;
        minted[msg.sender] += quantity;
        _mint(msg.sender, quantity);
        emit AllowlistMinted(msg.sender, quantity);
    }

    /// @notice Paid mint open to everyone, bounded by the shared per-wallet cap.
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

    /// @notice Mint straight to an address (team/treasury reserves), still
    /// bounded by total supply but exempt from the per-wallet cap.
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsSupply();
        _mint(to, quantity);
    }

    function setRegistrationOpen(bool value) external onlyOwner {
        registrationOpen = value;
    }

    function setAllowlistMintOpen(bool value) external onlyOwner {
        allowlistMintOpen = value;
    }

    function setPublicMintOpen(bool value) external onlyOwner {
        publicMintOpen = value;
    }

    function setAllowlistDefaultAllowance(uint256 value) external onlyOwner {
        if (value > MAX_PER_WALLET) revert AllowanceAboveCap();
        allowlistDefaultAllowance = value;
    }

    function setPublicPrice(uint256 value) external onlyOwner {
        publicPrice = value;
    }

    function setMaxAllowlist(uint256 value) external onlyOwner {
        maxAllowlist = value;
    }

    /// @notice Grant or override the free allowance for a batch of wallets.
    /// Use to bump specific wallets (e.g. to 5) or hand-add team/partners
    /// without the tasks flow. Pass allowance 0 to remove wallets.
    function setAllowlistAllowance(address[] calldata wallets, uint256 allowance)
        external
        onlyOwner
    {
        if (allowance > MAX_PER_WALLET) revert AllowanceAboveCap();
        for (uint256 i = 0; i < wallets.length; i++) {
            uint256 current = allowlistAllowance[wallets[i]];
            if (current == 0 && allowance != 0) {
                unchecked {
                    allowlistCount++;
                }
            } else if (current != 0 && allowance == 0) {
                unchecked {
                    allowlistCount--;
                }
            }
            allowlistAllowance[wallets[i]] = allowance;
        }
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

    /// @notice Mints a wallet can still make under the shared per-wallet cap.
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
