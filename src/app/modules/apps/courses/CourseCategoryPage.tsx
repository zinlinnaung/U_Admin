import { FC, useState, useEffect, useMemo } from "react";
import axios from "axios";
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
// Matches the API response structure
type CourseCategory = {
  id: string;
  name: string;
  type: string; // e.g., "NORMAL", "FEATURE"
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Optional: include sub properties if you need to display them
  subCategories?: any[];
  courses?: any[];
};

// Matches the Create/Update Payload
type CategoryPayload = {
  name: string;
  type: string;
  isDeleted: boolean;
};

// ----------------------
// API CONFIG
// ----------------------
const API_URL = "https://mypadminapi.bitmyanmar.info/api/categories";

// ----------------------
// MAIN COMPONENT
// ----------------------
const CourseCategoryPage: FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<CategoryPayload>({
    name: "",
    type: "NORMAL", // Default value
    isDeleted: false,
  });

  // ----------------------
  // API ACTIONS
  // ----------------------
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<CourseCategory[]>(API_URL);
      // Filter out deleted items if necessary, or show all
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchCategories();
  }, []);

  // ----------------------
  // HANDLERS
  // ----------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Please fill in the category name.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // UPDATE Existing (Assuming PUT endpoint exists at /api/categories/:id)
        // If your API uses a different method for update, adjust here.
        await axios.put(`${API_URL}/${editingId}`, form);
        alert("Category updated successfully!");
      } else {
        // CREATE New
        // Payload matches: { "name": "string", "type": {}, "isDeleted": true }
        await axios.post(API_URL, form);
        alert("Category created successfully!");
      }

      // Refresh table and close modal
      await fetchCategories();
      handleClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: CourseCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      isDeleted: category.isDeleted,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setIsLoading(true);
    try {
      // Assuming DELETE endpoint exists at /api/categories/:id
      await axios.delete(`${API_URL}/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditingId(null);
    setShowModal(false);
    setForm({
      name: "",
      type: "NORMAL",
      isDeleted: false,
    });
  };

  // ----------------------
  // TABLE LOGIC
  // ----------------------
  const filteredData = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, categories]);

  const columns = useMemo<ColumnDef<CourseCategory>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue }) => (
          <span className="fw-bold">{getValue<string>()}</span>
        ),
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: ({ getValue }) => (
          <span
            className={`badge ${
              getValue<string>() === "FEATURE"
                ? "badge-light-warning"
                : "badge-light-primary"
            }`}
          >
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "isDeleted",
        cell: ({ getValue }) => (
          <span
            className={`badge ${
              getValue<boolean>() ? "badge-light-danger" : "badge-light-success"
            }`}
          >
            {getValue<boolean>() ? "Deleted" : "Active"}
          </span>
        ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const dateStr = getValue<string>();
          return (
            <span>
              {dateStr ? new Date(dateStr).toLocaleDateString() : "-"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="text-end">
            <button
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
              onClick={() => handleEdit(row.original)}
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
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Add Category"}
          </button>
        </div>
      </div>

      {/* Table */}
      <KTCard>
        <KTCardBody className="py-4">
          <div
            className="table-responsive"
            style={{ height: "60vh", overflowY: "auto" }}
          >
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
                {isLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      Loading data...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? (
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
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            {/* Name Field */}
            <div className="mb-4">
              <label className="form-label required">Category Name</label>
              <input
                name="name"
                className="form-control form-control-solid"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Language"
              />
            </div>

            {/* Type Field */}
            <div className="mb-4">
              <label className="form-label required">Type</label>
              <select
                name="type"
                className="form-select form-select-solid"
                value={form.type}
                onChange={handleChange}
              >
                <option value="NORMAL">NORMAL</option>
                <option value="FEATURE">FEATURE</option>
              </select>
            </div>

            {/* Is Deleted Field */}
            <div className="mb-4">
              <div className="form-check form-check-solid form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isDeleted"
                  checked={form.isDeleted}
                  onChange={handleChange}
                  id="isDeletedCheck"
                />
                <label className="form-check-label" htmlFor="isDeletedCheck">
                  Is Deleted?
                </label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseCategoryPage;
