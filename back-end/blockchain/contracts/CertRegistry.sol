// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CertRegistry {
    struct Certificate {
        string cid;
        address issuer;
        uint256 timestamp;
    }

    mapping(bytes32 => Certificate) private certificates;

    event CertificateRegistered(bytes32 indexed studentHash, string cid, address issuer, uint256 time);

    function registerCertificate(bytes32 studentHash, string calldata cid) external {
        require(bytes(certificates[studentHash].cid).length == 0, "Already exists");
        certificates[studentHash] = Certificate(cid, msg.sender, block.timestamp);
        emit CertificateRegistered(studentHash, cid, msg.sender, block.timestamp);
    }

    function getCertificate(bytes32 studentHash) external view returns (string memory, address, uint256) {
        Certificate memory cert = certificates[studentHash];
        return (cert.cid, cert.issuer, cert.timestamp);
    }
}
