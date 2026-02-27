/**
 * Cook County Township Reassessment Data
 * Used to determine reassessment year status and savings multiplier.
 */

export type ReassessmentDistrict = 'North Suburbs' | 'City of Chicago' | 'South/West Suburbs';

interface TownshipReassessmentInfo {
  district: ReassessmentDistrict;
  reassessmentYear: number;
  nextReassessmentYear: number;
}

const NORTH_SUBURBS: string[] = [
  'Barrington', 'Elk Grove', 'Evanston', 'Hanover', 'Leyden', 'Maine',
  'New Trier', 'Niles', 'Northfield', 'Norwood Park', 'Palatine', 'Proviso',
  'Schaumburg', 'Wheeling',
];

const CHICAGO_TOWNSHIPS: string[] = [
  'Chicago', 'Hyde Park', 'Jefferson', 'Lake', 'Lake View', 'North Chicago',
  'Rogers Park', 'South Chicago', 'West Chicago',
];

const SOUTH_WEST_SUBURBS: string[] = [
  'Berwyn', 'Bloom', 'Bremen', 'Calumet', 'Cicero', 'Lemont', 'Lyons',
  'Oak Park', 'Orland', 'Palos', 'Rich', 'River Forest', 'Riverside',
  'Stickney', 'Thornton', 'Worth',
];

const townshipMap = new Map<string, TownshipReassessmentInfo>();

for (const t of NORTH_SUBURBS) {
  townshipMap.set(t.toLowerCase(), { district: 'North Suburbs', reassessmentYear: 2025, nextReassessmentYear: 2028 });
}
for (const t of CHICAGO_TOWNSHIPS) {
  townshipMap.set(t.toLowerCase(), { district: 'City of Chicago', reassessmentYear: 2024, nextReassessmentYear: 2027 });
}
for (const t of SOUTH_WEST_SUBURBS) {
  townshipMap.set(t.toLowerCase(), { district: 'South/West Suburbs', reassessmentYear: 2026, nextReassessmentYear: 2029 });
}

export interface ReassessmentStatus {
  district: ReassessmentDistrict;
  reassessmentYear: number;
  nextReassessmentYear: number;
  isReassessmentYear: boolean;
  yearsUntilNext: number;
  /** Savings multiplier: 3 if reassessment year, 2 if next year, 1 if 2+ years away */
  savingsMultiplier: number;
  message: string;
}

export function getReassessmentStatus(township: string, currentYear: number = new Date().getFullYear()): ReassessmentStatus | null {
  const info = townshipMap.get(township.toLowerCase());
  if (!info) return null;

  const isReassessmentYear = currentYear === info.reassessmentYear;
  const yearsUntilNext = info.nextReassessmentYear - currentYear;
  
  let savingsMultiplier: number;
  if (isReassessmentYear) {
    savingsMultiplier = 3;
  } else if (yearsUntilNext <= 1) {
    savingsMultiplier = 1;
  } else {
    savingsMultiplier = yearsUntilNext > 0 ? Math.min(yearsUntilNext, 3) : 1;
  }

  let message: string;
  if (isReassessmentYear) {
    message = "Your assessment just changed — this is the best time to appeal. A win now locks in savings for 3 years.";
  } else if (yearsUntilNext <= 1) {
    message = "Even in an off-year, reductions are possible, especially at the Board of Review.";
  } else {
    message = `Even in an off-year, reductions are possible, especially at the Board of Review. Your next reassessment is in ${info.nextReassessmentYear}.`;
  }

  return {
    district: info.district,
    reassessmentYear: info.reassessmentYear,
    nextReassessmentYear: info.nextReassessmentYear,
    isReassessmentYear,
    yearsUntilNext,
    savingsMultiplier,
    message,
  };
}
