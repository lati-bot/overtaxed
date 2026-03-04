/**
 * Cook County Township Appeal Calendar Data
 * All 38 townships with triad assignment and appeal window info.
 * Sources:
 * - cookcountyassessoril.gov/assessment-calendar-and-deadlines
 * - cookcountyboardofreview.com (2025 schedule PDF)
 * - appeals.cookcountyboardofreview.com
 */

export type Triad = 'North' | 'City' | 'South/West';

export interface TownshipCalendar {
  name: string;
  triad: Triad;
  /** Year this triad is reassessed in the current cycle */
  reassessmentYear: number;
  /** True if being reassessed in 2026 */
  isReassessmentYear2026: boolean;
}

// Triennial cycle:
// North suburbs: 2025, 2028, 2031...
// City of Chicago: 2024, 2027, 2030...
// South/West suburbs: 2023, 2026, 2029...

const NORTH_TOWNSHIPS = [
  'Barrington', 'Elk Grove', 'Evanston', 'Hanover', 'Leyden', 'Maine',
  'New Trier', 'Niles', 'Northfield', 'Norwood Park', 'Palatine', 'Proviso',
  'Schaumburg', 'Wheeling',
];

const CITY_TOWNSHIPS = [
  'Hyde Park', 'Jefferson', 'Lake', 'Lake View', 'North Chicago',
  'Rogers Park', 'South Chicago', 'West Chicago',
];

const SOUTH_WEST_TOWNSHIPS = [
  'Berwyn', 'Bloom', 'Bremen', 'Calumet', 'Cicero', 'Lemont', 'Lyons',
  'Oak Park', 'Orland', 'Palos', 'Rich', 'River Forest', 'Riverside',
  'Stickney', 'Thornton', 'Worth',
];

function buildTownships(names: string[], triad: Triad, reassessmentYear: number): TownshipCalendar[] {
  return names.map(name => ({
    name,
    triad,
    reassessmentYear,
    isReassessmentYear2026: reassessmentYear === 2026,
  }));
}

export const ALL_TOWNSHIPS: TownshipCalendar[] = [
  ...buildTownships(NORTH_TOWNSHIPS, 'North', 2025),
  ...buildTownships(CITY_TOWNSHIPS, 'City', 2024),
  ...buildTownships(SOUTH_WEST_TOWNSHIPS, 'South/West', 2026),
].sort((a, b) => a.name.localeCompare(b.name));

export function getTownshipByName(name: string): TownshipCalendar | undefined {
  return ALL_TOWNSHIPS.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export function getTownshipsByTriad(triad: Triad): TownshipCalendar[] {
  return ALL_TOWNSHIPS.filter(t => t.triad === triad);
}

export interface AppealStage {
  stage: 'Assessor' | 'Board of Review';
  status: 'closed' | 'upcoming' | 'open';
  /** Human-readable description */
  description: string;
}

/**
 * Get current appeal status for a township (2026).
 * As of early 2026, all townships are closed. South/West will open ~spring 2026.
 */
export function getAppealStatus2026(township: TownshipCalendar): AppealStage[] {
  if (township.triad === 'South/West') {
    return [
      {
        stage: 'Assessor',
        status: 'upcoming',
        description: 'Opens ~30 days after reassessment notices mail (expected spring–summer 2026)',
      },
      {
        stage: 'Board of Review',
        status: 'upcoming',
        description: 'Opens after Assessor period closes (expected late summer–fall 2026)',
      },
    ];
  }
  // North and City — non-reassessment year, limited appeal windows
  return [
    {
      stage: 'Assessor',
      status: 'closed',
      description: township.triad === 'North' 
        ? 'Last reassessed 2025. Next reassessment 2028.' 
        : 'Last reassessed 2024. Next reassessment 2027.',
    },
    {
      stage: 'Board of Review',
      status: 'upcoming',
      description: 'A shorter appeal window may open later in 2026 (typically 2–4 weeks for non-reassessment townships)',
    },
  ];
}
