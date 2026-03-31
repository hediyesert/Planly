export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR");
}
