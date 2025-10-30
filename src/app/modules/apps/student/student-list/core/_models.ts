import { ID, Response } from "../../../../../../_metronic/helpers";

export interface Student {
  password: any;
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
  password: undefined,
};
