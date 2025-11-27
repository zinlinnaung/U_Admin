import { FC, useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
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
type Course = {
  id: string;
  name: string;
};

type HomeCategoryItem = {
  id: string;
  homeCategoryId: string;
  courseId: string;
  type: string;
};

type HomeCategory = {
  id: string;
  name: string;
  items: HomeCategoryItem[];
  createdAt: string;
  updatedAt: string;
};

// ----------------------
// COMPONENT
// ----------------------
const HomeCategoryPage: FC = () => {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HomeCategory | null>(
    null
  );

  const [form, setForm] = useState<{ name: string; courseIds: string[] }>({
    name: "",
    courseIds: [],
  });

  const [courseInput, setCourseInput] = useState("");
  const [suggestions, setSuggestions] = useState<Course[]>([]);

  // ----------------------
  // FETCH DATA
  // ----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          axios.get<HomeCategory[]>(
            "https://mypadminapi.bitmyanmar.info/api/home-category"
          ),
          axios.get<Course[]>(
            "https://mypadminapi.bitmyanmar.info/api/courses"
          ),
        ]);

        setCategories(catRes.data);
        setAllCourses(courseRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
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
    const filtered = allCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(value.toLowerCase()) &&
        !form.courseIds.includes(c.id)
    );
    setSuggestions(filtered);
  };

  const handleAddCourse = (course: Course) => {
    setForm({ ...form, courseIds: [...form.courseIds, course.id] });
    setCourseInput("");
    setSuggestions([]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setForm({
      ...form,
      courseIds: form.courseIds.filter((id) => id !== courseId),
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Name is required.");
    const body = {
      name: form.name,
      itemIds: form.courseIds,
    };

    try {
      if (editingCategory) {
        // Update
        await axios.put(
          `https://mypadminapi.bitmyanmar.info/api/home-category/${editingCategory.id}`,
          body
        );
      } else {
        // Create
        await axios.post(
          "https://mypadminapi.bitmyanmar.info/api/home-category",
          body
        );
      }
      // Refresh
      const res = await axios.get<HomeCategory[]>(
        "https://mypadminapi.bitmyanmar.info/api/home-category"
      );
      setCategories(res.data);
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

  const handleEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditingCategory(cat);
    setForm({ name: cat.name, courseIds: cat.items.map((i) => i.courseId) });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(
        `https://mypadminapi.bitmyanmar.info/api/home-category/${id}`
      );
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  const handleClose = () => {
    setEditingCategory(null);
    setShowModal(false);
    setForm({ name: "", courseIds: [] });
    setCourseInput("");
    setSuggestions([]);
  };

  // ----------------------
  // FILTERED DATA
  // ----------------------
  const filteredData = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some((item) => {
          const course = allCourses.find((c) => c.id === item.courseId);
          return course?.name.toLowerCase().includes(search.toLowerCase());
        })
    );
  }, [search, categories, allCourses]);

  // ----------------------
  // TABLE COLUMNS
  // ----------------------
  const columns = useMemo<ColumnDef<HomeCategory>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      {
        header: "Courses",
        accessorKey: "items",
        cell: ({ row }) => (
          <div className="d-flex flex-wrap gap-2">
            {row.original.items.map((item) => {
              const course = allCourses.find((c) => c.id === item.courseId);
              if (!course) return null;
              return (
                <span
                  key={item.id}
                  className="badge badge-light-primary d-flex align-items-center px-3 py-2"
                  style={{ fontSize: 13 }}
                >
                  {course.name}
                </span>
              );
            })}
          </div>
        ),
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
    [allCourses]
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
        <h2 className="fw-bold text-dark mb-3">Home Categories</h2>
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
              {form.courseIds.length > 0 ? (
                form.courseIds.map((id) => {
                  const course = allCourses.find((c) => c.id === id);
                  if (!course) return null;
                  return (
                    <div
                      key={id}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <span>{course.name}</span>
                      <button
                        className="btn btn-sm btn-light-danger"
                        onClick={() => handleRemoveCourse(id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
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
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((course) => (
                    <div
                      key={course.id}
                      className="menu-item px-3 py-2 cursor-pointer hover-bg-light-primary"
                      onClick={() => handleAddCourse(course)}
                    >
                      {course.name}
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
