import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers"; // Adjust path as needed
import { Form, Button, Spinner } from "react-bootstrap";

import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Helper to convert HTML string to EditorState
const createEditorStateFromHTML = (html: string | null) => {
  if (!html || html === "NULL") return EditorState.createEmpty();
  const blocksFromHTML = convertFromHTML(html);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  return EditorState.createWithContent(state);
};

export const EditActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Use for navigation

  // Get IDs from URL
  const courseId = searchParams.get("id");
  const activityId = searchParams.get("activityId");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [type, setType] = useState("page"); // default to page based on your common usage
  const [externalUrl, setExternalUrl] = useState("");

  // Editors
  const [descriptionEditorState, setDescriptionEditorState] = useState(
    EditorState.createEmpty()
  );
  const [contentEditorState, setContentEditorState] = useState(
    EditorState.createEmpty()
  );

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (!courseId || !activityId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://mypadminapi.bitmyanmar.info/api/courses/${courseId}`
        );
        const data = await res.json();

        // The API returns the whole course. We need to find the specific activity.
        let foundActivity: any = null;

        // Traverse sections to find activity
        if (data.CourseSection && Array.isArray(data.CourseSection)) {
          for (const section of data.CourseSection) {
            const match = section.activities?.find(
              (act: any) => act.id === activityId
            );
            if (match) {
              foundActivity = match;
              break;
            }
          }
        }

        if (foundActivity) {
          // --- 2. Populate State ---
          setName(foundActivity.title);

          // API type is usually UPPERCASE (e.g., "PAGE"), Component expects lowercase
          const apiType = foundActivity.type?.toLowerCase() || "page";
          setType(apiType);

          // Populate Editors
          setDescriptionEditorState(
            createEditorStateFromHTML(foundActivity.description)
          );

          if (apiType === "page") {
            setContentEditorState(
              createEditorStateFromHTML(foundActivity.content)
            );
          }

          // If you store External URL in 'content' or a specific field, map it here:
          if (apiType === "external_url") {
            setExternalUrl(
              foundActivity.content === "NULL" ? "" : foundActivity.content
            );
          }
        } else {
          setError("Activity not found in this course.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load activity details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, activityId]);

  // --- 3. Handle Save (Mock) ---
  const handleSave = async () => {
    // In a real app, you would convert EditorState back to HTML here:
    // import { stateToHTML } from 'draft-js-export-html';
    // const htmlDescription = stateToHTML(descriptionEditorState.getCurrentContent());

    const payload = {
      courseId,
      activityId,
      title: name,
      type: type.toUpperCase(), // API expects uppercase
      // description: htmlDescription...
    };

    console.log("Saving payload:", payload);
    alert("Check console for Save Payload");
    // await axios.put(...)
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-10">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-5">{error}</div>;
  }

  return (
    <KTCard className="m-3">
      <KTCardBody>
        <Form>
          {/* NAME */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Name</Form.Label>
            <Form.Control
              placeholder="Enter activity name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* DESCRIPTION */}
          <Form.Group className="mb-5">
            <Form.Label className="fw-bold fs-6">Description</Form.Label>
            <div
              className="border rounded p-2"
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                minHeight: 180,
              }}
            >
              <Editor
                editorState={descriptionEditorState}
                onEditorStateChange={setDescriptionEditorState}
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
              />
            </div>
            <Form.Check
              className="mt-3"
              type="checkbox"
              label="Display description on course page"
            />
          </Form.Group>

          {/* TYPE SELECT */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="file">File</option>
              <option value="h5p">H5P</option>
              <option value="external_url">External URL</option>
              <option value="page">Page</option>
            </Form.Select>
          </Form.Group>

          {/* ---------------- TYPE SPECIFIC FIELDS ---------------- */}

          {/* FILE */}
          {type === "file" && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">Upload File</Form.Label>
              <Form.Control type="file" />
            </Form.Group>
          )}

          {/* H5P */}
          {type === "h5p" && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                Package file
              </Form.Label>
              <div className="p-4 border rounded bg-light">
                <Form.Control type="file" accept=".h5p" />
                <small className="text-muted">
                  Accepted file types: <strong>H5P</strong>
                </small>
              </div>
            </Form.Group>
          )}

          {/* PAGE */}
          {type === "page" && (
            <>
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Page content</Form.Label>
                <div
                  className="border rounded p-2"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    minHeight: 200,
                  }}
                >
                  <Editor
                    editorState={contentEditorState}
                    onEditorStateChange={setContentEditorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                  />
                </div>
                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  label="Display page description"
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Availability</Form.Label>
                <Form.Select>
                  <option>Show on course page</option>
                  <option>Hide</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          {/* EXTERNAL URL */}
          {type === "external_url" && (
            <>
              <Form.Group className="mb-5">
                <Form.Label className="required fw-bold fs-6">
                  Link Type
                </Form.Label>
                <Form.Select>
                  <option value="youtube">YouTube</option>
                  <option value="weburl">Web URL</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="required fw-bold fs-6">
                  External URL
                </Form.Label>
                <Form.Control
                  placeholder="https://example.com"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Display</Form.Label>
                <Form.Select>
                  <option value="embed">Embed</option>
                  <option value="new">Open in new window</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          {/* FOOTER BUTTONS */}
          <div className="d-flex gap-3 mt-10">
            <Button variant="primary" onClick={handleSave}>
              Save and return to course
            </Button>
            <Button variant="success" onClick={handleSave}>
              Save and display
            </Button>
            <Button variant="danger" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </KTCardBody>
    </KTCard>
  );
};
