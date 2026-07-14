import type { NextApiRequest, NextApiResponse } from "next";
import { activeAccountingAccounts } from "../../../../lib/accounting-accounts";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    accounts: activeAccountingAccounts,
    total: activeAccountingAccounts.length,
    source: "netviet-accounting-demo",
  });
}
