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
  maps: {
    shortUrl: "https://maps.app.goo.gl/Pzm81wcCUTisDbbU6",
    embedUrl:
      "https://maps.google.com/maps?q=35.8757591,14.4958324&hl=en&z=17&output=embed",
    latitude: 35.8757591,
    longitude: 14.4958324,
    placeName: "Joseph Bezzina Co. Ltd.",
  },
  contact: {
    phone1: "+356 2122 6647",
    phone2: "+356 2122 6648",
    fax: "+356 2124 3085",
    email: "jason@jbezzina.com",
    website: "https://jbezzina.com",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+356 7757 6721",
  },
  social: {
    facebook: "https://www.facebook.com/JosephBezzina.Co.Ltd/",
    linkedin: "",
    instagram: "",
  },
  seo: {
    title: "Joseph Bezzina & Co. Ltd",
    description: "Industrial, Marine & Engineering Supplies in Malta since 1969.",
  },
  logoUrl: "/bezzina-logo.png",
  watermarkUrl: "/bezzina-watermark.png",
  invoice: {
    tagline: "MARINE SUPPLIES",
    vatNumber: "MT 1234 5678",
    eoriNumber: "MT000000000",
    accountsEmail: "accounts@jbezzina.com",
    vatRate: 0.18,
    currency: "EUR",
  },
};
