/**
 * Code Execution Service Client Adapter
 * 
 * ARCHITECTURE & SECURITY SPECIFICATION:
 * 1. Security Guarantee: Browser client code NEVER runs candidate code via `eval()`,
 *    `new Function()`, or uncontained workers.
 * 2. Remote Evaluator Boundary: When configured (e.g. Judge0, Piston, or a secure
 *    Docker microservice), code is submitted to an isolated container with:
 *      - CPU timeout limit: 2000ms
 *      - Memory limit: 128MB
 *      - Process limit: 1
 *      - Network disabled: iptables DROP
 *      - Read-only root filesystem
 * 3. Hidden Test Protection: Hidden test cases and benchmark answers remain on the backend
 *    evaluator and are never exposed in browser client network payloads.
 * 4. Honest Fallback: When no remote sandbox endpoint is configured, code questions are
 *    explicitly labeled as `self_review` / `ungraded`. The candidate evaluates their code
 *    against visible test specifications and complexity rubrics.
 */

export interface CodeExecutionRequest {
  language: string;
  sourceCode: string;
  questionId: string;
  visibleInputs?: string[];
}

export interface TestCaseExecutionResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  compilerError?: string;
  runtimeError?: string;
}

export interface CodeExecutionResponse {
  isConfigured: boolean;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'service_unavailable';
  message: string;
  results: TestCaseExecutionResult[];
}

export class CodeExecutionService {
  private endpointUrl: string | null = null;

  constructor(endpointUrl?: string) {
    if (endpointUrl && endpointUrl.trim()) {
      this.endpointUrl = endpointUrl.trim();
    }
  }

  public isServiceAvailable(): boolean {
    return Boolean(this.endpointUrl);
  }

  public getEndpoint(): string | null {
    return this.endpointUrl;
  }

  /**
   * Submits code to the remote secure execution boundary if configured.
   * If not configured, immediately returns an honest unavailable status.
   */
  public async execute(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    if (!this.endpointUrl) {
      return {
        isConfigured: false,
        status: 'service_unavailable',
        message: 'No remote code execution service is configured. Automatic sandbox evaluation is disabled. Please evaluate your solution against the provided test cases and reference rubric.',
        results: [],
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s HTTP timeout

      const response = await fetch(`${this.endpointUrl}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: request.questionId,
          language: request.language,
          sourceCode: request.sourceCode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Evaluator HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isConfigured: true,
        status: data.status || 'success',
        message: data.message || 'Execution completed.',
        results: data.results || [],
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown evaluation error';
      return {
        isConfigured: true,
        status: 'service_unavailable',
        message: `Code evaluator connection failed (${errorMsg}). Question reverted to self-review mode.`,
        results: [],
      };
    }
  }
}
