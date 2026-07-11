export type QuoteCartItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number | null;
  image_url: string | null;
};

export type QuoteRequest = {
  id: string;
  reference: string;
  status: string;
  notes: string | null;
  channel: string;
  created_at: string;
  items?: QuoteRequestItem[];
};

export type QuoteRequestItem = {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  quantity: number;
  unit: string;
  unit_price: number | null;
};

export type Vacancy = {
  id: string;
  title: string;
  department: string;
  location: string;
  short_description: string;
  description: string;
  requirements: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

/** @deprecated Use Vacancy */
export type JobPosting = Vacancy;

export type JobApplicationInput = {
  vacancyId?: string;
  /** @deprecated Use vacancyId */
  jobPostingId?: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  coverLetter?: string;
};
