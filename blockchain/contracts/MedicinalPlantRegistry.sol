// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RoleManager.sol";
import "./BatchTransfer.sol";

/**
 * @title MedicinalPlantRegistry
 * @dev Main registry contract for medicinal plant batches.
 *      Inherits role management and batch transfer logic.
 */
contract MedicinalPlantRegistry is RoleManager, BatchTransfer {

    // ── Struct ────────────────────────────────────────────────────────
    struct Batch {
        string  batchId;
        string  plantName;
        string  scientificName;
        string  partUsed;
        string  traditionalUse;
        uint256 harvestDate;
        string  sourceLocation;
        string  ipfsCID;
        address currentOwner;
        bool    exists;
        bool    verified;
    }

    // ── State ─────────────────────────────────────────────────────────
    mapping(string => Batch) public batches;

    // Enumerable list of all batch IDs
    string[] private _batchIds;

    // ── Events ────────────────────────────────────────────────────────
    event BatchRegistered(
        string  indexed batchId,
        string          plantName,
        address indexed owner,
        uint256         timestamp
    );

    event BatchVerified(
        string  indexed batchId,
        address indexed verifiedBy,
        uint256         timestamp
    );

    event BatchUpdated(
        string  indexed batchId,
        string          ipfsCID,
        uint256         timestamp
    );

    // ── Functions ─────────────────────────────────────────────────────

    /**
     * @notice Register a new medicinal plant batch.
     * @dev Caller must have the "Farmer" role.
     */
    function registerBatch(
        string calldata batchId,
        string calldata plantName,
        string calldata scientificName,
        string calldata partUsed,
        string calldata traditionalUse,
        uint256         harvestDate,
        string calldata sourceLocation,
        string calldata ipfsCID
    ) external onlyFarmer {
        require(bytes(batchId).length > 0,    "Registry: batchId is empty");
        require(!batches[batchId].exists,     "Registry: batch already registered");
        require(bytes(plantName).length > 0,  "Registry: plantName is empty");
        require(bytes(ipfsCID).length > 0,    "Registry: IPFS CID is empty");

        batches[batchId] = Batch({
            batchId:        batchId,
            plantName:      plantName,
            scientificName: scientificName,
            partUsed:       partUsed,
            traditionalUse: traditionalUse,
            harvestDate:    harvestDate,
            sourceLocation: sourceLocation,
            ipfsCID:        ipfsCID,
            currentOwner:   msg.sender,
            exists:         true,
            verified:       false
        });

        _batchIds.push(batchId);

        emit BatchRegistered(batchId, plantName, msg.sender, block.timestamp);
    }

    /**
     * @notice Transfer ownership of a batch to a new address.
     * @dev Caller must be the current owner of the batch.
     */
    function transferBatch(
        string  calldata batchId,
        address          newOwner,
        string  calldata note
    ) external {
        Batch storage batch = batches[batchId];
        require(batch.exists,                         "Registry: batch does not exist");
        require(batch.currentOwner == msg.sender,     "Registry: caller is not owner");

        address previousOwner = batch.currentOwner;
        batch.currentOwner = newOwner;

        // Record in BatchTransfer history
        _transferBatch(batchId, previousOwner, newOwner, note);
    }

    /**
     * @notice Authority verifies a batch as authentic.
     * @dev Caller must have the "Authority" role.
     */
    function verifyBatch(string calldata batchId) external onlyAuthority {
        require(batches[batchId].exists, "Registry: batch does not exist");
        batches[batchId].verified = true;
        emit BatchVerified(batchId, msg.sender, block.timestamp);
    }

    /**
     * @notice Update the IPFS CID for a batch (e.g., after processing).
     * @dev Caller must be the current owner.
     */
    function updateBatchCID(string calldata batchId, string calldata newCID)
        external
    {
        Batch storage batch = batches[batchId];
        require(batch.exists,                     "Registry: batch does not exist");
        require(batch.currentOwner == msg.sender, "Registry: caller is not owner");
        require(bytes(newCID).length > 0,         "Registry: CID is empty");

        batch.ipfsCID = newCID;
        emit BatchUpdated(batchId, newCID, block.timestamp);
    }

    /**
     * @notice Get all details of a batch.
     */
    function getBatch(string calldata batchId)
        external
        view
        returns (Batch memory)
    {
        require(batches[batchId].exists, "Registry: batch does not exist");
        return batches[batchId];
    }

    /**
     * @notice Check if a batch exists and is verified.
     * @return exists   Whether the batch is registered.
     * @return verified Whether an Authority has verified it.
     */
    function isBatchVerified(string calldata batchId)
        external
        view
        returns (bool exists, bool verified)
    {
        Batch storage b = batches[batchId];
        return (b.exists, b.verified);
    }

    /**
     * @notice Get all registered batch IDs.
     */
    function getAllBatchIds() external view returns (string[] memory) {
        return _batchIds;
    }

    /**
     * @notice Total number of registered batches.
     */
    function totalBatches() external view returns (uint256) {
        return _batchIds.length;
    }
}
