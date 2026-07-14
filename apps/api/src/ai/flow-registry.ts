export const AI_WORKFLOWS = {
  "ocr-accounting": {
    label: "OCR & goi y dinh khoan",
    apiKeyEnv: "DIFY_WORKFLOW_OCR_API_KEY",
    apiKeyEnvAliases: ["DIFY_WORKFLOW_OCR_KEY"],
  },
  "semantic-reconciliation": {
    label: "Doi chieu ngu nghia lech",
    apiKeyEnv: "DIFY_WORKFLOW_RECONCILIATION_API_KEY",
    apiKeyEnvAliases: ["DIFY_WORKFLOW_RECONCILIATION_KEY"],
  },
  "alert-writer": {
    label: "Soan van ban canh bao",
    apiKeyEnv: "DIFY_WORKFLOW_ALERT_API_KEY",
    apiKeyEnvAliases: ["DIFY_WORKFLOW_ALERT_KEY"],
  },
  "cfo-report": {
    label: "AI lap bao cao quan tri",
    apiKeyEnv: "DIFY_WORKFLOW_REPORT_API_KEY",
    apiKeyEnvAliases: ["DIFY_WORKFLOW_CFO_REPORT_KEY"],
  },
} as const;

export type AiWorkflowKey = keyof typeof AI_WORKFLOWS;

export function isAiWorkflowKey(value: string): value is AiWorkflowKey {
  return Object.prototype.hasOwnProperty.call(AI_WORKFLOWS, value);
}
