export const site = {
  brand: "Kalm",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /** public contact email — shown on the contact & legal pages when filled in */
  contactEmail: "",
  /** public contact phone — shown on the contact page as a tap-to-call link */
  contactPhone: "+370 626 26210",
  /** company details for legal pages — empty fields are simply not shown */
  legalEntity: {
    name: "MB Kalm",
    companyCode: "", // įmonės kodas
    address: "",
    vatNo: "", // PVM mokėtojo kodas (leave empty if not a VAT payer)
  },
  /** where order notifications are sent (ORDER_NOTIFICATION_EMAIL overrides it) */
  orderEmail: "vladefimoov@gmail.com",
  /** how long order requests that did not lead to a sale are kept (privacy policy) */
  dataRetentionDays: 365,
};
