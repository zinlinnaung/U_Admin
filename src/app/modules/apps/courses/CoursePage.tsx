import { FC, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { KTCard, KTCardBody, KTSVG } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// ----------------------
// CONFIG / Endpoints
// ----------------------
const API_URL = "https://mypadminapi.bitmyanmar.info/api/courses";
const CATEGORIES_URL = "https://mypadminapi.bitmyanmar.info/api/categories";
const SUBCATEGORIES_URL =
  "https://mypadminapi.bitmyanmar.info/api/subcategories";

// ----------------------
// TYPES
// ----------------------
export type Course = {
  id?: string;
  name: string;
  image?: string | null;
  previewImage?: string | null;
  previewVideo?: string | null;
  description?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  parentCourseId?: string | null;
  duration?: number;
  videoCount?: number;
  rating?: number;
  enrolledCount?: number;
  date?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Category = { id: string; name: string };

// ----------------------
// MAIN COMPONENT
// ----------------------
const CoursePage: FC = () => {
  const navigate = useNavigate();

  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form State
  const [form, setForm] = useState<Course>({
    name: "",
    image: null,
    previewImage: null,
    previewVideo: null,
    description: "",
    categoryId: "", // Initialize as empty string or null
    subCategoryId: "",
    parentCourseId: null,
    duration: 40,
    videoCount: 0,
    rating: 0,
    enrolledCount: 0,
    date: "",
    isDeleted: false,
  });

  // Rich Text Editor State
  const [descriptionEditor, setDescriptionEditor] = useState(
    EditorState.createEmpty()
  );

  // File Upload State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // ----------------------
  // Load initial data
  // ----------------------
  useEffect(() => {
    loadCourses();
    loadCategories();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await axios.get<Course[]>(API_URL);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get<Category[]>(CATEGORIES_URL);
      setCategories(res.data || []);
    } catch (err) {
      console.warn("Failed to load categories:", err);
    }
  };

  const loadSubCategories = async (categoryId?: string | null) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await axios.get<Category[]>(
        `${SUBCATEGORIES_URL}?categoryId=${categoryId}`
      );
      setSubCategories(res.data || []);
    } catch (err) {
      setSubCategories([]);
    }
  };

  // ----------------------
  // Helpers
  // ----------------------
  const setDescriptionFromHtml = (html?: string | null) => {
    if (!html) {
      setDescriptionEditor(EditorState.createEmpty());
      return;
    }
    const contentBlock = htmlToDraft(html);
    if (!contentBlock) {
      setDescriptionEditor(EditorState.createEmpty());
      return;
    }
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks,
      contentBlock.entityMap
    );
    setDescriptionEditor(EditorState.createWithContent(contentState));
  };

  // ----------------------
  // Handlers
  // ----------------------
  const openCreateModal = () => {
    console.log("Opening Create Modal"); // Debugging
    setEditingCourse(null);
    setForm({
      name: "",
      image: null,
      previewImage: null,
      previewVideo: null,
      description: "",
      categoryId: "",
      subCategoryId: "",
      parentCourseId: null,
      duration: 40,
      videoCount: 0,
      rating: 0,
      enrolledCount: 0,
      date: new Date().toISOString(),
      isDeleted: false,
    });
    setDescriptionEditor(EditorState.createEmpty());
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (id?: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    setEditingCourse(course);
    setForm({ ...course });
    setDescriptionFromHtml(course.description || "");
    setSelectedImageFile(null);
    // Load subcategories based on the existing category
    loadSubCategories(course.categoryId || null);
    setShowModal(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete this course?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      await loadCourses();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting course.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingCourse(null);
    setSelectedImageFile(null);
    setDescriptionEditor(EditorState.createEmpty());
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle Category Logic specifically
    if (name === "categoryId") {
      setForm((f) => ({ ...f, categoryId: value, subCategoryId: "" }));
      loadSubCategories(value || null);
      return;
    }

    if (type === "number") {
      setForm((f) => ({ ...f, [name]: Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedImageFile(f);
    if (f) {
      setForm((s) => ({ ...s, image: f.name }));
    }
  };

  const uploadImageIfAny = async (): Promise<string | null> => {
    if (!selectedImageFile) return form.image ?? null;
    try {
      const fd = new FormData();
      fd.append("file", selectedImageFile);
      const res = await axios.post<{ url: string }>(`${API_URL}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.url || selectedImageFile.name;
    } catch (err) {
      console.warn("Image upload failed, falling back to filename", err);
      return selectedImageFile.name;
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      const descriptionHtml = draftToHtml(
        convertToRaw(descriptionEditor.getCurrentContent())
      );
      const uploadedImageUrl = await uploadImageIfAny();

      const payload: Partial<Course> = {
        name: form.name,
        image: uploadedImageUrl ?? form.image ?? null,
        previewImage: form.previewImage ?? null,
        previewVideo: form.previewVideo ?? null,
        description: descriptionHtml || form.description || null,
        categoryId: form.categoryId ?? null,
        subCategoryId: form.subCategoryId ?? null,
        parentCourseId: form.parentCourseId ?? null,
        duration: form.duration ?? 0,
        videoCount: form.videoCount ?? 0,
        rating: form.rating ?? 0,
        enrolledCount: form.enrolledCount ?? 0,
      };

      if (editingCourse && editingCourse.id) {
        await axios.put(`${API_URL}/${editingCourse.id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      await loadCourses();
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving course.");
    }
  };

  // ----------------------
  // Table Configuration
  // ----------------------
  const filteredData = useMemo(() => {
    if (!search) return courses;
    const s = search.toLowerCase();
    return courses.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.description && c.description.toLowerCase().includes(s))
    );
  }, [search, courses]);

  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="d-flex align-items-center">
            {row.original.image && (
              <div className="symbol symbol-50px me-5">
                <img
                  src={row.original.image}
                  alt=""
                  style={{ objectFit: "cover", width: "50px", height: "50px" }}
                />
              </div>
            )}
            <div className="d-flex justify-content-start flex-column">
              <span className="text-dark fw-bold text-hover-primary mb-1 fs-6">
                {row.original.name}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Category",
        // Use a function component for the cell to ensure it rerenders
        // when the categories state updates, even if the main columns memo does not.
        cell: ({ row }) => {
          if (!categories.length || !row.original.categoryId) return "-";
          const cat = categories.find((c) => c.id === row.original.categoryId);
          return <span>{cat ? cat.name : "-"}</span>;
        },
        id: "category",
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => (
          <span>
            {getValue<string>()
              ? new Date(getValue<string>()).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <ActionCell
            courseId={row.original.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [courses, categories]
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
          {/* Add Button */}
          <button className="btn btn-primary" onClick={openCreateModal}>
            Add Course
          </button>
        </div>
      </div>

      {/* Table */}
      <KTCard>
        <KTCardBody className="py-4">
          <div className="table-responsive" style={{ minHeight: "300px" }}>
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
                        style={{ cursor: "pointer", minWidth: "100px" }}
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
                {table.getRowModel().rows.length > 0 ? (
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
                    <td colSpan={columns.length} className="text-center">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </KTCardBody>
      </KTCard>

      {/* Edit/Create Modal */}
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
          <form noValidate>
            <div className="row">
              {/* Course Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label required">Course Name</label>
                <input
                  type="text"
                  className="form-control form-control-solid"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter course name"
                />
              </div>

              {/* Category */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select form-select-solid"
                  name="categoryId"
                  value={form.categoryId || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Sub Category</label>
                <select
                  className="form-select form-select-solid"
                  name="subCategoryId"
                  value={form.subCategoryId || ""}
                  onChange={handleChange}
                  disabled={!form.categoryId}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="col-md-3 mb-3">
                <label className="form-label">Duration (min)</label>
                <input
                  type="number"
                  className="form-control form-control-solid"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>

              {/* Video Count */}
              <div className="col-md-3 mb-3">
                <label className="form-label">Video Count</label>
                <input
                  type="number"
                  className="form-control form-control-solid"
                  name="videoCount"
                  value={form.videoCount}
                  onChange={handleChange}
                />
              </div>

              {/* Image Upload */}
              <div className="col-md-12 mb-3">
                <label className="form-label">Course Image</label>
                <input
                  type="file"
                  className="form-control form-control-solid"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
                {form.image && !selectedImageFile && (
                  <div className="mt-2">
                    <span className="text-muted">Current: {form.image}</span>
                  </div>
                )}
              </div>

              {/* Description Editor */}
              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <div className="border rounded p-3">
                  <Editor
                    editorState={descriptionEditor}
                    onEditorStateChange={setDescriptionEditor}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    editorStyle={{ minHeight: "200px" }}
                  />
                </div>
              </div>
            </div>
          </form>
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

// ----------------------
// ActionCell Component
// ----------------------
type ActionCellProps = {
  courseId?: string;
  onDelete: (id?: string) => void;
  onEdit: (id?: string) => void;
};

const ActionCell: FC<ActionCellProps> = ({ courseId, onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 140;
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
  }, [open]);

  return (
    <div className="position-relative d-inline-block" ref={ref}>
      <button
        className="btn btn-sm btn-light d-flex align-items-center gap-1"
        onClick={() => setOpen((prev) => !prev)}
      >
        Actions
        <i
          className={`bi ${open ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}
        ></i>
      </button>

      {open && (
        <div
          className="dropdown-menu show p-2 shadow"
          style={{
            position: "absolute",
            top: openUpward ? "auto" : "100%",
            bottom: openUpward ? "100%" : "auto",
            transform: openUpward ? "translateY(-4px)" : "translateY(4px)",
            right: 0,
            minWidth: "160px",
            zIndex: 1050,
            backgroundColor: "white",
            borderRadius: "0.475rem",
          }}
        >
          <button
            className="dropdown-item d-flex align-items-center cursor-pointer"
            onClick={() => {
              if (courseId) onEdit(courseId);
              setOpen(false);
            }}
          >
            <i className="bi bi-pencil-square me-2"></i> Edit
          </button>

          <button
            className="dropdown-item d-flex align-items-center cursor-pointer"
            onClick={() => {
              if (courseId) onDelete(courseId);
              setOpen(false);
            }}
          >
            <i className="bi bi-trash me-2"></i> Delete
          </button>

          <button
            className="dropdown-item d-flex align-items-center cursor-pointer"
            onClick={() => {
              if (courseId) {
                navigate(`/apps/sections?id=${courseId}`);
              }
              setOpen(false);
            }}
          >
            <i className="bi bi-list-ul me-2"></i> Sections
          </button>
        </div>
      )}
    </div>
  );
};
