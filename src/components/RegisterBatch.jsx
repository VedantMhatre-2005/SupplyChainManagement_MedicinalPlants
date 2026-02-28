import React, { useState } from "react";
import { getContract } from "../contract";
import axios from "axios";


const initialForm = {
  plantName: "",
  scientificName: "",
  partUsed: "",
  traditionalUse: "",
  harvestDate: "",
  sourceLocation: "",
  ipfsHash: "",
};

function RegisterBatch() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Upload file to IPFS
  const uploadToIPFS = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Please select a file first." });
      return null;
    }

    setUploading(true);
    setStatus({ type: "pending", message: "Uploading file to IPFS..." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
          },
        }
      );

      const cid = res.data.IpfsHash;

      setForm((prev) => ({ ...prev, ipfsHash: cid }));
      setStatus({ type: "success", message: `File uploaded. CID: ${cid}` });

      return cid;
    } catch (error) {
      setStatus({ type: "error", message: "IPFS upload failed." });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Register batch on blockchain
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (excluding ipfsHash because it may be optional)
    const requiredFields = [
      "plantName",
      "scientificName",
      "partUsed",
      "traditionalUse",
      "harvestDate",
      "sourceLocation",
    ];

    for (let key of requiredFields) {
      if (!form[key].trim()) {
        setStatus({ type: "error", message: `Field "${key}" is required.` });
        return;
      }
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let cid = form.ipfsHash;

      // If file selected but not uploaded yet → upload first
      if (file && !form.ipfsHash) {
        cid = await uploadToIPFS();
        if (!cid) {
          setLoading(false);
          return;
        }
      }

      const contract = await getContract();

      const harvestTimestamp = Math.floor(
        new Date(form.harvestDate).getTime() / 1000
      );

      setStatus({
        type: "pending",
        message: "Transaction pending… confirm in MetaMask.",
      });

      const tx = await contract.registerBatch(
        form.plantName,
        form.scientificName,
        form.partUsed,
        form.traditionalUse,
        harvestTimestamp,
        form.sourceLocation,
        cid || ""
      );

      setStatus({ type: "pending", message: `Mining: ${tx.hash}` });

      await tx.wait();

      setStatus({
        type: "success",
        message: `Batch registered successfully! TX: ${tx.hash}`,
      });

      setForm(initialForm);
      setFile(null);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.reason || err?.message || "Transaction failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Register Medicinal Batch</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Plant Name</label>
          <input
            type="text"
            name="plantName"
            value={form.plantName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Scientific Name</label>
          <input
            type="text"
            name="scientificName"
            value={form.scientificName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Part Used</label>
          <input
            type="text"
            name="partUsed"
            value={form.partUsed}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Traditional Use</label>
          <input
            type="text"
            name="traditionalUse"
            value={form.traditionalUse}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Harvest Date</label>
          <input
            type="date"
            name="harvestDate"
            value={form.harvestDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Source Location</label>
          <input
            type="text"
            name="sourceLocation"
            value={form.sourceLocation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Upload Certificate (Optional)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <button
              type="button"
              className="btn"
              onClick={uploadToIPFS}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload to IPFS"}
            </button>
          )}
        </div>

        {form.ipfsHash && (
          <div className="form-group">
            <label>IPFS CID</label>
            <input type="text" value={form.ipfsHash} readOnly />
          </div>
        )}

        {status.message && (
          <div className={`status-box status-${status.type}`}>
            {status.message}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Batch"}
        </button>
      </form>
    </div>
  );
}

export default RegisterBatch;