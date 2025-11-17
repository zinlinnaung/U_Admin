import React, { useState } from "react";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import { Form, Button } from "react-bootstrap";

import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export const EditActivity = () => {
  const [type, setType] = useState("file");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  return (
    <KTCard className="m-3">
      <KTCardBody>
        <Form>
          {/* NAME */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Name</Form.Label>
            <Form.Control placeholder="Enter activity name..." />
          </Form.Group>
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
                editorState={editorState}
                onEditorStateChange={setEditorState}
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

          {/* FILE UPLOAD */}
          {type === "file" && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">Upload File</Form.Label>
              <Form.Control type="file" />
            </Form.Group>
          )}
          {/* H5P BLOCK */}
          {type === "h5p" && (
            <>
              {/* PACKAGE FILE */}
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

              {/* OPTIONS: DOWNLOAD, EMBED, COPYRIGHT */}
              {/* <Form.Group className="mb-5">
                <Form.Check type="checkbox" label="Allow download" />
                <Form.Check type="checkbox" label="Embed button" />
                <Form.Check type="checkbox" label="Copyright button" />
              </Form.Group> */}

              {/* GRADE */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Grade</Form.Label>

                <Form.Select className="mb-3">
                  <option value="point">Point</option>
                </Form.Select>

                <Form.Control
                  type="number"
                  placeholder="Maximum grade"
                  defaultValue={100}
                />
              </Form.Group>

              {/* GRADE CATEGORY */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Grade category</Form.Label>
                <Form.Select>
                  <option>Uncategorised</option>
                </Form.Select>
              </Form.Group>

              {/* GRADE TO PASS */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Grade to pass</Form.Label>
                <Form.Control type="number" placeholder="0" />
              </Form.Group>

              {/* ENABLE ATTEMPT TRACKING */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Enable attempt tracking
                </Form.Label>
                <Form.Select>
                  <option>Yes</option>
                  <option>No</option>
                </Form.Select>
              </Form.Group>

              {/* GRADING METHOD */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Grading method</Form.Label>
                <Form.Select>
                  <option>Highest grade</option>
                  <option>Average grade</option>
                  <option>Last attempt</option>
                </Form.Select>
              </Form.Group>

              {/* REVIEW ATTEMPTS */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Review attempts
                </Form.Label>
                <Form.Select>
                  <option>Participants can review their own attempts</option>
                  <option>Do not allow review</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          {/* PAGE TYPE */}
          {type === "page" && (
            <>
              {/* PAGE CONTENT */}
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
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                  />
                </div>

                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  label="Display page description"
                />
                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  label="Display last modified date"
                  defaultChecked
                />
              </Form.Group>

              {/* AVAILABILITY */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Availability</Form.Label>
                <Form.Select>
                  <option>Show on course page</option>
                  <option>Hide</option>
                </Form.Select>
              </Form.Group>

              {/* ID NUMBER */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">ID number</Form.Label>
                <Form.Control placeholder="Optional ID..." />
              </Form.Group>

              {/* ACCESS RESTRICTIONS */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Access restrictions
                </Form.Label>
                <div className="p-3 border rounded bg-light">
                  <p className="mb-3">None</p>
                  <Button variant="primary" size="sm">
                    Add restriction...
                  </Button>
                </div>
              </Form.Group>

              {/* COMPLETION SETTINGS */}
              {/* <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Completion settings
                </Form.Label>

                <Form.Check
                  className="mb-2"
                  type="radio"
                  label="None"
                  name="completion"
                />
                <Form.Check
                  className="mb-2"
                  type="radio"
                  label="Students must manually mark the activity as done"
                  name="completion"
                />
                <Form.Check
                  className="mb-3"
                  type="radio"
                  label="Add requirements"
                  name="completion"
                />

                <div className="ms-4 p-3 border rounded">
                  <Form.Check
                    className="mb-2"
                    type="checkbox"
                    label="View the activity"
                  />
                </div>
              </Form.Group> */}

              {/* COURSE COMPETENCIES */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Course competencies
                </Form.Label>
                <Form.Select>
                  <option>No selection</option>
                </Form.Select>
              </Form.Group>

              {/* UPON ACTIVITY COMPLETION */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Upon activity completion
                </Form.Label>
                <Form.Select>
                  <option>Do nothing</option>
                  <option>Send notification</option>
                </Form.Select>

                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  label="Send content change notification"
                />
              </Form.Group>
            </>
          )}

          {/* EXTERNAL URL BLOCK */}
          {type === "external_url" && (
            <>
              {/* LINK TYPE */}
              <Form.Group className="mb-5">
                <Form.Label className="required fw-bold fs-6">
                  Link Type
                </Form.Label>
                <Form.Select>
                  <option value="youtube">YouTube</option>
                  <option value="weburl">Web URL</option>
                </Form.Select>
              </Form.Group>

              {/* EXTERNAL URL */}
              <Form.Group className="mb-5">
                <Form.Label className="required fw-bold fs-6">
                  External URL
                </Form.Label>
                <Form.Control placeholder="https://example.com" />
              </Form.Group>

              {/* DISPLAY */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Display</Form.Label>
                <Form.Select>
                  <option value="embed">Embed</option>
                  <option value="new">Open in new window</option>
                </Form.Select>

                <Form.Check
                  className="mt-3"
                  type="checkbox"
                  label="Display URL description"
                />
              </Form.Group>

              {/* AVAILABILITY */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Availability</Form.Label>
                <Form.Select>
                  <option>Show on course page</option>
                  <option>Hide</option>
                </Form.Select>
              </Form.Group>

              {/* ID NUMBER */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">ID Number</Form.Label>
                <Form.Control placeholder="Optional ID..." />
              </Form.Group>

              {/* ACCESS RESTRICTIONS */}
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">
                  Access restrictions
                </Form.Label>
                <div className="p-3 border rounded bg-light">
                  <p className="mb-3">None</p>
                  <Button variant="primary" size="sm">
                    Add restriction...
                  </Button>
                </div>
              </Form.Group>
            </>
          )}

          {/* FOOTER BUTTONS */}
          <div className="d-flex gap-3 mt-10">
            <Button variant="primary">Save and return to course</Button>
            <Button variant="success">Save and display</Button>
            <Button variant="danger">Cancel</Button>
          </div>
        </Form>
      </KTCardBody>
    </KTCard>
  );
};
