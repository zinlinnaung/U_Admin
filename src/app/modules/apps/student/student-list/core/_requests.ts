import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { Student, StudentsQueryResponse } from "./_models";

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const STUDENT_URL = `${API_URL}/student`;
const GET_STUDENTS_URL = `${API_URL}/students/query`;

// Mock data - mutable so we can add/edit/delete
let mockStudents: Student[] = [
  {
    id: "STU001" as unknown as ID,
    name: "Alice Johnson",
    email: "alice.johnson@student.edu",
    enrollmentDate: "2023-09-01",
    courseCount: 5,
    gpa: 3.8,
    status: "Active",
    lastLogin: "2025-10-20T14:30:00",
  },
  {
    id: "STU002" as unknown as ID,
    name: "Bob Smith",
    email: "bob.smith@student.edu",
    enrollmentDate: "2023-09-01",
    courseCount: 4,
    gpa: 3.5,
    status: "Active",
    lastLogin: "2025-10-20T10:15:00",
  },
  {
    id: "STU003" as unknown as ID,
    name: "Carol White",
    email: "carol.white@student.edu",
    enrollmentDate: "2024-01-15",
    courseCount: 3,
    gpa: 3.9,
    status: "Active",
    lastLogin: "2025-10-19T16:45:00",
  },
  {
    id: "STU004" as unknown as ID,
    name: "David Brown",
    email: "david.brown@student.edu",
    enrollmentDate: "2024-01-15",
    courseCount: 6,
    gpa: 3.2,
    status: "Active",
    lastLogin: "2025-10-19T09:20:00",
  },
  {
    id: "STU005" as unknown as ID,
    name: "Emma Davis",
    email: "emma.davis@student.edu",
    enrollmentDate: "2022-09-01",
    courseCount: 8,
    gpa: 4.0,
    status: "Active",
    lastLogin: "2025-10-18T13:00:00",
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
      const student = mockStudents.find((stu) => stu.id === id);
      resolve(student);
    }, 300);
  });
};

const createStudent = (student: Student): Promise<Student | undefined> => {
  console.log("🔥 createStudent:", student);

  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudent = {
        ...student,
        id: `STU${String(mockStudents.length + 1).padStart(
          3,
          "0"
        )}` as unknown as ID,
        enrollmentDate: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString(),
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
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

const deleteStudent = (studentId: ID): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockStudents.findIndex((stu) => stu.id === studentId);
      if (index !== -1) {
        mockStudents.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const deleteSelectedStudents = (studentIds: Array<ID>): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      studentIds.forEach((id) => {
        const index = mockStudents.findIndex((stu) => stu.id === id);
        if (index !== -1) {
          mockStudents.splice(index, 1);
        }
      });
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
