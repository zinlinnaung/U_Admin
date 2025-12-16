// FULL E-LIBRARY PAGE INTEGRATED WITH API
// FINAL VERSION — READY FOR USE

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";

import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const API = "https://mypadminapi.bitmyanmar.info/api/content";

/* -------------------------------------------------------
   🔗 TEMPORARY MAPPING — UPDATE ACCORDING TO YOUR BACKEND
-------------------------------------------------------- */
const TYPE_MAP: Record<string, string> = {
  "Article - Image": "1",
  "Article - Text": "2",
  "E-Book": "3",
  Podcast: "4",
  Video: "5",
  "Youth-Voice": "6",
};

const CATEGORY_MAP: Record<string, string> = {
  "Career Development": "1",
  "Digital Literacy": "2",
  Entrepreneurship: "3",
  "Financial Literacy": "4",
  "Health & Wellbeing": "5",
  Language: "6",
  "Non-Formal Education": "7",
  "Personal Development": "8",
  "Vocational & Livelihood": "9",
};

export default function ElibraryPage() {
  const [items, setItems] = useState<any[]>([]);
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

  /* -------------------------------------------------------
     LOAD ITEMS FROM API
  -------------------------------------------------------- */
  const load = async () => {
    const res = await axios.get(API);
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  /* -------------------------------------------------------
     OPEN NEW
  -------------------------------------------------------- */
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

  /* -------------------------------------------------------
     OPEN EDIT
  -------------------------------------------------------- */
  const openEdit = (row: any) => {
    setEditing(row.id);

    const normalizedImages = (row.articleImages || []).map((img: any) => ({
      name: img,
      file: null,
      preview: `${process.env.PUBLIC_URL}/${img}`,
    }));

    setForm({
      ...row,
      articleImages: normalizedImages,
    });

    setShow(true);
  };

  /* -------------------------------------------------------
     UPLOAD FILE HELPER
  -------------------------------------------------------- */
  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await axios.post(`${API}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url; // backend returns URL
  };

  /* -------------------------------------------------------
     SAVE (CREATE OR UPDATE)
  -------------------------------------------------------- */
  const save = async () => {
    const description = JSON.stringify(
      convertToRaw(descEditor.getCurrentContent())
    );
    const articleText = JSON.stringify(
      convertToRaw(textEditor.getCurrentContent())
    );

    let thumbnailUrl = form.thumbnailUrl || "";
    let fileUrl = "";
    let content = articleText;

    /* ---- upload preview image ---- */
    if (form.previewImage instanceof File) {
      thumbnailUrl = await uploadFile(form.previewImage);
    }

    /* ---- upload article images or ebook ---- */
    if (form.type === "Article - Image") {
      if (form.articleImages[0]?.file) {
        fileUrl = await uploadFile(form.articleImages[0].file);
      }
    }

    if (form.type === "E-Book" && form.ebookPdf instanceof File) {
      fileUrl = await uploadFile(form.ebookPdf);
    }

    if (form.youtubeLink) {
      content = form.youtubeLink;
    }

    /* ---- build DTO ---- */
    const dto = {
      typeId: TYPE_MAP[form.type],
      title: form.name,
      description,
      content,
      fileUrl,
      thumbnailUrl,
      categoryId: CATEGORY_MAP[form.courseCategory],
    };

    /* ---- CREATE OR UPDATE ---- */
    if (editing) {
      await axios.patch(`${API}/${editing}`, dto);
    } else {
      await axios.post(API, dto);
    }

    setShow(false);
    load();
  };

  /* -------------------------------------------------------
     DELETE
  -------------------------------------------------------- */
  const del = async (id: any) => {
    await axios.delete(`${API}/${id}`);
    load();
  };

  /* -------------------------------------------------------
     SEARCH FILTER
  -------------------------------------------------------- */
  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((x) =>
      x.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  /* -------------------------------------------------------
     TABLE
  -------------------------------------------------------- */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { header: "Name", accessorKey: "title" },
      { header: "Type", accessorKey: "typeId" },
      { header: "Category", accessorKey: "categoryId" },
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

  /* -------------------------------------------------------
     UI RENDER
  -------------------------------------------------------- */
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
                  previewImage: e.target.files?.[0] || "",
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
              {Object.keys(TYPE_MAP).map((t) => (
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
              {Object.keys(CATEGORY_MAP).map((c) => (
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

            {/* ARTICLE WITH IMAGES */}
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
                    const files = Array.from(e.target.files || []);
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
                          style={{ height: "150px", objectFit: "cover" }}
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
                    setForm({ ...form, ebookPdf: e.target.files?.[0] })
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
