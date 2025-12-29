import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Modal, Spinner } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";

import { KTCard, KTCardBody, KTIcon } from "../../../../_metronic/helpers";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const CONTENT_API = "https://mypadminapi.bitmyanmar.info/api/content";
const TYPE_API = "https://mypadminapi.bitmyanmar.info/api/content-types";
const CATEGORY_API = "https://mypadminapi.bitmyanmar.info/api/categories";

const TEXT_TYPES = ["E-Books", "Articles", "Podcast"];
const FILE_TYPES = ["Video", "Youth-Voice"];

export default function ElibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    title: "",
    typeId: "",
    categoryId: "",
    thumbnailFile: null,
    thumbnailUrl: "",
    thumbnailPreview: "", // For local preview
    resourceFile: null,
    fileUrl: "",
  });

  const [descEditor, setDescEditor] = useState(EditorState.createEmpty());
  const [textEditor, setTextEditor] = useState(EditorState.createEmpty());

  const loadContent = async () => {
    const res = await axios.get(CONTENT_API);
    setItems(res.data);
  };

  const loadTypes = async () => {
    const res = await axios.get(TYPE_API);
    setTypes(res.data);
  };

  const loadCategories = async () => {
    const res = await axios.get(CATEGORY_API);
    setCategories(res.data);
  };

  useEffect(() => {
    loadContent();
    loadTypes();
    loadCategories();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      typeId: "",
      categoryId: "",
      thumbnailFile: null,
      thumbnailUrl: "",
      thumbnailPreview: "",
      resourceFile: null,
      fileUrl: "",
    });
    setDescEditor(EditorState.createEmpty());
    setTextEditor(EditorState.createEmpty());
    setShow(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    try {
      if (row.description) {
        setDescEditor(
          EditorState.createWithContent(
            convertFromRaw(JSON.parse(row.description))
          )
        );
      }
      if (row.content && TEXT_TYPES.includes(row.type?.name)) {
        setTextEditor(
          EditorState.createWithContent(convertFromRaw(JSON.parse(row.content)))
        );
      }
    } catch (e) {
      console.error("Editor Parse Error", e);
    }

    setForm({
      title: row.title,
      typeId: row.type?.id || "",
      categoryId: row.category?.id || "",
      thumbnailUrl: row.thumbnailUrl,
      thumbnailPreview: row.thumbnailUrl, // Use existing URL as preview
      fileUrl: row.fileUrl,
      thumbnailFile: null,
      resourceFile: null,
    });
    setShow(true);
  };

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await axios.post(`${CONTENT_API}/upload`, fd);
    return res.data.url;
  };

  const save = async () => {
    if (!form.title || !form.typeId) {
      alert("Title and Type are required");
      return;
    }
    setLoading(true);
    try {
      const descJson = JSON.stringify(
        convertToRaw(descEditor.getCurrentContent())
      );
      const textJson = JSON.stringify(
        convertToRaw(textEditor.getCurrentContent())
      );

      let finalThumb = form.thumbnailUrl;
      let finalFile = form.fileUrl;
      let finalContent = textJson;

      if (form.thumbnailFile) {
        finalThumb = await upload(form.thumbnailFile);
      }

      const selectedType = types.find((t) => t.id === form.typeId);
      const typeName = selectedType?.name;

      if (TEXT_TYPES.includes(typeName)) {
        finalContent = textJson;
      } else if (FILE_TYPES.includes(typeName)) {
        if (form.resourceFile) finalFile = await upload(form.resourceFile);
        finalContent = finalFile;
      }

      const dto = {
        title: form.title,
        description: descJson,
        content: finalContent,
        fileUrl: finalFile,
        thumbnailUrl: finalThumb,
        typeId: form.typeId,
        categoryId: form.categoryId || undefined,
        author: "Admin",
      };

      if (editingId) {
        await axios.put(`${CONTENT_API}/${editingId}`, dto);
      } else {
        await axios.post(CONTENT_API, dto);
      }
      setShow(false);
      loadContent();
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Content",
        id: "thumbnail",
        cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <div className="symbol symbol-50px me-3">
              <img
                src={row.original.thumbnailUrl || "/media/avatars/blank.png"}
                alt=""
              />
            </div>
            <div className="d-flex flex-column">
              <span className="text-gray-800 fw-bold fs-6">
                {row.original.title}
              </span>
              <span className="text-muted fw-semibold fs-7">
                {row.original.type?.name}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Type", // ✅ Add a separate Type column
        accessorKey: "type",
        cell: ({ row }) => (
          <span className="badge badge-light-primary fw-semibold">
            {row.original.type?.name || "—"}
          </span>
        ),
      },
      {
        header: "Category",
        cell: ({ row }) => (
          <span className="badge badge-light-secondary fw-semibold">
            {row.original.category?.name || "—"}
          </span>
        ),
      },
      {
        header: "Date Created",
        accessorKey: "createdAt",
        cell: (info) => (
          <span className="text-muted fw-semibold">
            {new Date(info.getValue() as string).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="d-flex justify-content-end flex-shrink-0">
            <button
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
              onClick={() => openEdit(row.original)}
            >
              <KTIcon iconName="pencil" className="fs-3" />
            </button>
            <button
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              onClick={() => {
                if (window.confirm("Delete this?"))
                  axios
                    .delete(`${CONTENT_API}/${row.original.id}`)
                    .then(loadContent);
              }}
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
    data: useMemo(
      () =>
        items.filter((i) =>
          i.title?.toLowerCase().includes(search.toLowerCase())
        ),
      [items, search]
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="app-container container-xxl">
      <div className="d-flex flex-stack mb-5 mt-5">
        <div className="d-flex align-items-center position-relative my-1">
          <KTIcon
            iconName="magnifier"
            className="fs-1 position-absolute ms-6"
          />
          <input
            type="text"
            className="form-control form-control-solid w-250px ps-15"
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <KTIcon iconName="plus" className="fs-2" /> Add Content
        </button>
      </div>

      <KTCard>
        <KTCardBody className="py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="text-start text-muted fw-bold fs-7 text-uppercase gs-0"
                  >
                    {hg.headers.map((h) => (
                      <th key={h.id}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {table.getRowModel().rows.map((r) => (
                  <tr key={r.id}>
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </KTCardBody>
      </KTCard>

      <Modal show={show} onHide={() => setShow(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editingId ? "Edit" : "Create"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
          <div className="row g-9 mb-8">
            {/* THUMBNAIL UPLOAD SECTION */}
            <div className="col-12 text-center mb-7">
              <label className="fs-6 fw-semibold mb-2 d-block text-start">
                Thumbnail Image
              </label>
              <div
                className="image-input image-input-outline"
                style={{ backgroundImage: `url(/media/svg/avatars/blank.svg)` }}
              >
                <div
                  className="image-input-wrapper w-125px h-125px"
                  style={{
                    backgroundImage: `url(${
                      form.thumbnailPreview ||
                      "/media/svg/files/blank-image.svg"
                    })`,
                    backgroundSize: "cover",
                  }}
                ></div>
                <label
                  className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
                  data-kt-image-input-action="change"
                >
                  <KTIcon iconName="pencil" className="fs-7" />
                  <input
                    type="file"
                    name="avatar"
                    accept=".png, .jpg, .jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        setForm({
                          ...form,
                          thumbnailFile: file,
                          thumbnailPreview: URL.createObjectURL(file),
                        });
                    }}
                  />
                </label>
              </div>
              <div className="form-text">
                Allowed file types: png, jpg, jpeg.
              </div>
            </div>

            <div className="col-12">
              <label className="required fs-6 fw-semibold mb-2">Title</label>
              <input
                className="form-control form-control-solid"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="required fs-6 fw-semibold mb-2">Type</label>
              <select
                className="form-select form-select-solid"
                value={form.typeId}
                onChange={(e) => setForm({ ...form, typeId: e.target.value })}
              >
                <option value="">Select...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="fs-6 fw-semibold mb-2">Category</label>
              <select
                className="form-select form-select-solid"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="fs-6 fw-semibold mb-2">Description</label>
              <div className="border rounded-2">
                <Editor
                  editorState={descEditor}
                  onEditorStateChange={setDescEditor}
                  toolbarClassName="border-0 border-bottom-1"
                  editorClassName="px-3 min-h-100px"
                />
              </div>
            </div>

            <div className="col-12">
              <label className="fs-6 fw-semibold mb-2">Resource Content</label>
              {TEXT_TYPES.includes(
                types.find((t) => t.id === form.typeId)?.name
              ) ? (
                <div className="border rounded-2">
                  <Editor
                    editorState={textEditor}
                    onEditorStateChange={setTextEditor}
                    toolbarClassName="border-0 border-bottom-1"
                    editorClassName="px-3 min-h-200px"
                  />
                </div>
              ) : FILE_TYPES.includes(
                  types.find((t) => t.id === form.typeId)?.name
                ) ? (
                <input
                  type="file"
                  className="form-control form-control-solid"
                  onChange={(e) =>
                    setForm({ ...form, resourceFile: e.target.files?.[0] })
                  }
                />
              ) : null}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <button className="btn btn-light me-3" onClick={() => setShow(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
