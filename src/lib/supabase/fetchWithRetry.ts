const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 400;

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function backoffDelay(attempt: number) {
  return BASE_DELAY_MS * 2 ** attempt + Math.random() * 200;
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

/**
 * Custom fetch for the Supabase client: adds a request timeout and retries
 * with exponential backoff, so a flaky connection doesn't just fail once
 * and give up.
 *
 * GET/HEAD/DELETE are idempotent — safe to retry on any network failure or
 * retryable status. POST/PATCH (inserts/updates) only retry when the
 * request never reached the server at all (immediate connection failure);
 * if our own timeout fired, we can't tell whether the server already
 * processed it, so retrying could double-submit — we let that surface as
 * an error instead of guessing.
 */
export async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD" || method === "DELETE";
  const maxRetries = isIdempotent ? MAX_RETRIES : 1;
  const externalSignal = init.signal;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    let timedOut = false;

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok && isRetryableStatus(response.status) && attempt < maxRetries) {
        await wait(backoffDelay(attempt));
        continue;
      }
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (externalSignal?.aborted) throw err; // caller cancelled — respect it
      const safeToRetry = isIdempotent || !timedOut; // mutations: only on immediate failure, not ambiguous timeout
      if (safeToRetry && attempt < maxRetries) {
        await wait(backoffDelay(attempt));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
