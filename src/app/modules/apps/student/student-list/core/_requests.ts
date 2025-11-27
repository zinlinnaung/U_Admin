import axios from "axios";
import { ID } from "../../../../../../_metronic/helpers";
import { Student, StudentsQueryResponse } from "./_models";

const API_URL = "https://mypadminapi.bitmyanmar.info/api/users";

// Helper to convert Student to API body (send proper ISO string)
// Helper to convert Student to API body (Prisma-safe)
const mapStudentToApiBody = (student: Student) => {
  // Build ISO date or null
  const dateOfBirth =
    student.dobYear && student.dobMonth && student.dobDay
      ? new Date(
          Number(student.dobYear),
          Number(student.dobMonth) - 1, // JS months are 0-based
          Number(student.dobDay)
        ).toISOString()
      : null;

  // Ensure firstName and lastName are safe
  const [firstName = "", lastName = ""] = student.displayName
    ? student.displayName.split(" ")
    : ["", ""];

  return {
    email: student.email || "",
    username: student.username || "",
    phone: student.phone || "",
    password: student.password || undefined, // undefined will skip Prisma update if empty
    firstName,
    lastName,
    country: student.country || "",
    city: student.region || "",
    township: student.township || "",
    dateOfBirth, // ISO string or null
    gender: student.gender || "",
    feedback: "", // optional
    isActive: true,
  };
};

// Helper to parse API date to dobDay/dobMonth/dobYear
const parseDateOfBirth = (dob?: string) => {
  if (!dob) return { dobDay: "", dobMonth: "", dobYear: "" };
  const date = new Date(dob);
  return {
    dobDay: String(date.getDate()).padStart(2, "0"),
    dobMonth: String(date.getMonth() + 1).padStart(2, "0"),
    dobYear: String(date.getFullYear()),
  };
};

// Get all students
const getStudents = async (): Promise<StudentsQueryResponse> => {
  const response = await axios.get(API_URL);
  const data: Student[] = response.data.map((user: any) => ({
    id: user.id as ID,
    username: user.username,
    email: user.email,
    phone: user.phone,
    displayName: `${user.firstName} ${user.lastName}`,
    region: user.city,
    township: user.township,
    country: user.country,
    ...parseDateOfBirth(user.dateOfBirth),
    gender: user.gender,
    acceptedTerms: user.isActive,
  }));

  return {
    data,
    payload: {
      pagination: {
        page: 1,
        items_per_page: data.length as 10 | 30 | 50 | 100,
        links: [],
      },
    },
  };
};

// Get student by ID
const getStudentById = async (id: ID): Promise<Student | undefined> => {
  const response = await axios.get(`${API_URL}/${id}`);
  const user = response.data;
  if (!user) return undefined;

  return {
    id: user.id as ID,
    username: user.username,
    email: user.email,
    phone: user.phone,
    displayName: `${user.firstName} ${user.lastName}`,
    region: user.city,
    township: user.township,
    country: user.country,
    ...parseDateOfBirth(user.dateOfBirth),
    gender: user.gender,
    acceptedTerms: user.isActive,
  };
};

// Create a student
const createStudent = async (
  student: Student
): Promise<Student | undefined> => {
  const body = mapStudentToApiBody(student);
  const response = await axios.post(API_URL, body);
  const user = response.data;

  return {
    id: user.id as ID,
    username: user.username,
    email: user.email,
    phone: user.phone,
    displayName: `${user.firstName} ${user.lastName}`,
    region: user.city,
    township: user.township,
    country: user.country,
    ...parseDateOfBirth(user.dateOfBirth),
    gender: user.gender,
    acceptedTerms: user.isActive,
  };
};

// Update a student
const updateStudent = async (
  student: Student
): Promise<Student | undefined> => {
  const body = mapStudentToApiBody(student);
  const response = await axios.patch(`${API_URL}/${student.id}`, body);
  const user = response.data;

  return {
    id: user.id as ID,
    username: user.username,
    email: user.email,
    phone: user.phone,
    displayName: `${user.firstName} ${user.lastName}`,
    region: user.city,
    township: user.township,
    country: user.country,
    ...parseDateOfBirth(user.dateOfBirth),
    gender: user.gender,
    acceptedTerms: user.isActive,
  };
};

// Delete student
const deleteStudent = async (id: ID): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
