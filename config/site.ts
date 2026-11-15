export const site = {
  brand: "Kalm",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /** public contact email — shown on the contact & legal pages when filled in */
  contactEmail: "",
  /** company details for legal pages — empty fields are simply not shown */
  legalEntity: {
    name: "MB Kalm",
    companyCode: "", // įmonės kodas
    address: "",
    vatNo: "", // PVM mokėtojo kodas (leave empty if not a VAT payer)
  },
  /** how long order requests that did not lead to a sale are kept (privacy policy) */
  dataRetentionDays: 365,
};
