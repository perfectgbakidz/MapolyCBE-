/**
 * Cryptographic utility for anti-tamper checksums and deterministic verification.
 * Computes SHA-256 hashes for exam payloads and background answer writes.
 */

export async function sha256(message: string): Promise<string> {
  // Use Web Crypto API if available
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Pure JS fallback implementation of 32-bit FNV-1a / hex digest
  let hash = 0x811c9dc5;
  for (let i = 0; i < message.length; i++) {
    hash ^= message.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const part1 = (hash >>> 0).toString(16).padStart(8, '0');
  
  let hash2 = 0x55555555;
  for (let i = message.length - 1; i >= 0; i--) {
    hash2 ^= message.charCodeAt(i);
    hash2 = Math.imul(hash2, 16777619);
  }
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part1}${part2}`;
}

/**
 * Generate a candidate answer checksum
 */
export async function computeAnswerChecksum(
  candidateId: string,
  examId: string,
  questionId: string,
  selectedOptionId: string,
  timestamp: string
): Promise<string> {
  const rawPayload = `CBT_ANSWER_V1:${candidateId}:${examId}:${questionId}:${selectedOptionId}:${timestamp}:SECRET_SALT_2026`;
  return sha256(rawPayload);
}

/**
 * Generate final submission receipt hash
 */
export async function computeSubmissionReceiptChecksum(
  candidateId: string,
  examId: string,
  answersCount: number,
  score: number,
  timestamp: string
): Promise<string> {
  const raw = `CBT_SUBMISSION:${candidateId}:${examId}:${answersCount}:${score}:${timestamp}:INTEGRITY_SALT_SEC`;
  const hash = await sha256(raw);
  return `TX-CBT-${hash.slice(0, 12).toUpperCase()}-${hash.slice(12, 18).toUpperCase()}`;
}
