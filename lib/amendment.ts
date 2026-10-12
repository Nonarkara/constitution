export type VoteInput = {
  house: number;
  senate: number;
  totalYes: number;
  senateYes: number;
  eligibleMPs: number;
  eligibleYes: number;
};
export function amendmentThresholds(
  house: number,
  senate: number,
  eligibleMPs: number,
) {
  if (
    ![house, senate, eligibleMPs].every(Number.isInteger) ||
    house < 1 ||
    house > 500 ||
    senate < 1 ||
    senate > 200 ||
    eligibleMPs < 0 ||
    eligibleMPs > house
  )
    throw new Error("Invalid existing membership");
  return {
    proposalMPs: Math.ceil(house / 5),
    proposalJoint: Math.ceil((house + senate) / 5),
    first: Math.ceil((house + senate) / 2),
    final: Math.floor((house + senate) / 2) + 1,
    senate: Math.ceil(senate / 3),
    eligible: Math.ceil(eligibleMPs / 5),
  };
}
export function assessAmendmentVotes(v: VoteInput) {
  const thresholds = amendmentThresholds(v.house, v.senate, v.eligibleMPs);
  if (
    ![v.totalYes, v.senateYes, v.eligibleYes].every(Number.isInteger) ||
    v.totalYes < 0 ||
    v.totalYes > v.house + v.senate ||
    v.senateYes < 0 ||
    v.senateYes > v.senate ||
    v.eligibleYes < 0 ||
    v.eligibleYes > v.eligibleMPs ||
    v.senateYes + v.eligibleYes > v.totalYes ||
    v.totalYes - v.senateYes > v.house ||
    v.totalYes - v.senateYes - v.eligibleYes > v.house - v.eligibleMPs
  )
    return { valid: false, thresholds, first: false, final: false };
  return {
    valid: true,
    thresholds,
    first: v.totalYes >= thresholds.first && v.senateYes >= thresholds.senate,
    final:
      v.totalYes >= thresholds.final &&
      v.senateYes >= thresholds.senate &&
      v.eligibleYes >= thresholds.eligible,
  };
}
export type AmendmentChange =
  | "chapter1"
  | "chapter2"
  | "chapter15"
  | "officeEligibility"
  | "courtPowers"
  | "preventCourtDuties"
  | "other";
export function needsReferendum(changes: AmendmentChange[]) {
  return changes.some((change) => change !== "other");
}
export const REFLECTION_KEY = "constitution-amendment-reflection-v1";
export type Reflection = {
  version: 1;
  savedAt: string;
  choice: "yes" | "no" | "unsure";
  proposal: string;
  benefit: string;
  cost: string;
  evidence: string;
};
export function parseReflection(value: unknown): Reflection | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Reflection;
  if (
    v.version !== 1 ||
    !["yes", "no", "unsure"].includes(v.choice) ||
    !Number.isFinite(Date.parse(v.savedAt))
  )
    return null;
  for (const field of ["proposal", "benefit", "cost", "evidence"] as const)
    if (typeof v[field] !== "string" || v[field].length > 3000) return null;
  return {
    version: 1,
    savedAt: v.savedAt,
    choice: v.choice,
    proposal: v.proposal,
    benefit: v.benefit,
    cost: v.cost,
    evidence: v.evidence,
  };
}
