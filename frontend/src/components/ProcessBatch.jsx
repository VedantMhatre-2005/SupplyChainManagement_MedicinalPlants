import React, { useState } from "react";
import { getContract } from "../contract";

const initialForm = {
  batchId: "",
  processingMethod: "",
  processingDate: "",
  ipfsHash: "",
};

function ProcessBatch() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        setStatus({ type: "error", message: `Field "${key}" is required.` });
        return;
      }
    }

    if (isNaN(Number(form.batchId)) || Number(form.batchId) < 0) {
      setStatus({ type: "error", message: "Batch ID must be a valid number." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const contract = await getContract();
      const processingTimestamp = Math.floor(
        new Date(form.processingDate).getTime() / 1000
      );

      setStatus({ type: "pending", message: "Transaction pending… please confirm in MetaMask." });

      const tx = await contract.updateProcessing(
        Number(form.batchId),
        form.processingMethod,
        processingTimestamp,
        form.ipfsHash
      );

      setStatus({ type: "pending", message: `Mining transaction: ${tx.hash}` });
      await tx.wait();

      setStatus({
        type: "success",
        message: `Processing updated successfully! TX Hash: ${tx.hash}`,
      });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Process Batch</h2>
      <p className="card-subtitle">
        Update the processing details for an existing batch.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Batch ID</label>
          <input
            type="number"
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            placeholder="e.g. 1"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Processing Method</label>
          <input
            type="text"
            name="processingMethod"
            value={form.processingMethod}
            onChange={handleChange}
            placeholder="e.g. Cold-press extraction, Sun drying"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Processing Date</label>
            <input
              type="date"
              name="processingDate"
              value={form.processingDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>IPFS Hash</label>
            <input
              type="text"
              name="ipfsHash"
              value={form.ipfsHash}
              onChange={handleChange}
              placeholder="Processing report CID"
            />
          </div>
        </div>

        {status.message && (
          <div className={`status-box status-${status.type}`}>
            {status.type === "pending" && (
              <span className="spinner" aria-hidden="true" />
            )}
            {status.message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating…" : "Update Processing"}
        </button>
      </form>
    </div>
  );
}

export default ProcessBatch;
