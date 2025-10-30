import { FC, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import { KTCard, KTCardBody, KTSVG } from "../../../../_metronic/helpers";
import clsx from "clsx";
import { Modal } from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const COURSE_URL = `${API_URL}/courses`;

type Course = {
  id?: number;
  title: string;
  instructor: string;
  duration: string;
  price: number;
  createdAt?: string;
};

// --- Mock data ---
const mockCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    instructor: "John Smith",
    duration: "3 Months",
    price: 120,
    createdAt: "2025-01-01",
  },
  {
    id: 2,
    title: "Advanced React Development",
    instructor: "Jane Doe",
    duration: "2 Months",
    price: 180,
    createdAt: "2025-02-15",
  },
  {
    id: 3,
    title: "Fullstack with Node.js",
    instructor: "Michael Brown",
    duration: "4 Months",
    price: 250,
    createdAt: "2025-03-10",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    instructor: "Emily White",
    duration: "1.5 Months",
    price: 90,
    createdAt: "2025-04-05",
  },
  {
    id: 5,
    title: "Python for Data Science",
    instructor: "David Green",
    duration: "3 Months",
    price: 200,
    createdAt: "2025-05-20",
  },
];

const CoursePage: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<Course>({
    title: "",
    instructor: "",
    duration: "",
    price: 0,
  });

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(COURSE_URL);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCourses(res.data);
      } else {
        setCourses(mockCourses);
      }
    } catch {
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // --- CRUD handlers ---
  const handleSave = async () => {
    try {
      if (editingCourse?.id) {
        await axios.put(`${COURSE_URL}/${editingCourse.id}`, form);
      } else {
        await axios.post(COURSE_URL, form);
      }
      fetchCourses();
      handleClose();
    } catch (err) {
      console.warn("Mock save:", err);
      if (editingCourse?.id) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id ? { ...form, id: c.id } : c
          )
        );
      } else {
        setCourses((prev) => [...prev, { ...form, id: Date.now() }]);
      }
      handleClose();
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setForm(course);
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${COURSE_URL}/${id}`);
      fetchCourses();
    } catch {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClose = () => {
    setEditingCourse(null);
    setForm({ title: "", instructor: "", duration: "", price: 0 });
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Columns for React Table ---
  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Title", accessorKey: "title" },
      { header: "Instructor", accessorKey: "instructor" },
      { header: "Duration", accessorKey: "duration" },
      { header: "Price ($)", accessorKey: "price" },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="text-end">
            <button
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
              onClick={() => handleEdit(row.original)}
            >
              <KTSVG
                path="/media/icons/duotune/art/art005.svg"
                className="svg-icon-3"
              />
            </button>
            <button
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <KTSVG
                path="/media/icons/duotune/general/gen027.svg"
                className="svg-icon-3"
              />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // --- Filtering logic for search ---
  const filteredData = useMemo(() => {
    if (!search) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, courses]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="m-4 bg-white p-6 rounded shadow-sm">
      {/* Header with Search and Add button */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
        <h2 className="fw-bold text-dark mb-3">Courses</h2>
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <KTSVG
              path="/media/icons/duotune/general/gen021.svg"
              className="svg-icon-2 position-absolute top-50 translate-middle-y ms-3"
            />
            <input
              type="text"
              className="form-control form-control-solid ps-10 w-200px"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Course
          </button>
        </div>
      </div>

      {/* Table */}
      <KTCard>
        <KTCardBody className="py-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0"
                    >
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                {/* Table body with black text */}
                <tbody className="text-dark fw-semibold">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row: Row<Course>) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="text-center py-10">
                          No courses found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </KTCardBody>
      </KTCard>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form">
            <div className="row mb-5">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  className={clsx("form-control form-control-solid")}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Instructor</label>
                <input
                  className={clsx("form-control form-control-solid")}
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="Instructor name"
                />
              </div>
            </div>
            <div className="row mb-5">
              <div className="col-md-6">
                <label className="form-label">Duration</label>
                <input
                  className={clsx("form-control form-control-solid")}
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 Months"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className={clsx("form-control form-control-solid")}
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CoursePage;
