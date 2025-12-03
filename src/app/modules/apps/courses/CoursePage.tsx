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
// TYPES (Updated to match your API JSON)
// ----------------------
export type Course = {
  id?: string; // UUID string
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
    categoryId: null,
    subCategoryId: null,
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
      // Subcategories might be empty, ignore error
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
    setEditingCourse(null);
    setForm({
      name: "",
      image: null,
      previewImage: null,
      previewVideo: null,
      description: "",
      categoryId: null,
      subCategoryId: null,
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

  // **FIX**: id is string (UUID)
  const handleEdit = (id?: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    setEditingCourse(course);
    setForm({ ...course });
    setDescriptionFromHtml(course.description || "");
    setSelectedImageFile(null);
    loadSubCategories(course.categoryId || null);
    setShowModal(true);
  };

  // **FIX**: id is string (UUID)
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
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "number") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (name === "categoryId") {
      loadSubCategories(value || null);
      setForm((f) => ({ ...f, subCategoryId: null }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedImageFile(f);
    if (f) {
      // Temporary preview name
      setForm((s) => ({ ...s, image: s.image ?? f.name }));
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
        // UPDATE
        await axios.put(`${API_URL}/${editingCourse.id}`, payload);
      } else {
        // CREATE
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
            {/* Optional: Show image thumbnail if available */}
            {row.original.image && (
              <div className="symbol symbol-50px me-5">
                <img
                  src={row.original.image}
                  className=""
                  alt=""
                  style={{ objectFit: "cover" }}
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
        accessorFn: (row) => {
          // Attempt to find category name by ID, else show ID
          const cat = categories.find((c) => c.id === row.categoryId);
          return cat ? cat.name : row.categoryId ?? "-";
        },
        id: "category",
      },
      {
        header: "Duration",
        accessorFn: (row) => row.duration ?? 0,
        cell: (info) => <span>{info.getValue<number>()} mins</span>,
        id: "duration",
      },
      {
        header: "Enrolled",
        accessorKey: "enrolledCount",
      },
      {
        header: "Rating",
        accessorKey: "rating",
      },
      {
        header: "Updated",
        accessorKey: "updatedAt",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="container">
            {/* Row 1 */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label required">Course Name</label>
                <input
                  name="name"
                  className="form-control form-control-solid"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Course name"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Duration (mins)</label>
                <input
                  name="duration"
                  type="number"
                  className="form-control form-control-solid"
                  value={form.duration ?? 0}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Video count</label>
                <input
                  name="videoCount"
                  type="number"
                  className="form-control form-control-solid"
                  value={form.videoCount ?? 0}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  className="form-select form-select-solid"
                  value={form.categoryId ?? ""}
                  onChange={handleChange}
                >
                  <option value="">-- Select category --</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Subcategory</label>
                <select
                  name="subCategoryId"
                  className="form-select form-select-solid"
                  value={form.subCategoryId ?? ""}
                  onChange={handleChange}
                >
                  <option value="">-- Select subcategory --</option>
                  {subCategories.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Parent Course</label>
                <select
                  name="parentCourseId"
                  className="form-select form-select-solid"
                  value={form.parentCourseId ?? ""}
                  onChange={handleChange}
                >
                  <option value="">-- None --</option>
                  {courses.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 - Description */}
            <div className="mb-4">
              <label className="form-label">Description</label>
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  minHeight: 200,
                  padding: "5px",
                }}
              >
                <Editor
                  editorState={descriptionEditor}
                  onEditorStateChange={setDescriptionEditor}
                />
              </div>
            </div>

            {/* Row 4 - Image */}
            <div className="mb-4">
              <label className="form-label">Course image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control form-control-solid"
                onChange={handleImageFileChange}
              />
              {selectedImageFile ? (
                <div className="mt-2">
                  <small className="text-muted">
                    Selected: {selectedImageFile.name}
                  </small>
                </div>
              ) : form.image ? (
                <div className="mt-2 d-flex align-items-center gap-3">
                  <img
                    src={form.image}
                    alt="preview"
                    style={{
                      width: 120,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <small className="text-muted">Current image</small>
                </div>
              ) : null}
            </div>

            {/* Row 5 - Video & Stats */}
            <div className="mb-4">
              <label className="form-label">Preview video URL</label>
              <input
                name="previewVideo"
                className="form-control form-control-solid"
                placeholder="https://..."
                value={form.previewVideo ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label">Rating</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  max="5"
                  className="form-control form-control-solid"
                  value={form.rating ?? 0}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Enrolled count</label>
                <input
                  name="enrolledCount"
                  type="number"
                  className="form-control form-control-solid"
                  value={form.enrolledCount ?? 0}
                  onChange={handleChange}
                />
              </div>
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

// ------------------------------------------------------------------
// Internal Component: ActionCell (Merged & Fixed for String IDs)
// ------------------------------------------------------------------
type ActionCellProps = {
  courseId?: string; // Correctly typed as string for your UUIDs
  onDelete: (id?: string) => void;
  onEdit: (id?: string) => void;
};

const ActionCell: FC<ActionCellProps> = ({ courseId, onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-detect dropdown direction
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 140; // Approx height
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
              // Pass the UUID string correctly
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
              navigate("/apps/sections");
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
