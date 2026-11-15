export const site = {
  brand: "Keyline",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: "hello@example.com", // TODO: replace with the public contact address
  /** company details for legal pages — fill in before launch */
  legalEntity: {
    name: "[Company name]",
    address: "[Registered address]",
    registrationNo: "[Registration number]",
    vatNo: "[VAT number]",
  },
  /** how long test-order data is kept (shown in privacy policy) */
  dataRetentionDays: 90,
};
