import { MoneyKind, PaymentMethod, PurchaseStatus } from "@prisma/client";

export function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function requiredString(value: FormDataEntryValue | null, fieldName: string) {
  const text = optionalString(value);

  if (!text) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return text;
}

export function optionalDecimal(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const normalized = text.replace(",", ".");
  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error("El valor numerico no es valido.");
  }

  return normalized;
}

export function requiredDecimal(value: FormDataEntryValue | null, fieldName: string) {
  const decimal = optionalDecimal(value);

  if (decimal === null) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return decimal;
}

export function requiredInteger(value: FormDataEntryValue | null, fieldName: string) {
  const number = Number(String(value ?? "").trim());

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} no es valido.`);
  }

  return number;
}

export function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  return new Date(`${text}T00:00:00.000Z`);
}

export function requiredDate(value: FormDataEntryValue | null, fieldName: string) {
  const text = requiredString(value, fieldName);
  return new Date(`${text}T00:00:00.000Z`);
}

export function booleanFrom(value: FormDataEntryValue | null) {
  return String(value ?? "true") === "true";
}

export function moneyKind(value: FormDataEntryValue | null) {
  const text = String(value ?? MoneyKind.CASH);

  if (!Object.values(MoneyKind).includes(text as MoneyKind)) {
    return MoneyKind.CASH;
  }

  return text as MoneyKind;
}

export function purchaseStatus(value: FormDataEntryValue | null) {
  const text = String(value ?? PurchaseStatus.ORDERED);

  if (!Object.values(PurchaseStatus).includes(text as PurchaseStatus)) {
    return PurchaseStatus.ORDERED;
  }

  return text as PurchaseStatus;
}

export function paymentMethod(value: FormDataEntryValue | null) {
  const text = String(value ?? PaymentMethod.TRANSFER);

  if (!Object.values(PaymentMethod).includes(text as PaymentMethod)) {
    return PaymentMethod.TRANSFER;
  }

  return text as PaymentMethod;
}
