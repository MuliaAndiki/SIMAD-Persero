/** Rata-rata skor (1 desimal), sama seperti finalScore di form evaluasi. */
export function calcFinalScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + (Number(s) || 0), 0);
  return Number((sum / scores.length).toFixed(1));
}

/** Huruf mutu: A>=85 B>=75 C>=65 D>=50 else E. */
export function scoreToGrade(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}
