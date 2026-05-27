export type Program = {
  id: string;
  name: string;
};

export type DeleteResult = {
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

function apiBaseUrl(): string {
  const url = process.env.DIDAXIS_URL;
  if (!url) {
    throw new Error("DIDAXIS_URL is not set in .env");
  }
  return url.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = process.env.DIDAXIS_API_TOKEN;
  if (!token) {
    throw new Error("DIDAXIS_API_TOKEN is not set in .env");
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function getAllPrograms(): Promise<Program[]> {
  const response = await fetch(`${apiBaseUrl()}/api/programs`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GET /api/programs failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { data?: Program[] };
  return body.data ?? [];
}

export async function deleteProgramById(id: string): Promise<DeleteResult> {
  const response = await fetch(`${apiBaseUrl()}/api/programs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (response.ok) {
    return { id, ok: true, status: response.status, message: "Program deleted" };
  }

  const message = await response.text();
  return {
    id,
    ok: false,
    status: response.status,
    message: message || response.statusText,
  };
}

export async function deleteProgramsByIds(ids: string[]): Promise<DeleteResult[]> {
  const uniqueIds = [...new Set(ids.filter((id) => id.trim().length > 0))];
  const results: DeleteResult[] = [];

  for (const id of uniqueIds) {
    results.push(await deleteProgramById(id));
  }

  return results;
}
