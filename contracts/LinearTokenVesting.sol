// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title LinearTokenVesting
/// @notice Non-revocable linear vesting vault for a single ERC20 token with cliff.
///         Fund by transferring tokens to this contract after deployment.
contract LinearTokenVesting {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;          // vested token
    address public immutable beneficiary;   // receiver of vested tokens

    uint64 public immutable start;          // vesting start timestamp
    uint64 public immutable cliff;          // cliff timestamp (>= start)
    uint64 public immutable end;            // vesting end timestamp (> start)

    uint256 public released;                // total released amount

    event TokensReleased(uint256 amount);

    constructor(
        address token_,
        address beneficiary_,
        uint64 startTimestamp,
        uint64 cliffDuration,
        uint64 duration
    ) {
        require(token_ != address(0), "token=0");
        require(beneficiary_ != address(0), "beneficiary=0");
        require(duration > 0, "duration=0");
        require(cliffDuration <= duration, "cliff>duration");

        token = IERC20(token_);
        beneficiary = beneficiary_;
        start = startTimestamp;
        cliff = startTimestamp + cliffDuration;
        end = startTimestamp + duration;
    }

    /// @notice Current releasable amount.
    function releasable() public view returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released;
    }

    /// @notice Release vested tokens to the beneficiary.
    function release() external {
        uint256 amount = releasable();
        require(amount > 0, "nothing to release");
        released += amount;
        token.safeTransfer(beneficiary, amount);
        emit TokensReleased(amount);
    }

    /// @notice Vested amount at timestamp.
    /// @dev Vests linearly after cliff until end, based on total allocation (current balance + released).
    function vestedAmount(uint64 timestamp) public view returns (uint256) {
        uint256 totalAllocation = token.balanceOf(address(this)) + released;
        if (timestamp < cliff) {
            return 0;
        } else if (timestamp >= end) {
            return totalAllocation;
        } else {
            // linear between cliff and end
            uint64 vestedDuration = timestamp - start;
            uint64 totalDuration = end - start;
            return (totalAllocation * vestedDuration) / totalDuration;
        }
    }
}
