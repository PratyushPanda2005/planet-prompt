import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_TOKEN);

export async function classifyPrompt(prompt: string) {
    const result = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",

        inputs: prompt,

        parameters: {
            candidate_labels: [
                "needs no optimization",
                "needs some optimization",
                "needs significant optimization"
            ],
        },
    });

    const label = result[0].label;
    const confidence = result[0].score;

    let complexity;

    switch (label) {
        case "needs no optimization":
            complexity = "LOW";
            break;

        case "needs some optimization":
            complexity = "MEDIUM";
            break;

        default:
            complexity = "HIGH";
    }

    return {
        complexity,
        confidence,
        score: Math.round(confidence * 100),
        label,
    };
}