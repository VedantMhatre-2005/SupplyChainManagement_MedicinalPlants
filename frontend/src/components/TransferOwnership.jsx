import React, { useState } from "react";
import { getContract } from "../contract";

const initialForm = {
  batchId: "",
  newOwnerAddress: "",
};

function TransferOwnership() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.batchId.trim()) {
      setStatus({ type: "error", message: "Batch ID is required." });
      return;
    }
    if (!form.newOwnerAddress.trim()) {
      setStatus({ type: "error", message: "New owner address is required." });
      return;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(form.newOwnerAddress)) {
      setStatus({
        type: "error",
        message: "Invalid Ethereum address format.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const contract = await getContract();

      setStatus({ type: "pending", message: "Transaction pending… please confirm in MetaMask." });

      const tx = await contract.transferBatch(
        form.batchId,
        form.newOwnerAddress,
        "Transfer via DApp"
      );

      setStatus({ type: "pending", message: `Mining transaction: ${tx.hash}` });
      await tx.wait();

      setStatus({
        type: "success",
        message: `Ownership transferred successfully! TX Hash: ${tx.hash}`,
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
      <h2 className="card-title">Transfer Ownership</h2>
      <p className="card-subtitle">
        Transfer a batch to a new owner in the supply chain.
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
          <label>New Owner Ethereum Address</label>
          <input
            type="text"
            name="newOwnerAddress"
            value={form.newOwnerAddress}
            onChange={handleChange}
            placeholder="0x0000000000000000000000000000000000000000"
          />
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
          {loading ? "Transferring…" : "Transfer Ownership"}
        </button>
      </form>
    </div>
  );
}

export default TransferOwnership;
