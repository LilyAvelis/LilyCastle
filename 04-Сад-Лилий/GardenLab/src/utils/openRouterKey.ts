const OPEN_ROUTER_KEY_REGEX = /^sk-or-v\d+-[a-z0-9_-]{20,}$/i;

export function normalizeOpenRouterKey(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function isOpenRouterKeyValid(value?: string | null): boolean {
    const normalized = normalizeOpenRouterKey(value);
    return normalized ? OPEN_ROUTER_KEY_REGEX.test(normalized) : false;
}

export function getApiKeyValidationHint(): string {
    return 'Keys must match the OpenRouter format (e.g., "sk-or-v1-...") and contain at least 20 trailing characters.';
}
