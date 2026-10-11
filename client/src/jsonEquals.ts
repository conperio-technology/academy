// Compares two JSON strings by parsed value, not raw text -- Python's json.dumps([1, 2])
// and C#'s JsonSerializer.Serialize (new[]{1,2}) produce differently-spaced but
// equivalent JSON, so a plain string compare would produce false failures.
export function jsonEquals(a: string, b: string): boolean {
  try {
    return deepEqual(JSON.parse(a), JSON.parse(b));
  } catch {
    return false;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }

  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    return aKeys.length === bKeys.length && aKeys.every((k) => deepEqual(aObj[k], bObj[k]));
  }

  return false;
}
