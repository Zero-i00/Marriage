import { HTTPError } from "ky";

type SchemaErrorBody = { message?: string };

/**
 * Достаёт сообщение об ошибке из ответа бэкенда (`{"message": ...}`,
 * см. AGENTS.md — единый JSON-формат DomainException). Для сетевых/неизвестных
 * ошибок падает обратно на `error.message`.
 */
export async function extractError(error: unknown): Promise<string[]> {
  if (error instanceof HTTPError) {
    const body: SchemaErrorBody = await error.response.json().catch(() => ({}));
    return [body.message ?? error.message];
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ["Неизвестная ошибка"];
}
