import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import { Form, Button, Spinner } from "react-bootstrap";
import { QuillEditor } from "./QuillEditor";

// --- 1. DEFINE ACTIVITY TYPE ENUM ---
enum ActivityType {
  PDF_FILE = "PDF_FILE",
  VIDEO_FILE = "VIDEO_FILE",
  H5P = "H5P",
  WEB_URL = "WEB_URL",
  YOUTUBE_LINK = "YOUTUBE_LINK",
  PAGE = "PAGE",
}
// ------------------------------------

export const EditActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const courseId = searchParams.get("id");
  const activityId = searchParams.get("activityId");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  // --- 2. UPDATE STATE TYPE TO USE ENUM ---
  const [type, setType] = useState<ActivityType>(ActivityType.PAGE);
  const [externalUrl, setExternalUrl] = useState("");

  // STATE FOR EDITOR: Stores HTML string directly
  const [descriptionContent, setDescriptionContent] = useState("");
  const [pageContent, setPageContent] = useState("");

  // Helper to map API type strings to the ActivityType enum
  const mapApiTypeToEnum = (apiType: string): ActivityType => {
    switch (apiType?.toLowerCase()) {
      case "page":
        return ActivityType.PAGE;
      case "external_url":
        // API previously used 'external_url', we now map to the specific link types
        // Assuming for initial fetch, we check the content for external links later.
        // For simplicity, we default to WEB_URL if external_url is returned
        return ActivityType.WEB_URL;
      case "h5p":
        return ActivityType.H5P;
      case "file":
        // API previously used 'file', we now need to determine if PDF or VIDEO
        // This is a common API ambiguity. Defaulting to PDF_FILE for now.
        return ActivityType.PDF_FILE;
      default:
        return ActivityType.PAGE;
    }
  };

  // --- 3. Fetch Data ---
  useEffect(() => {
    if (!courseId || !activityId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://mypadminapi.bitmyanmar.info/api/courses/${courseId}`
        );
        const data = await res.json();

        let foundActivity: any = null;

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
          setName(foundActivity.title);

          const apiType = foundActivity.type?.toLowerCase() || "page";
          let mappedType = mapApiTypeToEnum(apiType);

          // Custom Logic for External URL & File: refine the mappedType
          if (apiType === "external_url") {
            const content = foundActivity.content || "";
            if (
              content.includes("youtube.com") ||
              content.includes("youtu.be")
            ) {
              mappedType = ActivityType.YOUTUBE_LINK;
            } else {
              mappedType = ActivityType.WEB_URL;
            }
            setExternalUrl(content === "NULL" ? "" : content);
          } else if (apiType === "file") {
            // A more robust app would check the file extension or metadata.
            // For now, we stick to the default PDF_FILE from the helper.
          }

          setType(mappedType);

          // Set description content
          const descHtml =
            foundActivity.description && foundActivity.description !== "NULL"
              ? foundActivity.description
              : "";
          setDescriptionContent(descHtml);

          let activityContent = foundActivity.content;

          // --- FIX: REPLACE BROKEN/UNSECURE IMAGE URL ---
          if (
            activityContent &&
            activityContent.includes("googleusercontent.com/profile/picture/0")
          ) {
            activityContent = activityContent.replace(
              "https://lh7-rt.googleusercontent.com/docsz/AD_4nXdGV6N0r4gNyELd8pkKAdtontkvzJFaXZ_GtiOB31w_D_xSbqLXBY6nz6NQsnobDtoODLsZ0JWPdA5uA9-AMQKmJULdYfntYwbfX3yAMzC17xkj4OAJhSLivY40J6Tif3UCWgi_8HqTdhpxmTQMFl4jFIva?key=qZ_NjqaYznpveBJTkPEcGw",
              "https://via.placeholder.com/624x523.png?text=Image+Placeholder+Loaded"
            );
          }
          // -------------------------------------------------------------------

          if (mappedType === ActivityType.PAGE) {
            // Set Page Content
            const contentHtml =
              activityContent && activityContent !== "NULL"
                ? activityContent
                : "";
            setPageContent(contentHtml);
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

  // --- 4. Handle Save ---
  const handleSave = async () => {
    const htmlDescription = descriptionContent;
    const htmlContent = pageContent;

    const payload = {
      courseId,
      activityId,
      title: name,
      // --- 5. SEND ENUM NAME (e.g., "PDF_FILE") TO THE API ---
      type: type,
      description: htmlDescription,
      content: type === ActivityType.PAGE ? htmlContent : externalUrl, // content for all link types and pages
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

          {/* DESCRIPTION (USING CUSTOM QUILL EDITOR) */}
          <Form.Group className="mb-5">
            <Form.Label className="fw-bold fs-6">Description</Form.Label>
            <div className="border rounded p-2" style={{ borderRadius: "8px" }}>
              <QuillEditor
                value={descriptionContent}
                onChange={setDescriptionContent}
                height={180} // Set the desired height
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
            <Form.Select
              value={type}
              // --- 6. UPDATE ONCHANGE TO USE ENUM VALUES ---
              onChange={(e) => setType(e.target.value as ActivityType)}
            >
              <option value={ActivityType.PAGE}>Page</option>
              <option value={ActivityType.PDF_FILE}>PDF File</option>
              <option value={ActivityType.VIDEO_FILE}>Video File</option>
              <option value={ActivityType.H5P}>H5P</option>
              <option value={ActivityType.WEB_URL}>Web URL</option>
              <option value={ActivityType.YOUTUBE_LINK}>YouTube Link</option>
            </Form.Select>
          </Form.Group>

          {/* ---------------- TYPE SPECIFIC FIELDS ---------------- */}

          {/* PDF FILE */}
          {(type === ActivityType.PDF_FILE ||
            type === ActivityType.VIDEO_FILE) && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">
                Upload{" "}
                {type === ActivityType.PDF_FILE ? "PDF File" : "Video File"}
              </Form.Label>
              <div className="p-4 border rounded bg-light">
                <Form.Control
                  type="file"
                  accept={type === ActivityType.PDF_FILE ? ".pdf" : "video/*"}
                />
                <small className="text-muted">
                  Accepted file types:
                  <strong>
                    {type === ActivityType.PDF_FILE
                      ? " PDF"
                      : " MP4, MOV, etc."}
                  </strong>
                </small>
              </div>
            </Form.Group>
          )}

          {/* H5P */}
          {type === ActivityType.H5P && (
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

          {/* PAGE (USING CUSTOM QUILL EDITOR) */}
          {type === ActivityType.PAGE && (
            <>
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Page content</Form.Label>
                <div
                  className="border rounded p-2"
                  style={{ borderRadius: "8px" }}
                >
                  <QuillEditor
                    value={pageContent}
                    onChange={setPageContent}
                    height={300} // Set the desired height
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

          {/* WEB URL / YOUTUBE LINK */}
          {(type === ActivityType.WEB_URL ||
            type === ActivityType.YOUTUBE_LINK) && (
            <>
              <Form.Group className="mb-5">
                <Form.Label className="required fw-bold fs-6">
                  {type === ActivityType.YOUTUBE_LINK
                    ? "YouTube Link"
                    : "Web URL"}
                </Form.Label>
                <Form.Control
                  placeholder={
                    type === ActivityType.YOUTUBE_LINK
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://example.com"
                  }
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-6">Display</Form.Label>
                <Form.Select>
                  {/* YouTube is usually embedded, Web URL can be new window */}
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
