export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;

  const calculateDigit = (str: string, multiplier: number): number => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += parseInt(str[i]) * (multiplier - i);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cleaned.slice(0, 9), 10);
  const secondDigit = calculateDigit(cleaned.slice(0, 10), 11);

  return parseInt(cleaned[9]) === firstDigit && parseInt(cleaned[10]) === secondDigit;
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}