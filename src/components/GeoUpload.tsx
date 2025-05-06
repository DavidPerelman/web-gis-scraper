"use client";

import { useState } from "react";

export default function GeoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0] || null;
    setFile(uploaded);
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-polygon`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setMessage(JSON.stringify(data));
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".zip,.geojson,.json,.shp"
        onChange={handleFileChange}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Upload
      </button>
      {message && <pre className="text-sm bg-gray-100 p-2">{message}</pre>}
    </div>
  );
}
