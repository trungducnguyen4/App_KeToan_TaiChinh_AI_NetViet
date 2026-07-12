export const AppRole = {
  Admin: "admin",
  Accountant: "accountant",
  ChiefAccountant: "chief_accountant",
  Director: "director",
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];
