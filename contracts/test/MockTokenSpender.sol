// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockTokenSpender {
  address public from;
  uint256 public value;
  address public token;
  bool public wasCalled;
  bytes public extraData;

  constructor() {}

  function receiveApproval(
    address _from,
    uint256 _value,
    address _token,
    bytes calldata _extraData
  ) public {
    from = _from;
    value = _value;
    token = _token;
    extraData = _extraData;
    wasCalled = true;
  }
}
