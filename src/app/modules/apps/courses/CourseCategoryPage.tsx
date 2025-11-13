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
  shortName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ----------------------
// MOCK DATA
// ----------------------
const mockCategories: CourseCategory[] = [
  {
    id: 1,
    name: "Digital Literacy",
    shortName: "DIGI",
    description: "Courses that introduce basic digital skills.",
    createdAt: "2024-08-01",
    updatedAt: "2024-08-05",
  },
  {
    id: 2,
    name: "Web Development",
    shortName: "WEBDEV",
    description: "Courses related to frontend and backend development.",
    createdAt: "2024-09-02",
    updatedAt: "2024-09-06",
  },
  {
    id: 3,
    name: "Data Science",
    shortName: "DATASCI",
    description: "Courses on analytics, machine learning, and AI.",
    createdAt: "2024-09-10",
    updatedAt: "2024-09-15",
  },
];

// ----------------------
// MAIN COMPONENT
// ----------------------
const CourseCategoryPage: FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );
  const [form, setForm] = useState<CourseCategory>({
    name: "",
    shortName: "",
    description: "",
  });

  // Load mock data
  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  // ----------------------
  // HANDLERS
  // ----------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.shortName.trim()) {
      alert("Please fill in required fields.");
      return;
    }

    const now = new Date().toISOString().split("T")[0];

    if (editingCategory?.id) {
      // Update existing
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
      // Create new
      const newCategory = {
        ...form,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      setCategories((prev) => [...prev, newCategory]);
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
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClose = () => {
    setEditingCategory(null);
    setShowModal(false);
    setForm({
      name: "",
      shortName: "",
      description: "",
    });
  };

  const filteredData = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.shortName.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, categories]);

  // ----------------------
  // TABLE CONFIG
  // ----------------------
  const columns = useMemo<ColumnDef<CourseCategory>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Short Name", accessorKey: "shortName" },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ getValue }) => (
          <span className="text-muted small">
            {getValue<string>()?.slice(0, 60) || "-"}
          </span>
        ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => <span>{getValue<string>() || "-"}</span>,
      },
      {
        header: "Updated At",
        accessorKey: "updatedAt",
        cell: ({ getValue }) => <span>{getValue<string>() || "-"}</span>,
      },
      {
        header: "Actions",
        cell: ({ row }: { row: Row<CourseCategory> }) => (
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
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label required">Category Name</label>
                <input
                  name="name"
                  className="form-control form-control-solid"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Development"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label required">Short Name</label>
                <input
                  name="shortName"
                  className="form-control form-control-solid"
                  value={form.shortName}
                  onChange={handleChange}
                  placeholder="e.g. FRONTEND"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control form-control-solid"
                rows={3}
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Short description of this category..."
              />
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

export default CourseCategoryPage;
