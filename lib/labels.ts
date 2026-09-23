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
