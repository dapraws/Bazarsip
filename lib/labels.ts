/**
 * Indonesian labels for the values stored in the database.
 *
 * The stored values stay English because they are constrained by CHECK
 * constraints; only what the seller reads is translated.
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Sampai",
  cancelled: "Dibatalkan",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Belum bayar",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

export function orderStatusLabel(value: string) {
  return ORDER_STATUS_LABELS[value] ?? value;
}

export function paymentStatusLabel(value: string) {
  return PAYMENT_STATUS_LABELS[value] ?? value;
}

/**
 * Product facets. Type lives in `categories`; these are the other axes a
 * buyer browses by. All of them are optional on a product — the seller
 * fills in what applies and leaves the rest.
 */
export const GENDERS = ["pria", "wanita", "unisex"] as const;
export const AGE_GROUPS = ["dewasa", "remaja", "anak"] as const;
export const STYLES = ["casual", "formal", "olahraga"] as const;

export const GENDER_LABELS: Record<string, string> = {
  pria: "Pria",
  wanita: "Wanita",
  unisex: "Unisex",
};

export const AGE_GROUP_LABELS: Record<string, string> = {
  dewasa: "Dewasa",
  remaja: "Remaja",
  anak: "Anak",
};

export const STYLE_LABELS: Record<string, string> = {
  casual: "Casual",
  formal: "Formal",
  olahraga: "Olahraga",
};

export function facetLabel(value: string | null | undefined) {
  if (!value) return null;
  return (
    GENDER_LABELS[value] ?? AGE_GROUP_LABELS[value] ?? STYLE_LABELS[value] ?? value
  );
}
