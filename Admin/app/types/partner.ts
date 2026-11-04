export type PartnerType = "individual" | "business";

export interface PartnerImage {
  url: string;
  publicId?: string;
}

export interface Partner {
  _id: string;
  name: string;
  partnerType: PartnerType;
  isActive: boolean;
  email: string;
  phone: string;
  businessAddress: string;
  profession: string;
  description?: string;
  website?: string;
  socialLinks: string[];
  partnerImage?: PartnerImage;
  // UI helper fields added by the hook
  logo?: string; 
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}