// src/types/index.ts

export type RoBJudgement = 'Low' | 'Some concerns' | 'Moderate' | 'Serious' | 'Critical' | 'NI' | 'NR';
export type StudyDesign = 'RCT' | 'TND' | 'Case-Control' | 'Nested Case-Control' | 'Retrospective Cohort' | 'TND+FMD';
export type RoBTool = 'RoB 2.0' | 'ROBINS-I';

export interface Study {
  id: string;
  author: string;
  year: number;
  country: string;
  countryFlag: string;
  design: StudyDesign;
  studyPeriod: string;
  setting: string;
  vaccine: string;
  comparator: string;
  followUp: string;
  nTotal: number | null;
  nVaccinated: number | null;
  nUnvaccinated: number | null;
  nCases: number | null;
  nControls: number | null;
  primaryVE: number | null;
  primaryVE_CI_lower: number | null;
  primaryVE_CI_upper: number | null;
  rob: RoBJudgement;
  robTool: RoBTool;
  synthesisNote?: string;
}

export interface VEEstimate {
  id: string;              // e.g. 'W05-01'
  studyId: string;
  estimateType: 'primary' | 'sensitivity' | 'waning' | 'subgroup';
  label: string;           // short display label
  subgroupType: 'overall' | 'age' | 'time' | 'dose' | 'serology' | 'pcr' | 'design' | 'other';
  ve: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  casesVaccinated: number | null;
  casesUnvaccinated: number | null;
  nVaccinated: number | null;
  nUnvaccinated: number | null;
  timeStart_months: number | null;
  timeEnd_months: number | null;
  timeSinceVaccLabel: string | null;
  ageGroup: string | null;
  adjusted: boolean;
  adjustmentVars: string | null;
  calculationMethod: string;
  caseDefinition: string;
  pageRef: string;
  isSensitivity: boolean;
  sensitivityNote?: string;
}

export interface WaningPoint {
  studyId: string;
  series: string;           // 'TND', 'FMD', 'PCR', etc.
  timeLabel: string;
  timeMidpoint_years: number;
  ve: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
}

export interface RoBDomain {
  studyId: string;
  tool: RoBTool;
  domainNumber: number;
  domainName: string;
  judgement: RoBJudgement;
  supportingText: string;
}
