import { ID, Response } from "../../../../../../_metronic/helpers";

export interface Instructor {
  id?: ID;
  name?: string;
  email?: string;
  password?: string;
  courseCount?: number;
  enrollmentCount?: number;
  lastLogin?: string;
}

export type InstructorsQueryResponse = Response<Array<Instructor>>;

export const initialInstructor: Instructor = {
  id: undefined,
  name: "",
  email: "",
  password: "",
  courseCount: 0,
  enrollmentCount: 0,
  lastLogin: "",
};

export interface Student {
  id?: ID;
  name?: string;
  email?: string;
  enrollmentDate?: string;
  courseCount?: number;
  gpa?: number;
  status?: "Active" | "Inactive" | "Graduated";
  lastLogin?: string;
}

export type StudentsQueryResponse = Response<Array<Student>>;

export const initialStudent: Student = {
  id: undefined,
  name: "",
  email: "",
  enrollmentDate: "",
  courseCount: 0,
  gpa: 0,
  status: "Active",
  lastLogin: "",
};
