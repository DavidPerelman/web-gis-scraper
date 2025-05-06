"use client";

import { useState } from "react";

export default function GeoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0] || null;
    setFile(uploaded);
  };

  const handleSubmit = async () => {
    setStatus("loading");

    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-polygon`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" accept=".zip" onChange={handleFileChange} />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Upload
      </button>
      {status === "loading" && <p className="text-blue-600">הבקשה בתהליך...</p>}
      {status === "success" && (
        <div className="text-green-600 space-y-2">
          <p>✅ הבקשה הסתיימה בהצלחה</p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="inline-block px-4 py-2 bg-green-600 text-white rounded"
            >
              הורד קובץ
            </a>
          )}
        </div>
      )}
      {status === "error" && (
        <p className="text-red-600">❌ אירעה שגיאה במהלך העלאת הקובץ</p>
      )}
    </div>
  );
}
