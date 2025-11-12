import CryptoJS from "crypto-js";
const crptoSecretKey = import.meta.env.VITE_CRYPTO_SECRET_KEY;

export function generatePath(points: number[][]) {
  const path = points.map(([x, y]) => `${x},${y}`).join(" L");
  return `M${path} Z`;
}

export const decrypt = (value: string) => {
  try {
    // Decode URL-safe string
    const decoded = decodeURIComponent(value);

    const bytes = CryptoJS.AES.decrypt(decoded, crptoSecretKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    return plaintext; // original string
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
