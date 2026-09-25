import { describe, expect, it } from 'bun:test';

function calculateGrade(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

function calculateFinalScore(scores: {
  discipline: number;
  responsibility: number;
  teamwork: number;
  communication: number;
  technicalSkill: number;
  initiative: number;
}): { finalScore: number; grade: string } {
  const sum =
    scores.discipline +
    scores.responsibility +
    scores.teamwork +
    scores.communication +
    scores.technicalSkill +
    scores.initiative;
  const finalScore = Math.round((sum / 6) * 100) / 100;
  const grade = calculateGrade(finalScore);
  return { finalScore, grade };
}

describe('Evaluation Service & Scoring Formula (TASK-4.6 / TASK-5.1)', () => {
  it('should accurately calculate grade A for high performers (>= 85)', () => {
    const scores = {
      discipline: 90,
      responsibility: 95,
      teamwork: 88,
      communication: 92,
      technicalSkill: 90,
      initiative: 85,
    };
    const result = calculateFinalScore(scores);
    expect(result.finalScore).toBe(90);
    expect(result.grade).toBe('A');
  });

  it('should accurately calculate grade B for scores between 75 and 84.99', () => {
    const scores = {
      discipline: 80,
      responsibility: 75,
      teamwork: 78,
      communication: 82,
      technicalSkill: 76,
      initiative: 77,
    };
    const result = calculateFinalScore(scores);
    expect(result.finalScore).toBe(78);
    expect(result.grade).toBe('B');
  });

  it('should accurately calculate grade C for scores between 65 and 74.99', () => {
    const scores = {
      discipline: 70,
      responsibility: 65,
      teamwork: 68,
      communication: 72,
      technicalSkill: 66,
      initiative: 67,
    };
    const result = calculateFinalScore(scores);
    expect(result.finalScore).toBe(68);
    expect(result.grade).toBe('C');
  });

  it('should accurately calculate grade D for scores between 50 and 64.99', () => {
    const scores = {
      discipline: 55,
      responsibility: 50,
      teamwork: 58,
      communication: 60,
      technicalSkill: 52,
      initiative: 55,
    };
    const result = calculateFinalScore(scores);
    expect(result.finalScore).toBe(55);
    expect(result.grade).toBe('D');
  });

  it('should accurately calculate grade E for scores below 50', () => {
    const scores = {
      discipline: 40,
      responsibility: 45,
      teamwork: 30,
      communication: 40,
      technicalSkill: 42,
      initiative: 35,
    };
    const result = calculateFinalScore(scores);
    expect(result.finalScore).toBe(38.67);
    expect(result.grade).toBe('E');
  });

  it('should handle boundary values properly', () => {
    expect(calculateGrade(85.0)).toBe('A');
    expect(calculateGrade(84.99)).toBe('B');
    expect(calculateGrade(75.0)).toBe('B');
    expect(calculateGrade(74.99)).toBe('C');
    expect(calculateGrade(65.0)).toBe('C');
    expect(calculateGrade(64.99)).toBe('D');
    expect(calculateGrade(50.0)).toBe('D');
    expect(calculateGrade(49.99)).toBe('E');
  });
});
