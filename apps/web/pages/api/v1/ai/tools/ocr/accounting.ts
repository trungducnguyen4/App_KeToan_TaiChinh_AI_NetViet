import type { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/ai/tools/ocr/accounting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
    });
    const text = await response.text();

    res.status(response.status);
    if (response.headers.get("content-type")?.includes("application/json")) {
      res.setHeader("Content-Type", "application/json");
      res.send(text);
      return;
    }

    res.json({ message: text });
  } catch {
    res.status(503).json({
      message:
        "Khong proxy duoc OCR tool tu web port 3000 sang API port 4000. Hay kiem tra API server va INTERNAL_API_URL/NEXT_PUBLIC_API_URL.",
    });
  }
}
