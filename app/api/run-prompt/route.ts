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

    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        output: "[No Sarvam API key configured. This is a mock response.]",
      });
    }

    try {
      const url = "https://api.sarvam.ai/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify({
          model: "sarvam-30b",
          messages: [
            {
              role: "user",
              content: promptText,
            },
          ],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (
          result.choices &&
          result.choices[0] &&
          result.choices[0].message &&
          result.choices[0].message.content
        ) {
          const output = result.choices[0].message.content;
          return NextResponse.json({ success: true, output });
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid response structure from Sarvam AI API" },
            { status: 502 }
          );
        }
      } else {
        const errText = await response.text();
        return NextResponse.json(
          { success: false, error: `Sarvam AI API error: ${response.status} - ${errText}` },
          { status: 502 }
        );
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to fetch from Sarvam AI API" },
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
