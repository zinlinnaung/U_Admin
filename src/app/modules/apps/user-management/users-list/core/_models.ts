import { ID, Response } from "../../../../../../_metronic/helpers";

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Instructor {
  id?: ID;
  userId?: string; // Needed for creation
  fullName?: string; // Real field from backend
  bio?: string; // Real field from backend
  user?: User; // From include in Prisma
  roles?: Role[]; // From include in Prisma
  roleIds?: string[]; // Needed for update/create
  // Optional mock fields for UI compatibility
  courseCount?: number;
  enrollmentCount?: number;
}

export type InstructorsQueryResponse = Response<Array<Instructor>>;

export const initialInstructor: Instructor = {
  fullName: "",
  userId: "",
  bio: "",
  roleIds: [],
};
