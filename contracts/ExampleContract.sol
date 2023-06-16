pragma solidity ^0.8.17;

import "@scroll-tech/contracts/L2/predeploys/IL1GasPriceOracle.sol";

contract ExampleContract {
    uint public exampleVariable;

    function setExampleVariable(uint _exampleVariable) external {
        exampleVariable = _exampleVariable;
    }
}