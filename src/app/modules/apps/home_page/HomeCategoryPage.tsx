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

import {
  KTCard,
  KTCardBody,
  KTIcon,
  KTSVG,
} from "../../../../_metronic/helpers";

import { Modal } from "react-bootstrap";

// ----------------------
// TYPES
// ----------------------
type CourseCategory = {
  id?: number;
  name: string;
  courses: string[];
  createdAt?: string;
  updatedAt?: string;
};

// ----------------------
// MOCK CATEGORY DATA
// ----------------------
const mockCategories: CourseCategory[] = [
  {
    id: 1,
    name: "Digital Literacy",
    courses: ["Basic Computer Skills", "Internet 101"],
    createdAt: "2024-08-01",
    updatedAt: "2024-08-05",
  },
  {
    id: 2,
    name: "Web Development",
    courses: ["HTML & CSS", "React Basics", "Node.js Intro"],
    createdAt: "2024-09-02",
    updatedAt: "2024-09-06",
  },
  {
    id: 3,
    name: "Data Science",
    courses: ["Python", "Machine Learning", "Data Visualization"],
    createdAt: "2024-09-10",
    updatedAt: "2024-09-15",
  },
];

// ----------------------
// MOCK COURSE LIST FOR AUTOCOMPLETE
// ----------------------
const mockAllCourses = [
  "Python",
  "Machine Learning",
  "Data Visualization",
  "HTML & CSS",
  "React Basics",
  "Node.js Intro",
  "Basic Computer Skills",
  "Internet 101",
  "Cybersecurity Basics",
  "Java Programming",
  "C++ Fundamentals",
  "SQL for Beginners",
  "Cloud Essentials",
  "Docker Essentials",
  "AI for Beginners",
];

// ----------------------
// MAIN COMPONENT
// ----------------------
const HomeCategoryPage: FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );

  const [form, setForm] = useState<CourseCategory>({
    name: "",
    courses: [],
  });

  // New states for autocomplete
  const [courseInput, setCourseInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  // ----------------------
  // HANDLERS
  // ----------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCourseInput = (value: string) => {
    setCourseInput(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = mockAllCourses.filter(
      (c) =>
        c.toLowerCase().includes(value.toLowerCase()) &&
        !form.courses.includes(c)
    );

    setSuggestions(filtered);
  };

  const handleAddCourse = (course: string) => {
    if (!course.trim()) return;

    setForm({ ...form, courses: [...form.courses, course] });
    setCourseInput("");
    setSuggestions([]);
  };

  const handleRemoveCourse = (course: string) => {
    setForm({
      ...form,
      courses: form.courses.filter((c) => c !== course),
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }

    const now = new Date().toISOString().split("T")[0];

    if (editingCategory?.id) {
      // update
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...form,
                id: editingCategory.id,
                createdAt: cat.createdAt,
                updatedAt: now,
              }
            : cat
        )
      );
    } else {
      // create new
      const newCat = {
        ...form,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      setCategories((p) => [...p, newCat]);
    }

    handleClose();
  };

  const handleEdit = (id?: number) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    setEditingCategory(cat);
    setForm(cat);
    setShowModal(true);
  };

  const handleDelete = (id?: number) => {
    if (window.confirm("Delete this category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClose = () => {
    setEditingCategory(null);
    setShowModal(false);
    setForm({ name: "", courses: [] });
    setCourseInput("");
    setSuggestions([]);
  };

  const filteredData = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.courses.some((course) =>
          course.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [search, categories]);

  // ----------------------
  // TABLE CONFIG
  // ----------------------
  const columns = useMemo<ColumnDef<CourseCategory>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      {
        header: "Courses",
        accessorKey: "courses",
        cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="d-flex flex-wrap gap-2">
              {row.original.courses.map((course, index) => (
                <span
                  key={index}
                  className="badge badge-light-primary d-flex align-items-center px-3 py-2"
                  style={{ fontSize: 13 }}
                >
                  {course}
                  <span
                    onClick={() =>
                      setCategories((prev) =>
                        prev.map((cat) =>
                          cat.id === id
                            ? {
                                ...cat,
                                courses: cat.courses.filter(
                                  (c) => c !== course
                                ),
                              }
                            : cat
                        )
                      )
                    }
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          );
        },
      },
      { header: "Created", accessorKey: "createdAt" },
      { header: "Updated", accessorKey: "updatedAt" },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="text-end">
            <button
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
              onClick={() => handleEdit(row.original.id)}
            >
              <KTIcon iconName="pencil" className="fs-3" />
            </button>

            <button
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <KTIcon iconName="trash" className="fs-3" />
            </button>
          </div>
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
    <div className="m-4 bg-white p-6 rounded shadow-sm">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
        <h2 className="fw-bold text-dark mb-3">Course Categories</h2>

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
            Add Category
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
                  <tr key={hg.id}>
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
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="text-dark fw-semibold">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
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
                    <td colSpan={columns.length} className="text-center py-5">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </KTCardBody>
      </KTCard>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container">
            {/* Name */}
            <div className="row mb-4">
              <div className="col-md-12">
                <label className="form-label required">Category Name</label>
                <input
                  name="name"
                  className="form-control form-control-solid"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Development"
                />
              </div>
            </div>

            {/* Courses */}
            <div className="mb-4 position-relative">
              <label className="form-label">Courses</label>

              {/* Existing Courses */}
              {form.courses.length > 0 ? (
                form.courses.map((course, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <span>{course}</span>
                    <button
                      className="btn btn-sm btn-light-danger"
                      onClick={() => handleRemoveCourse(course)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-muted small mb-2">
                  No courses added yet.
                </div>
              )}

              {/* Input for typing */}
              <input
                type="text"
                className="form-control form-control-solid mt-3"
                placeholder="Type to search course..."
                value={courseInput}
                onChange={(e) => handleCourseInput(e.target.value)}
              />

              {/* Autocomplete suggestions */}
              {suggestions.length > 0 && (
                <div
                  className="menu menu-sub menu-sub-dropdown show w-100 mt-1 shadow-sm"
                  data-kt-menu="true"
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((course, index) => (
                    <div
                      key={index}
                      className="menu-item px-3 py-2 cursor-pointer hover-bg-light-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleAddCourse(course)}
                    >
                      {course}
                    </div>
                  ))}
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
            Save Category
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomeCategoryPage;
