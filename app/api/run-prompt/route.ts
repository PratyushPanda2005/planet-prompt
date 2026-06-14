import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { promptText } = await req.json();

    if (!promptText) {
      return NextResponse.json(
        { success: false, error: "Missing promptText" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        output: "[No Gemini API key configured. This is a mock response.]",
      });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (
          result.candidates &&
          result.candidates[0] &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts[0] &&
          result.candidates[0].content.parts[0].text
        ) {
          const output = result.candidates[0].content.parts[0].text;
          return NextResponse.json({ success: true, output });
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid response structure from Gemini API" },
            { status: 502 }
          );
        }
      } else {
        const errText = await response.text();
        return NextResponse.json(
          { success: false, error: `Gemini API error: ${response.status} - ${errText}` },
          { status: 502 }
        );
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to fetch from Gemini API" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/run-prompt:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
