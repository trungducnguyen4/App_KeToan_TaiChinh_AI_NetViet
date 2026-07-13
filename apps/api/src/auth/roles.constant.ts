export const AppRole = {
  Accountant: "accountant",
  ChiefAccountant: "chief_accountant",
  Director: "director",
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];

export const SYSTEM_ROLES = [
  {
    code: AppRole.Director,
    name: "Giám đốc",
  },
  {
    code: AppRole.ChiefAccountant,
    name: "Kế toán trưởng",
  },
  {
    code: AppRole.Accountant,
    name: "Kế toán viên",
  },
] as const;
