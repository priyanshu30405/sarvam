const SAMPLE_RESPONSES: Record<string, string> = {
  default:
    "On-device inference lets engineers validate model behavior before fleet rollout. " +
    "Streaming tokens in the browser mirrors production latency patterns and helps catch regressions early. " +
    "This playground simulates a Sarvam-class multimodal endpoint with live metrics.",
  audio:
    "Transcription complete. The audio described a deployment workflow: build, benchmark on-device, " +
    "compare outputs across model versions, then push configuration to the fleet with staged rollouts.",
  hello:
    "Hello! I am a simulated inference endpoint for the Company X developer portal assignment.",
};

function pickResponse(prompt: string, mode: string): string {
  const lower = prompt.toLowerCase();
  if (mode === "audio") return SAMPLE_RESPONSES.audio;
  if (lower.includes("hello") || lower.includes("hi")) return SAMPLE_RESPONSES.hello;
  return SAMPLE_RESPONSES.default;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: Request): Promise<Response> {
  let body: { prompt?: string; mode?: string; simulateError?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt ?? "";
  const mode = body.mode ?? "text";
  const simulateError = body.simulateError;

  if (simulateError === "timeout") {
    await delay(1200);
    return Response.json({ error: "Model timeout", code: "TIMEOUT" }, { status: 504 });
  }

  const text = pickResponse(prompt, mode);
  const words = text.split(/(\s+)/);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for (let i = 0; i < words.length; i++) {
          if (simulateError === "midstream" && i === Math.floor(words.length * 0.55)) {
            controller.error(new Error("Simulated network drop"));
            return;
          }
          controller.enqueue(encoder.encode(words[i]));
          await delay(40);
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
