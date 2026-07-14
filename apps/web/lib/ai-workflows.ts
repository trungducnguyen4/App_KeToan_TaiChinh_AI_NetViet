export type AiWorkflowResponse = {
  configured?: boolean;
  status?: string;
  outputs?: Record<string, unknown>;
  error?: string;
};

export function readAiWorkflowOutputValue(response: AiWorkflowResponse) {
  if (response.error) {
    return response.error;
  }

  const outputs = response.outputs ?? {};
  return (
    outputs.output ??
    outputs.narrative ??
    outputs.answer ??
    outputs.text ??
    outputs.message ??
    outputs.report_summary ??
    outputs.cfo_commentary
  );
}

export function readAiWorkflowOutput(response: AiWorkflowResponse, fallback: string) {
  const candidate = readAiWorkflowOutputValue(response);

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  if (candidate !== undefined && candidate !== null) {
    return JSON.stringify(candidate, null, 2);
  }

  if (response.configured === false) {
    return fallback;
  }

  return "AI da xu ly workflow nhung output chua co truong hien thi.";
}
