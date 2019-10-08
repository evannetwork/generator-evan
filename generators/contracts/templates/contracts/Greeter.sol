pragma solidity 0.4.20;


/// @title Sample Contract 
/// @author evan.network GmbH
contract Greeter {
    // private member for test data and greeting
    uint8 public data;
    string private greeting;

    /// @notice create new instance, keep owner for later checks
    /// @param _greeting greeting message
    function Greeter(string _greeting) {
        greeting = _greeting;
    }

    /// @notice update data value
    /// @param _data value for data
    function setData(uint8 _data) public {
        data = _data;
    }

    /// @notice greet user with predefined messasge
    function greet() public constant returns (string) {
        return greeting;
    }
}