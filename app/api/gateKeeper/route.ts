import { classifyPrompt } from "@/gatekeeper/gatekeeper";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = await classifyPrompt(
            body.prompt
        );

        return Response.json(result);
    } catch (error) {
        console.error(error);

        return Response.json(
            {
                error: "Classification failed",
            },
            {
                status: 500,
            }
        );
    }
}