import { FC, useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  Row,
  SortingState,
} from "@tanstack/react-table";
import { KTCard, KTCardBody, KTSVG } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CourseActionsDropdown } from "./CourseActionsDropdown";
import { Editor } from "@tinymce/tinymce-react";

// ----------------------
// TYPES
// ----------------------
type Course = {
  id?: number;
  fullName: string;
  shortName: string;
  category: string;
  overview?: string;
  image?: string;
  format?: string;
  announcements?: number;
  showGradebook?: boolean;
  showReports?: boolean;
  showDates?: boolean;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ----------------------
// MOCK DATA
// ----------------------
const mockCourses: Course[] = [
  {
    id: 1,
    fullName: "Introduction to Digital Literacy",
    shortName: "DIGLIT101",
    category: "Digital Literacy",
    overview: "<p>This course introduces basic digital skills.</p>",
    format: "Custom sections",
    announcements: 5,
    showGradebook: true,
    showReports: false,
    showDates: true,
    summary: "A beginner-friendly introduction to digital skills.",
    createdAt: "2024-09-01",
    updatedAt: "2024-09-05",
  },
  {
    id: 2,
    fullName: "Web Development Fundamentals",
    shortName: "WEBDEV101",
    category: "Web Development",
    overview: "<p>Learn the basics of HTML, CSS, and JavaScript.</p>",
    format: "Custom sections",
    announcements: 5,
    showGradebook: true,
    showReports: false,
    showDates: true,
    summary: "Build and style your first web pages.",
    createdAt: "2024-09-10",
    updatedAt: "2024-09-12",
  },
  {
    id: 3,
    fullName: "Advanced React Techniques",
    shortName: "REACT301",
    category: "Frontend",
    overview: "<p>Dive deep into React hooks, context, and performance.</p>",
    format: "Custom sections",
    announcements: 5,
    showGradebook: true,
    showReports: true,
    showDates: true,
    summary: "Master React with hands-on advanced concepts.",
    createdAt: "2024-09-15",
    updatedAt: "2024-09-20",
  },
];

// ----------------------
// MAIN COMPONENT
// ----------------------
const CoursePage: FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [form, setForm] = useState<Course>({
    fullName: "",
    shortName: "",
    category: "Digital Literacy",
    overview: "",
    format: "Custom sections",
    announcements: 5,
    showGradebook: true,
    showReports: false,
    showDates: true,
    summary: "",
  });

  // Load mock data
  useEffect(() => {
    setCourses(mockCourses);
  }, []);

  // ----------------------
  // HANDLERS
  // ----------------------
  const handleSave = () => {
    if (!form.fullName.trim() || !form.shortName.trim()) {
      alert("Please enter course full name and short name.");
      return;
    }

    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (editingCourse?.id) {
      // Update existing
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? {
                ...form,
                id: editingCourse.id,
                updatedAt: now,
                createdAt: c.createdAt,
              }
            : c
        )
      );
    } else {
      // Add new
      const newCourse = {
        ...form,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      setCourses((prev) => [...prev, newCourse]);
    }

    handleClose();
  };

  const handleEdit = (id?: number) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    setEditingCourse(course);
    setForm(course);
    setShowModal(true);
  };

  const handleDelete = (id?: number) => {
    if (window.confirm("Delete this course?")) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClose = () => {
    setEditingCourse(null);
    setShowModal(false);
    setForm({
      fullName: "",
      shortName: "",
      category: "Digital Literacy",
      overview: "",
      format: "Custom sections",
      announcements: 5,
      showGradebook: true,
      showReports: false,
      showDates: true,
      summary: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const filteredData = useMemo(() => {
    if (!search) return courses;
    return courses.filter(
      (c) =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, courses]);

  // ----------------------
  // TABLE CONFIG
  // ----------------------
  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      { header: "Course Name", accessorKey: "fullName" },
      { header: "Short Name", accessorKey: "shortName" },
      { header: "Category", accessorKey: "category" },
      {
        header: "Created Date",
        accessorKey: "createdAt",
        cell: ({ getValue }) => <span>{getValue<string>() || "-"}</span>,
      },
      {
        header: "Updated Date",
        accessorKey: "updatedAt",
        cell: ({ getValue }) => <span>{getValue<string>() || "-"}</span>,
      },
      {
        header: "Actions",
        cell: ({ row }: { row: Row<Course> }) => (
          <CourseActionsDropdown
            courseId={row.original.id}
            courseTitle={row.original.fullName}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div
      className="m-4 bg-white p-6 rounded shadow-sm"
      // style={{ height: "90vh" }}
    >
      {/* Header */}
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
          <div className="table-responsive" style={{ height: "50vh" }}>
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0"
                  >
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: "pointer" }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-dark fw-semibold">
                {table.getRowModel().rows.map((row) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </KTCardBody>
      </KTCard>

      {/* Full-Screen Modal */}
      <Modal
        show={showModal}
        onHide={handleClose}
        size="xl"
        centered
        className="modal-fullscreen-md-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourse ? "Edit Course" : "Add New Course"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-5">
          <div className="container">
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label required">Course full name</label>
                <input
                  name="fullName"
                  className="form-control form-control-solid"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Web Development"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label required">Course short name</label>
                <input
                  name="shortName"
                  className="form-control form-control-solid"
                  value={form.shortName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-select form-select-solid"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Digital Literacy</option>
                  <option>Web Development</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Data Science</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Format</label>
                <select
                  name="format"
                  className="form-select form-select-solid"
                  value={form.format}
                  onChange={handleChange}
                >
                  <option>Custom sections</option>
                  <option>Weekly format</option>
                  <option>Topics format</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Course overview</label>
              <Editor
                apiKey="659sxzprn0yjxnr8ji2pu7wj5m2neear9j51tjr63nneit6l"
                value={form.overview}
                onEditorChange={(v) => setForm({ ...form, overview: v })}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: "link image code lists",
                  toolbar:
                    "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Course summary</label>
              <Editor
                apiKey="659sxzprn0yjxnr8ji2pu7wj5m2neear9j51tjr63nneit6l"
                value={form.summary}
                onEditorChange={(v) => setForm({ ...form, summary: v })}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: "link image code lists",
                  toolbar:
                    "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Course image</label>
              <input
                type="file"
                className="form-control form-control-solid"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, image: file.name });
                }}
              />
              {form.image && (
                <div className="mt-2">
                  <small className="text-muted">{form.image}</small>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Course
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CoursePage;
