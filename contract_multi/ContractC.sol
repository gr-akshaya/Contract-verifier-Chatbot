// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ContractA.sol";
import "./ContractB.sol";

contract ContractC is ContractA, ContractB {
    function getCombined() public pure returns (string memory, string memory) {
        return (getA(), getB());
    }
}
