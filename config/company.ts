export const company = {
  name: "Joseph Bezzina & Co. Ltd",
  shortName: "Bezzina",
  tagline: "Malta's Trusted Marine & Industrial Supply Partner Since 1969",
  founded: 1969,
  registrationNumber: "C 1486",
  address: {
    line1: "5/6 Triq Aldo Moro",
    city: "Il-Marsa",
    postalCode: "MRS 9065",
    country: "Malta",
  },
  contact: {
    phone1: "+356 2122 6647",
    phone2: "+356 2122 6648",
    fax: "+356 2124 3085",
    email: "jason@jbezzina.com",
    website: "https://jbezzina.com",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+356 2122 6647",
  },
  social: {
    facebook: "https://facebook.com/JosephBezzina.Co.Ltd",
    linkedin: "",
    instagram: "",
  },
  seo: {
    title: "Joseph Bezzina & Co. Ltd",
    description: "Industrial, Marine & Engineering Supplies in Malta since 1969.",
  },
};
