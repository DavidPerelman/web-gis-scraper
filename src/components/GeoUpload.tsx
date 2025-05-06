"use client";

import { useRef, useState } from "react";

export default function GeoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0] || null;
    setFile(uploaded);
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    setStatus("loading");
    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-polygon`,
        {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMessage("ההעלאה בוטלה");
      } else {
        setErrorMessage("אירעה שגיאה במהלך העלאת הקובץ");
      }

      // אפשרות: להחזיר ל־idle אוטומטית אחרי כמה שניות
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setFile(null);
    setDownloadUrl(null);
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
          בחר קובץ ← לחץ על &quot;שלח&quot; ← המתן לתשובה ← הורד את הקובץ המעובד
        </p>
        <p className="text-gray-600">
          <span className="text-blue-600 text-lg">ℹ️</span>
          שימו לב: ככל שהפוליגון גדול יותר כך התהליך ייקח יותר זמן...
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
          {status === "idle" && (
            <button
              className={`px-4 py-2 rounded text-white ${
                file
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
              disabled={!file}
            >
              שלח
            </button>
          )}

          {status === "loading" && (
            <div className="text-center">
              <p className="text-blue-600 mb-2">הבקשה בתהליך...</p>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer"
                onClick={handleCancel}
              >
                ביטול
              </button>
            </div>
          )}
        </div>

        {status === "success" && (
          <div className="text-center text-green-600 space-y-2">
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
        {status === "error" && errorMessage && (
          <p className="text-red-600 text-center">❌ {errorMessage}</p>
        )}
      </div>
    </div>
  );
}
