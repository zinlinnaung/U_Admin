import axios from "axios";
import { ID } from "../../../../../../_metronic/helpers";
import { Instructor, InstructorsQueryResponse, Role } from "./_models";

const API_URL = "https://mypadminapi.bitmyanmar.info/api";
const INSTRUCTOR_URL = `${API_URL}/instructors`;

// 1. Fetch all with pagination support for Metronic
const getInstructors = async (
  query: string
): Promise<InstructorsQueryResponse> => {
  const response = await axios.get(`${INSTRUCTOR_URL}?${query}`);

  // Metronic expects a specific Response format.
  // If your API returns a simple array, we wrap it:
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  return {
    data: data,
    payload: {
      pagination: {
        page: 1,
        items_per_page: 100, // Adjust based on your backend logic
        links: [],
      },
    },
  } as InstructorsQueryResponse;
};

// 2. Get Single
const getInstructorById = async (id: ID): Promise<Instructor | undefined> => {
  const response = await axios.get(`${INSTRUCTOR_URL}/${id}`);
  return response.data;
};

// 3. Create
const createInstructor = async (
  instructor: Instructor
): Promise<Instructor | undefined> => {
  // Payload: { userId, fullName, bio, roleIds }
  const response = await axios.post(INSTRUCTOR_URL, instructor);
  return response.data;
};
const getAllRoles = async (): Promise<Role[]> => {
  const response = await axios.get(`${API_URL}/roles`);
  return response.data;
};

// 4. Update
const updateInstructor = async (
  instructor: Instructor
): Promise<Instructor | undefined> => {
  const { id, ...payload } = instructor;
  const response = await axios.patch(`${INSTRUCTOR_URL}/${id}`, payload);
  return response.data;
};

// 5. Delete
const deleteInstructor = async (instructorId: ID): Promise<void> => {
  await axios.delete(`${INSTRUCTOR_URL}/${instructorId}`);
};

export {
  getInstructors,
  deleteInstructor,
  getInstructorById,
  getAllRoles,
  createInstructor,
  updateInstructor,
};
