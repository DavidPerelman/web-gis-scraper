"use client";

import { useState } from "react";

export default function GeoUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0] || null;
    setFile(uploaded);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".zip,.geojson,.json,.shp"
        onChange={handleFileChange}
      />
    </div>
  );
}
