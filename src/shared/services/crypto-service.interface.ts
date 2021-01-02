export const CRYPTO_SERVICE = 'CRYPTO_SERVICE';

export interface ICryptoService {
  encrypt(text: string): string;

  decrypt(hash: string): string;

  randomBytes(): string;
}
