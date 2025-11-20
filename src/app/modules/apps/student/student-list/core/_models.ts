import { ID, Response } from "../../../../../../_metronic/helpers";

export interface Student {
  id?: ID;

  // Main fields from the registration screen
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  displayName?: string;

  // Location
  region?: string;
  township?: string;
  country?: string;

  // Date of birth
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;

  gender?: string;

  // Where they heard about the platform
  platform?: "Facebook" | "TikTok" | "YouTube" | "Other";

  platformOtherText?: string;

  // Special needs
  specialNeeds?: boolean;

  // Terms of service
  acceptedTerms?: boolean;
}

export type StudentsQueryResponse = Response<Array<Student>>;

export const initialStudent: Student = {
  id: undefined,

  username: "",
  password: "",
  email: "",
  phone: "",
  displayName: "",

  region: "",
  township: "",
  country: "",

  dobDay: "",
  dobMonth: "",
  dobYear: "",

  gender: "",

  platform: "Other",
  platformOtherText: "",

  specialNeeds: false,
  acceptedTerms: false,
};
