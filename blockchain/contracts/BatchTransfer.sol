// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatchTransfer
 * @dev Handles ownership transfer logic for medicinal plant batches.
 */
contract BatchTransfer {

    // ── Struct ────────────────────────────────────────────────────────
    struct TransferRecord {
        string   batchId;
        address  previousOwner;
        address  newOwner;
        uint256  timestamp;
        string   note;          // optional transfer note / reason
    }

    // batchId => list of transfer records (full history)
    mapping(string => TransferRecord[]) private _transferHistory;

    // ── Events ────────────────────────────────────────────────────────
    event BatchTransferred(
        string  indexed batchId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256         timestamp
    );

    // ── Functions ─────────────────────────────────────────────────────

    /**
     * @notice Record an ownership transfer for a batch.
     * @dev Called internally by MedicinalPlantRegistry.
     */
    function _transferBatch(
        string  memory batchId,
        address        previousOwner,
        address        newOwner,
        string  memory note
    ) internal {
        require(newOwner != address(0), "BatchTransfer: new owner is zero address");
        require(previousOwner != newOwner, "BatchTransfer: same owner");

        _transferHistory[batchId].push(TransferRecord({
            batchId:       batchId,
            previousOwner: previousOwner,
            newOwner:      newOwner,
            timestamp:     block.timestamp,
            note:          note
        }));

        emit BatchTransferred(batchId, previousOwner, newOwner, block.timestamp);
    }

    /**
     * @notice Get the full transfer history for a batch.
     */
    function getTransferHistory(string calldata batchId)
        external
        view
        returns (TransferRecord[] memory)
    {
        return _transferHistory[batchId];
    }

    /**
     * @notice Get the number of ownership transfers for a batch.
     */
    function getTransferCount(string calldata batchId)
        external
        view
        returns (uint256)
    {
        return _transferHistory[batchId].length;
    }
}
