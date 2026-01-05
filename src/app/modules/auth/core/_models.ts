export interface AuthModel {
  api_token: string;
  refreshToken?: string;
}

export interface Role {
  id: string;
  name: string; // "Admin" or "Instructor"
  description?: string;
}

export interface InstructorModel {
  id: string;
  fullName: string;
  bio?: string;
  roles: Role[];
}

export interface UserModel {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  fullname?: string;
  phone?: string;
  roles?: Array<number>; // Keep for compatibility
  instructor?: InstructorModel; // Added for your Prisma relation
  pic?: string;
}
