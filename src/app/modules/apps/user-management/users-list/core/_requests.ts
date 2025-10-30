import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { Instructor, InstructorsQueryResponse } from "./_models";

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const INSTRUCTOR_URL = `${API_URL}/instructor`;
const GET_INSTRUCTORS_URL = `${API_URL}/instructors/query`;

// Mock data - mutable so we can add/edit/delete
let mockInstructors: Instructor[] = [
  {
    id: "INS001" as unknown as ID,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    password: "hashed_password",
    courseCount: 5,
    enrollmentCount: 234,
    lastLogin: "2025-10-18T09:30:00",
  },
  {
    id: "INS002" as unknown as ID,
    name: "Prof. Michael Chen",
    email: "m.chen@university.edu",
    password: "hashed_password",
    courseCount: 8,
    enrollmentCount: 456,
    lastLogin: "2025-10-18T08:15:00",
  },
  {
    id: "INS003" as unknown as ID,
    name: "Dr. Emily Rodriguez",
    email: "emily.r@university.edu",
    password: "hashed_password",
    courseCount: 3,
    enrollmentCount: 145,
    lastLogin: "2025-10-17T16:45:00",
  },
];

const getInstructors = (query: string): Promise<InstructorsQueryResponse> => {
  console.log("🔥 getInstructors - total:", mockInstructors.length);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [...mockInstructors],
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
      } as InstructorsQueryResponse);
    }, 500);
  });
};

const getInstructorById = (id: ID): Promise<Instructor | undefined> => {
  console.log("🔥 getInstructorById:", id);

  return new Promise((resolve) => {
    setTimeout(() => {
      const instructor = mockInstructors.find((inst) => inst.id === id);
      resolve(instructor);
    }, 300);
  });
};

const createInstructor = (
  instructor: Instructor
): Promise<Instructor | undefined> => {
  console.log("🔥 createInstructor:", instructor);

  return new Promise((resolve) => {
    setTimeout(() => {
      const newInstructor = {
        ...instructor,
        id: `INS${String(mockInstructors.length + 1).padStart(
          3,
          "0"
        )}` as unknown as ID,
        courseCount: 0,
        enrollmentCount: 0,
        lastLogin: new Date().toISOString(),
      };
      mockInstructors.push(newInstructor);
      console.log("✅ Created! Total now:", mockInstructors.length);
      resolve(newInstructor);
    }, 500);
  });
};

const updateInstructor = (
  instructor: Instructor
): Promise<Instructor | undefined> => {
  console.log("🔥 updateInstructor:", instructor);

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockInstructors.findIndex(
        (inst) => inst.id === instructor.id
      );
      if (index !== -1) {
        mockInstructors[index] = { ...mockInstructors[index], ...instructor };
        resolve(mockInstructors[index]);
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

const deleteInstructor = (instructorId: ID): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockInstructors.findIndex(
        (inst) => inst.id === instructorId
      );
      if (index !== -1) {
        mockInstructors.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const deleteSelectedInstructors = (instructorIds: Array<ID>): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      instructorIds.forEach((id) => {
        const index = mockInstructors.findIndex((inst) => inst.id === id);
        if (index !== -1) {
          mockInstructors.splice(index, 1);
        }
      });
      resolve();
    }, 500);
  });
};

export {
  getInstructors,
  deleteInstructor,
  deleteSelectedInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
};
