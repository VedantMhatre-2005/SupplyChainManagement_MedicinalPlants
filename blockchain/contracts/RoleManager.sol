// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleManager
 * @dev Manages user roles in the medicinal plant supply chain.
 *      Roles: Farmer, Processor, Distributor, Authority
 */
contract RoleManager {
    // ── Role constants ────────────────────────────────────────────────
    string public constant ROLE_FARMER      = "Farmer";
    string public constant ROLE_PROCESSOR   = "Processor";
    string public constant ROLE_DISTRIBUTOR = "Distributor";
    string public constant ROLE_AUTHORITY   = "Authority";

    address public admin;

    mapping(address => string) public roles;

    // ── Events ────────────────────────────────────────────────────────
    event RoleAssigned(address indexed account, string role, address indexed assignedBy);
    event RoleRevoked(address indexed account, address indexed revokedBy);

    // ── Modifiers ─────────────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "RoleManager: caller is not admin");
        _;
    }

    modifier onlyFarmer() {
        require(
            keccak256(bytes(roles[msg.sender])) == keccak256(bytes(ROLE_FARMER)),
            "RoleManager: caller is not a Farmer"
        );
        _;
    }

    modifier onlyProcessor() {
        require(
            keccak256(bytes(roles[msg.sender])) == keccak256(bytes(ROLE_PROCESSOR)),
            "RoleManager: caller is not a Processor"
        );
        _;
    }

    modifier onlyDistributor() {
        require(
            keccak256(bytes(roles[msg.sender])) == keccak256(bytes(ROLE_DISTRIBUTOR)),
            "RoleManager: caller is not a Distributor"
        );
        _;
    }

    modifier onlyAuthority() {
        require(
            keccak256(bytes(roles[msg.sender])) == keccak256(bytes(ROLE_AUTHORITY)),
            "RoleManager: caller is not an Authority"
        );
        _;
    }

    modifier hasAnyRole() {
        require(bytes(roles[msg.sender]).length > 0, "RoleManager: caller has no role");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────
    constructor() {
        admin = msg.sender;
        // Grant admin the Authority role by default
        roles[msg.sender] = ROLE_AUTHORITY;
        emit RoleAssigned(msg.sender, ROLE_AUTHORITY, msg.sender);
    }

    // ── Functions ─────────────────────────────────────────────────────

    /**
     * @notice Assign a role to an address. Only admin can call.
     * @param account The address to assign the role to.
     * @param role    One of: "Farmer", "Processor", "Distributor", "Authority"
     */
    function assignRole(address account, string calldata role) external onlyAdmin {
        require(account != address(0), "RoleManager: zero address");
        require(_isValidRole(role), "RoleManager: invalid role");
        roles[account] = role;
        emit RoleAssigned(account, role, msg.sender);
    }

    /**
     * @notice Revoke the role of an address. Only admin can call.
     */
    function revokeRole(address account) external onlyAdmin {
        require(bytes(roles[account]).length > 0, "RoleManager: account has no role");
        delete roles[account];
        emit RoleRevoked(account, msg.sender);
    }

    /**
     * @notice Get the role of an address.
     */
    function getRole(address account) external view returns (string memory) {
        return roles[account];
    }

    /**
     * @notice Check whether an address has a specific role.
     */
    function hasRole(address account, string calldata role) external view returns (bool) {
        return keccak256(bytes(roles[account])) == keccak256(bytes(role));
    }

    // ── Internal ──────────────────────────────────────────────────────
    function _isValidRole(string calldata role) internal pure returns (bool) {
        bytes32 h = keccak256(bytes(role));
        return (
            h == keccak256(bytes("Farmer"))      ||
            h == keccak256(bytes("Processor"))   ||
            h == keccak256(bytes("Distributor")) ||
            h == keccak256(bytes("Authority"))
        );
    }
}
