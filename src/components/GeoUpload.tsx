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
    <div className="max-w-xl mx-auto space-y-6 p-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          GIS Scraper
        </h1>
        <p className="text-gray-600">
          אפליקצייה לחילוץ נתוני תוכניות בנייה מאתר &quot;מנהל התכנון&quot;.
          ניתן להעלות קובץ פוליגון, ולקבל תוצאה מעובדת: שכבת פוליגונים הכוללת את
          התכניות שבתחום הפוליגון שהועלה, עם נתוני בנייה מורחבים עבור כל תכנית.
        </p>
        <p className="text-gray-600">
          בחר קובץ ← לחץ על &quot;Upload&quot; ← המתן לתשובה ← הורד את הקובץ
          המעובד
        </p>

        <div className="flex items-start gap-2 text-sm text-gray-700 border border-blue-200 bg-blue-50 p-3 rounded">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <div>
            <p>
              סוג קובץ נתמך: <strong>ZIP</strong> בלבד, המכיל שכבת SHP. חובה
              לכלול את הקבצים הבאים:
            </p>
            <ul className="list-disc list-inside">
              <li>
                <strong>.shp</strong> – נתוני הגיאומטריה
              </li>
              <li>
                <strong>.shx</strong> – אינדקס
              </li>
              <li>
                <strong>.dbf</strong> – טבלת המאפיינים
              </li>
            </ul>
            <p className="mt-1">העלאה של קובץ חסר תגרום לשגיאה.</p>
          </div>
        </div>

        <label
          htmlFor="file"
          className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
        >
          <p className="text-gray-600 mb-2">
            {file ? `✔️ ${file.name}` : "גרור קובץ לכאן או לחץ לבחירה"}
          </p>
          <input
            id="file"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="text-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
          >
            Upload
          </button>
        </div>

        {status === "loading" && (
          <p className="text-blue-600">הבקשה בתהליך...</p>
        )}
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
    </div>
  );
}
