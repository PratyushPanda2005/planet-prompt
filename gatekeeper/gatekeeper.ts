import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_TOKEN);

export async function classifyPrompt(prompt: string) {
    try {
        if (!process.env.HF_API_TOKEN) {
            throw new Error("No HF_API_TOKEN configured");
        }

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
    } catch (error) {
        console.warn("Gatekeeper Hugging Face classification failed, using heuristic fallback:", error);

        // Fallback heuristic based on prompt length and verbose triggers
        const words = prompt.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        const verboseTriggers = /(please|kindly|could you|would you|thank you|thanks|i want you to|i need you to)/i;
        const hasVerboseTriggers = verboseTriggers.test(prompt);

        if (wordCount <= 4 && !hasVerboseTriggers) {
            return {
                complexity: "LOW",
                confidence: 0.9,
                score: 90,
                label: "needs no optimization",
            };
        } else if (wordCount > 20 || hasVerboseTriggers) {
            return {
                complexity: "HIGH",
                confidence: 0.85,
                score: 85,
                label: "needs significant optimization",
            };
        } else {
            return {
                complexity: "MEDIUM",
                confidence: 0.75,
                score: 75,
                label: "needs some optimization",
            };
        }
    }
}