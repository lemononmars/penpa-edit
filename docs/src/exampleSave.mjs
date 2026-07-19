function normalizeVariantName(value) {
  return String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function metadataVariantIdForActiveVariants(activeVariants, variants) {
  const active = (Array.isArray(activeVariants) ? activeVariants : [])
    .filter((value) => normalizeVariantName(value) !== "classic");
  if (active.length !== 1) return null;
  const wanted = normalizeVariantName(active[0]);
  const match = variants.find((variant) =>
    normalizeVariantName(variant.id.replace(/([a-z])([A-Z])/g, "$1 $2")) === wanted ||
    normalizeVariantName(variant.name) === wanted
  );
  return match?.id || null;
}
