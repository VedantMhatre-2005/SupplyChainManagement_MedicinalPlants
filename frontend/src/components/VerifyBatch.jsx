import React, { useState } from "react";
import { getContract } from "../contract";

function VerifyBatch() {
  const [batchId, setBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!batchId.trim() || isNaN(Number(batchId))) {
      setStatus({ type: "error", message: "Please enter a valid Batch ID." });
      return;
    }

    setLoading(true);
    setBatchData(null);
    setStatus({ type: "", message: "" });

    try {
      const contract = await getContract();
      const result = await contract.getBatch(Number(batchId));

      setBatchData({
        plantName: result.plantName,
        scientificName: result.scientificName,
        partUsed: result.partUsed,
        traditionalUse: result.traditionalUse,
        currentOwner: result.currentOwner,
        ipfsHash: result.ipfsHash,
      });

      setStatus({ type: "success", message: "Batch found on blockchain." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to fetch batch. Check the Batch ID.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Verify Batch</h2>
      <p className="card-subtitle">
        Retrieve and verify batch details from the blockchain.
      </p>

      <form className="form" onSubmit={handleVerify}>
        <div className="form-group verify-row">
          <input
            type="number"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter Batch ID"
            min="0"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Fetching…" : "Verify"}
          </button>
        </div>
      </form>

      {status.message && (
        <div className={`status-box status-${status.type}`}>
          {status.message}
        </div>
      )}

      {batchData && (
        <div className="batch-details">
          <div className="verified-badge">
            <span className="check-icon">✔</span> Blockchain Verified
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Plant Name</span>
              <span className="detail-value">{batchData.plantName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Scientific Name</span>
              <span className="detail-value italic">{batchData.scientificName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Part Used</span>
              <span className="detail-value">{batchData.partUsed}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Traditional Use</span>
              <span className="detail-value">{batchData.traditionalUse}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Current Owner</span>
              <span className="detail-value mono">{batchData.currentOwner}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">IPFS Hash</span>
              <a
                className="detail-value mono link"
                href={`https://ipfs.io/ipfs/${batchData.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {batchData.ipfsHash}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyBatch;
