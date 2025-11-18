// FULL E-LIBRARY PAGE WITH IMAGE PREVIEW FIXED
// React + Metronic

import React, { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

const TYPES = [
  "Article - Image",
  "Article - Text",
  "E-Book",
  "Podcast",
  "Video",
  "Youth-Voice",
];

const CATEGORIES = [
  "Career Development",
  "Digital Literacy",
  "Entrepreneurship",
  "Financial Literacy",
  "Health & Wellbeing",
  "Language",
  "Non-Formal Education",
  "Personal Development",
  "Vocational & Livelihood",
];

// MOCK DATA
const mock = [
  {
    id: 1,
    name: "Healthy Eating Basics",
    previewImage: "preview1.jpg",
    type: "Article - Text",
    courseCategory: "Health & Wellbeing",
    description: "{}",
    articleText: "{}",
    articleImages: ["preview1.jpg"],
    ebookPdf: "",
    youtubeLink: "",
  },
  {
    id: 2,
    name: "Digital Skills Starter Guide",
    previewImage: "preview2.jpg",
    type: "E-Book",
    courseCategory: "Digital Literacy",
    description: "{}",
    articleText: "{}",
    articleImages: [],
    ebookPdf: "digital-skills.pdf",
    youtubeLink: "",
  },
];

export default function ElibraryPage() {
  const [items, setItems] = useState<any[]>(mock);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    previewImage: "",
    type: "",
    courseCategory: "",
    articleImages: [],
    ebookPdf: "",
    youtubeLink: "",
  });

  const [descEditor, setDescEditor] = useState(EditorState.createEmpty());
  const [textEditor, setTextEditor] = useState(EditorState.createEmpty());

  // NEW ITEM
  const openNew = () => {
    setEditing(null);

    setForm({
      name: "",
      previewImage: "",
      type: "",
      courseCategory: "",
      articleImages: [],
      ebookPdf: "",
      youtubeLink: "",
    });

    setDescEditor(EditorState.createEmpty());
    setTextEditor(EditorState.createEmpty());
    setShow(true);
  };

  // EDIT ITEM (NORMALIZE IMAGES)
  const openEdit = (row: any) => {
    setEditing(row.id);

    const normalizedImages =
      (row.articleImages || []).map((img: any) => {
        // If stored as string filename
        if (typeof img === "string") {
          return {
            name: img,
            file: null,
            preview: `${process.env.PUBLIC_URL}/${img}`,
          };
        }

        // If stored as object but missing preview
        if (img.file && !img.preview) {
          return {
            ...img,
            preview: URL.createObjectURL(img.file),
          };
        }

        return img;
      }) || [];

    setForm({
      ...row,
      articleImages: normalizedImages,
    });

    setShow(true);
  };

  // SAVE ITEM
  const save = () => {
    const description = JSON.stringify(
      convertToRaw(descEditor.getCurrentContent())
    );
    const articleText = JSON.stringify(
      convertToRaw(textEditor.getCurrentContent())
    );

    const payload = { ...form, description, articleText };

    if (editing) {
      setItems((p) =>
        p.map((x) => (x.id === editing ? { ...payload, id: x.id } : x))
      );
    } else {
      setItems((p) => [...p, { ...payload, id: Date.now() }]);
    }

    setShow(false);
  };

  const del = (id: any) => setItems((p) => p.filter((x) => x.id !== id));

  // SEARCH FILTER
  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((x) =>
      x.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  // TABLE COLUMNS
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Type", accessorKey: "type" },
      { header: "Category", accessorKey: "courseCategory" },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-light-primary"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-light-danger"
              onClick={() => del(row.original.id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="m-4 bg-white p-6 rounded shadow-sm">
      <div className="d-flex justify-content-between mb-5">
        <h2 className="fw-bold">E-Library</h2>

        <div className="d-flex gap-3">
          <input
            className="form-control form-control-solid"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openNew}>
            Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <KTCard>
        <KTCardBody>
          <table className="table table-row-dashed fs-6">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
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
        </KTCardBody>
      </KTCard>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Item" : "Add New Item"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container">
            {/* NAME */}
            <label className="form-label fw-bold mt-3">Name</label>
            <input
              className="form-control form-control-solid"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* PREVIEW IMAGE */}
            <label className="form-label fw-bold mt-3">Preview Image</label>
            <input
              type="file"
              className="form-control form-control-solid"
              onChange={(e) =>
                setForm({
                  ...form,
                  previewImage: e.target.files?.[0]?.name || "",
                })
              }
            />

            {/* TYPE */}
            <label className="form-label fw-bold mt-3">Type</label>
            <select
              className="form-select form-select-solid"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="">Select...</option>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* CATEGORY */}
            <label className="form-label fw-bold mt-3">Course Category</label>
            <select
              className="form-select form-select-solid"
              value={form.courseCategory}
              onChange={(e) =>
                setForm({ ...form, courseCategory: e.target.value })
              }
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* DESCRIPTION */}
            <label className="form-label fw-bold mt-4">Description</label>
            <div style={{ border: "1px solid #e3e6ef", borderRadius: 6 }}>
              <Editor
                editorState={descEditor}
                onEditorStateChange={setDescEditor}
                editorClassName="p-3"
              />
            </div>

            {/* CONTENT SECTION */}
            <h5 className="fw-bold mt-5">Content Section</h5>
            <hr />

            {/* ✅ ARTICLE WITH IMAGES */}
            {form.type === "Article - Image" && (
              <div className="mt-4">
                <label className="form-label fw-bold">
                  Upload Multiple Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="form-control form-control-solid mb-4"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);

                    const newImages = files.map((file) => ({
                      name: file.name,
                      file,
                      preview: URL.createObjectURL(file),
                    }));

                    setForm({
                      ...form,
                      articleImages: [...form.articleImages, ...newImages],
                    });
                  }}
                />

                <div className="row g-4">
                  {form.articleImages.map((img: any, idx: number) => (
                    <div className="col-6 col-md-4 col-lg-3" key={idx}>
                      <div className="card shadow-sm h-100 position-relative">
                        {/* REMOVE BUTTON */}
                        <button
                          type="button"
                          className="btn btn-icon btn-sm btn-light-danger position-absolute top-0 end-0 m-2"
                          onClick={() =>
                            setForm({
                              ...form,
                              articleImages: form.articleImages.filter(
                                (_: any, i: number) => i !== idx
                              ),
                            })
                          }
                        >
                          <i className="bi bi-x-lg fs-6"></i>
                        </button>

                        {/* IMAGE PREVIEW */}
                        <img
                          src={
                            img.preview
                              ? img.preview
                              : img.name
                              ? `${process.env.PUBLIC_URL}/${img.name}`
                              : ""
                          }
                          alt="preview"
                          className="card-img-top"
                          style={{
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />

                        <div className="card-body py-2 px-3">
                          <p className="text-gray-700 fw-semibold small text-truncate mb-0">
                            {img.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT ARTICLE */}
            {form.type === "Article - Text" && (
              <>
                <label className="form-label fw-bold">Content</label>
                <div style={{ border: "1px solid #e3e6ef", borderRadius: 6 }}>
                  <Editor
                    editorState={textEditor}
                    onEditorStateChange={setTextEditor}
                    editorClassName="p-3"
                  />
                </div>
              </>
            )}

            {/* E-BOOK PDF */}
            {form.type === "E-Book" && (
              <>
                <label className="form-label fw-bold">Upload PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control form-control-solid"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ebookPdf: e.target.files?.[0]?.name || "",
                    })
                  }
                />
              </>
            )}

            {/* YOUTUBE CONTENT */}
            {(form.type === "Podcast" ||
              form.type === "Video" ||
              form.type === "Youth-Voice") && (
              <>
                <label className="form-label fw-bold">YouTube Link</label>
                <input
                  className="form-control form-control-solid"
                  value={form.youtubeLink}
                  onChange={(e) =>
                    setForm({ ...form, youtubeLink: e.target.value })
                  }
                />
              </>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-light" onClick={() => setShow(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
