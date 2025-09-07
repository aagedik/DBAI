// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title DUBAI AI (DBAI) – Charity Token
/// @notice BEP-20 compatible ERC20 with 1% charity fee, burnable, pausable, ownable, non-upgradeable.
contract DBAI is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    using SafeERC20 for ERC20;

    // 1% charity fee = 100 basis points
    uint16 public constant CHARITY_FEE_BPS = 100; // immutable constant
    uint16 public constant BPS_DENOMINATOR = 10_000;

    // Charity wallet where fees are collected
    address public charityWallet;

    // Fee-exempt addresses (owner, charity, vesting contracts, etc.)
    mapping(address => bool) public isFeeExempt;

    // Trading control: prevent transfers before official launch
    bool public tradingEnabled;

    event TradingEnabled();
    event CharityWalletUpdated(address indexed previous, address indexed current);
    event FeeExemptUpdated(address indexed account, bool isExempt);

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        address charityWallet_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        require(charityWallet_ != address(0), "Charity wallet required");
        charityWallet = charityWallet_;
        isFeeExempt[charityWallet_] = true;
        isFeeExempt[initialOwner] = true;

        _mint(initialOwner, initialSupply);
    }

    // Pause controls
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice One-way switch to enable trading after liquidity is added and settings are finalized.
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "already enabled");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    function setCharityWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero address");
        emit CharityWalletUpdated(charityWallet, newWallet);
        charityWallet = newWallet;
        isFeeExempt[newWallet] = true;
    }

    function setFeeExempt(address account, bool exempt) external onlyOwner {
        isFeeExempt[account] = exempt;
        emit FeeExemptUpdated(account, exempt);
    }

    // Hook to integrate pause and fee logic
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        if (from == address(0) || to == address(0)) {
            // Mint or burn path uses default behavior
            super._update(from, to, value);
            return;
        }

        // Pre-launch: only allow owner and fee-exempt addresses to move tokens
        if (!tradingEnabled) {
            require(isFeeExempt[from] || isFeeExempt[to] || from == owner() || to == owner(), "trading not enabled");
        }

        if (isFeeExempt[from] || isFeeExempt[to]) {
            // No fee
            super._update(from, to, value);
        } else {
            // Apply 1% fee to charity wallet
            uint256 fee = (value * CHARITY_FEE_BPS) / BPS_DENOMINATOR;
            uint256 amountAfterFee = value - fee;
            // Transfer fee to charity
            super._update(from, charityWallet, fee);
            // Transfer remainder to recipient
            super._update(from, to, amountAfterFee);
        }
    }
}
