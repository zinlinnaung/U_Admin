import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { Student, StudentsQueryResponse } from "./_models";

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const STUDENT_URL = `${API_URL}/student`;
const GET_STUDENTS_URL = `${API_URL}/students/query`;

// Mock data
let mockStudents: Student[] = [
  {
    id: "STU001" as unknown as ID,
    username: "alicej",
    password: "password123",
    email: "alice.johnson@student.edu",
    phone: "+959123456789",
    displayName: "Alice Johnson",
    region: "Yangon",
    township: "Sanchaung",
    country: "Myanmar",
    dobDay: "12",
    dobMonth: "05",
    dobYear: "2001",
    gender: "Female",
    platform: "Facebook",
    specialNeeds: false,
    acceptedTerms: true,
  },
  {
    id: "STU002" as unknown as ID,
    username: "bobsmith",
    password: "password123",
    email: "bob.smith@student.edu",
    phone: "+959987654321",
    displayName: "Bob Smith",
    region: "Mandalay",
    township: "Chan Aye Thar San",
    country: "Myanmar",
    dobDay: "03",
    dobMonth: "09",
    dobYear: "2000",
    gender: "Male",
    platform: "TikTok",
    specialNeeds: false,
    acceptedTerms: true,
  },
];

const getStudents = (query: string): Promise<StudentsQueryResponse> => {
  console.log("🔥 getStudents - total:", mockStudents.length);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [...mockStudents],
        payload: {
          pagination: {
            page: 1,
            items_per_page: 10,
            links: [
              {
                label: "&laquo; Previous",
                page: null,
                active: false,
                url: null,
              },
              { label: "1", page: 1, active: true, url: null },
              { label: "Next &raquo;", page: null, active: false, url: null },
            ],
          },
        },
      } as StudentsQueryResponse);
    }, 500);
  });
};

const getStudentById = (id: ID): Promise<Student | undefined> => {
  console.log("🔥 getStudentById:", id);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudents.find((stu) => stu.id === id));
    }, 300);
  });
};

const createStudent = (student: Student): Promise<Student | undefined> => {
  console.log("🔥 createStudent:", student);

  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudent: Student = {
        ...student,
        id: `STU${String(mockStudents.length + 1).padStart(
          3,
          "0"
        )}` as unknown as ID,
      };

      mockStudents.push(newStudent);
      console.log("✅ Created! Total now:", mockStudents.length);

      resolve(newStudent);
    }, 500);
  });
};

const updateStudent = (student: Student): Promise<Student | undefined> => {
  console.log("🔥 updateStudent:", student);

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudents.findIndex((stu) => stu.id === student.id);
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...student };
        resolve(mockStudents[index]);
        return;
      }
      resolve(undefined);
    }, 500);
  });
};

const deleteStudent = (studentId: ID): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockStudents = mockStudents.filter((stu) => stu.id !== studentId);
      resolve();
    }, 500);
  });
};

const deleteSelectedStudents = (studentIds: Array<ID>): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockStudents = mockStudents.filter((stu) => !studentIds.includes(stu.id));
      resolve();
    }, 500);
  });
};

export {
  getStudents,
  deleteStudent,
  deleteSelectedStudents,
  getStudentById,
  createStudent,
  updateStudent,
};
