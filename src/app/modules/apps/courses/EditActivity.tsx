import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../../_metronic/helpers";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { QuillEditor } from "./QuillEditor"; // Ensure this path is correct for your project
import axios from "axios";

// --- 1. DEFINE ACTIVITY TYPE ENUM ---
enum ActivityType {
  PDF_FILE = "PDF_FILE",
  VIDEO_FILE = "VIDEO_FILE",
  H5P = "H5P",
  WEB_URL = "WEB_URL",
  YOUTUBE_LINK = "YOUTUBE_LINK",
  PAGE = "PAGE",
  CERTIFICATE = "CERTIFICATE",
  FEEDBACK = "FEEDBACK", // Added Feedback Type
}

// --- 2. CONFIGURATION ---
const BASE_API_URL = "https://mypadminapi.bitmyanmar.info/api";
const MINIO_UPLOAD_PUBLIC = `${BASE_API_URL}/files/upload-public-folder`;
const MINIO_UPLOAD_H5P = `${BASE_API_URL}/files/upload-h5p`;
const CERTIFICATE_TEMPLATES_URL = `${BASE_API_URL}/certificate-templates`; // Template API
const FEEDBACK_TEMPLATES_URL = `${BASE_API_URL}/feedback-templates`; // Feedback API

export const EditActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // IDs from URL
  const courseId = searchParams.get("id");
  const activityId = searchParams.get("activityId");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [type, setType] = useState<ActivityType>(ActivityType.PAGE);
  const [externalUrl, setExternalUrl] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [activityOrder, setActivityOrder] = useState(0);

  // Editor & Content States
  const [descriptionContent, setDescriptionContent] = useState("");
  const [pageContent, setPageContent] = useState(""); // Stores URL, Path, HTML, or Template ID

  // Template States
  const [templates, setTemplates] = useState<any[]>([]);
  const [feedbackTemplates, setFeedbackTemplates] = useState<any[]>([]); // Added for Feedback
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Helper: Detect type based on API response data
  const determineTypeFromApi = (act: any): ActivityType => {
    const rawType = act.type;
    const typeStr = (
      typeof rawType === "string" ? rawType : rawType?.name || ""
    ).toUpperCase();

    if (typeStr in ActivityType) return typeStr as ActivityType;

    // Fallback logic
    if (act.content) {
      if (
        act.content.includes("youtube.com") ||
        act.content.includes("youtu.be")
      ) {
        return ActivityType.YOUTUBE_LINK;
      }
      if (act.content.endsWith(".pdf")) {
        return ActivityType.PDF_FILE;
      }
    }
    return ActivityType.PAGE;
  };

  // --- 3. Fetch Data (Activity & Templates) ---
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // Fetch both Certificate and Feedback templates
        const [certRes, feedbackRes] = await Promise.all([
          axios.get(CERTIFICATE_TEMPLATES_URL),
          axios.get(FEEDBACK_TEMPLATES_URL),
        ]);
        setTemplates(certRes.data);
        setFeedbackTemplates(feedbackRes.data);
      } catch (err) {
        console.error("Failed to fetch templates", err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();

    if (!courseId || !activityId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_API_URL}/courses/${courseId}`);
        const data = res.data;

        let foundActivity: any = null;
        let foundSectionId: string = "";

        if (data.CourseSection && Array.isArray(data.CourseSection)) {
          for (const section of data.CourseSection) {
            const match = section.activities?.find(
              (act: any) => act.id === activityId
            );
            if (match) {
              foundActivity = match;
              foundSectionId = section.id;
              break;
            }
          }
        }

        if (foundActivity) {
          setName(foundActivity.title);
          setSectionId(foundSectionId);
          setActivityOrder(foundActivity.order || 0);

          const mappedType = determineTypeFromApi(foundActivity);
          setType(mappedType);
          setDescriptionContent(foundActivity.description || "");

          const content = foundActivity.content || "";

          if (
            mappedType === ActivityType.PAGE ||
            mappedType === ActivityType.CERTIFICATE ||
            mappedType === ActivityType.FEEDBACK
          ) {
            setPageContent(content);
          } else if (
            mappedType === ActivityType.WEB_URL ||
            mappedType === ActivityType.YOUTUBE_LINK
          ) {
            setExternalUrl(content);
          } else {
            setPageContent(content);
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

  // --- 4. Handle File Upload Logic ---
  const handleFileUpload = async (
    file: File,
    targetType: ActivityType
  ): Promise<void> => {
    if (!file) return;

    setUploadingFile(true);
    setError(null);

    try {
      if (targetType === ActivityType.H5P) {
        if (!activityId) {
          throw new Error("Activity ID is missing. Cannot upload H5P.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("activityId", activityId);

        const response = await axios.post(MINIO_UPLOAD_H5P, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const result = response.data.data;
        setPageContent(result.playerUrl);

        alert("H5P Package uploaded and extracted successfully!");
      } else {
        const folderName = `activity-${targetType
          .toLowerCase()
          .replace("_file", "s")}`;
        const formData = new FormData();
        formData.append("folder", folderName);
        formData.append("files", file);

        const response = await axios.post(MINIO_UPLOAD_PUBLIC, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const uploadedUrls = response.data.urls;

        if (uploadedUrls && uploadedUrls.length > 0) {
          setPageContent(uploadedUrls[0]);
          alert("File uploaded successfully!");
        } else {
          throw new Error("Upload successful but no URL returned.");
        }
      }
    } catch (err: any) {
      console.error("File Upload Error:", err);
      const apiMessage =
        err.response?.data?.message || "Failed to upload file.";
      setError(
        `Upload Error: ${
          Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
        }`
      );
      setPageContent("");
    } finally {
      setUploadingFile(false);
    }
  };

  // --- 5. Handle Save ---
  const handleSave = async (redirect: boolean) => {
    if (!name) {
      alert("Name is required");
      return;
    }
    if (uploadingFile) {
      alert("Please wait for the file upload to complete.");
      return;
    }

    setSubmitting(true);
    try {
      let finalContent = "";

      switch (type) {
        case ActivityType.PAGE:
        case ActivityType.CERTIFICATE:
        case ActivityType.FEEDBACK: // Handles saving Feedback template ID
          finalContent = pageContent;
          break;
        case ActivityType.WEB_URL:
        case ActivityType.YOUTUBE_LINK:
          finalContent = externalUrl;
          break;
        case ActivityType.PDF_FILE:
        case ActivityType.VIDEO_FILE:
        case ActivityType.H5P:
          finalContent = pageContent;
          if (!finalContent) {
            alert("File/Content is missing. Please upload a file.");
            setSubmitting(false);
            return;
          }
          break;
        default:
          finalContent = "";
      }

      const payload = {
        title: name,
        type: type,
        content: finalContent,
        order: activityOrder,
        sectionId: sectionId,
        description: descriptionContent,
      };

      await axios.patch(`${BASE_API_URL}/activities/${activityId}`, payload);

      if (redirect) {
        navigate(-1);
      } else {
        alert("Saved successfully!");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      const apiMessage =
        err.response?.data?.message || "Failed to save activity.";
      alert(
        `Error: ${
          Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-10">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <KTCard className="m-3">
      <KTCardBody>
        <Form>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* NAME */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Name</Form.Label>
            <Form.Control
              placeholder="Enter activity name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting || uploadingFile}
            />
          </Form.Group>

          {/* DESCRIPTION */}
          <Form.Group className="mb-13">
            <Form.Label className="fw-bold fs-6">Description</Form.Label>
            <QuillEditor
              value={descriptionContent}
              onChange={setDescriptionContent}
              height={180}
            />
          </Form.Group>

          {/* TYPE SELECTOR */}
          <Form.Group className="mb-5">
            <Form.Label className="required fw-bold fs-6">Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as ActivityType);
                setPageContent(""); // Reset content on type change
                setExternalUrl("");
              }}
              disabled={submitting || uploadingFile}
            >
              <option value={ActivityType.PAGE}>Page</option>
              <option value={ActivityType.PDF_FILE}>PDF File</option>
              <option value={ActivityType.VIDEO_FILE}>Video File</option>
              <option value={ActivityType.H5P}>H5P Interactive Content</option>
              <option value={ActivityType.WEB_URL}>Web URL</option>
              <option value={ActivityType.YOUTUBE_LINK}>YouTube Link</option>
              <option value={ActivityType.CERTIFICATE}>Certificate</option>
              <option value={ActivityType.FEEDBACK}>Feedback</option>
            </Form.Select>
          </Form.Group>

          {/* --- DYNAMIC INPUT FIELDS BASED ON TYPE --- */}

          {/* 1. FILE UPLOAD (PDF, VIDEO, H5P) */}
          {(type === ActivityType.PDF_FILE ||
            type === ActivityType.VIDEO_FILE ||
            type === ActivityType.H5P) && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                Upload{" "}
                {type === ActivityType.H5P
                  ? "H5P Package"
                  : type === ActivityType.PDF_FILE
                  ? "PDF File"
                  : "Video File"}
                {uploadingFile && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="ms-2"
                    variant="primary"
                  />
                )}
              </Form.Label>
              <div className="p-4 border rounded bg-light">
                <Form.Control
                  type="file"
                  accept={
                    type === ActivityType.PDF_FILE
                      ? ".pdf"
                      : type === ActivityType.VIDEO_FILE
                      ? "video/*"
                      : ".h5p"
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, type);
                    }
                  }}
                  disabled={uploadingFile || submitting}
                />

                {pageContent && !pageContent.startsWith("<") && (
                  <div className="mt-3">
                    <div className="text-primary fw-bold">
                      File Uploaded Successfully
                    </div>
                    <div className="text-muted fs-7 text-break">
                      Path/URL: {pageContent}
                    </div>
                  </div>
                )}

                {type === ActivityType.H5P && (
                  <Alert variant="info" className="mt-3 mb-0">
                    <small>
                      Uploading will extract the contents to a private folder.
                    </small>
                  </Alert>
                )}
              </div>
            </Form.Group>
          )}

          {/* 2. RICH TEXT PAGE EDITOR */}
          {type === ActivityType.PAGE && (
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold fs-6">Page content</Form.Label>
              <div
                className="border rounded p-2 position-relative"
                style={{ borderRadius: "8px" }}
              >
                <QuillEditor
                  value={pageContent}
                  onChange={setPageContent}
                  height={300}
                />
              </div>
            </Form.Group>
          )}

          {/* 3. EXTERNAL LINKS (URL, YOUTUBE) */}
          {(type === ActivityType.WEB_URL ||
            type === ActivityType.YOUTUBE_LINK) && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                {type === ActivityType.YOUTUBE_LINK
                  ? "YouTube Link"
                  : "Web URL"}
              </Form.Label>
              <Form.Control
                placeholder="https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                disabled={submitting || uploadingFile}
              />
            </Form.Group>
          )}

          {/* 4. CERTIFICATE TEMPLATE SELECT BOX */}
          {type === ActivityType.CERTIFICATE && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                Available Templates
                {loadingTemplates && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </Form.Label>
              <Form.Select
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                disabled={submitting || loadingTemplates}
              >
                <option value="">-- Select Template --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.id})
                  </option>
                ))}
              </Form.Select>
              {pageContent && (
                <div className="mt-2 text-muted fs-7">
                  Selected Template ID: <strong>{pageContent}</strong>
                </div>
              )}
            </Form.Group>
          )}

          {/* 5. FEEDBACK TEMPLATE SELECT BOX */}
          {type === ActivityType.FEEDBACK && (
            <Form.Group className="mb-5">
              <Form.Label className="required fw-bold fs-6">
                Available Feedback Forms
                {loadingTemplates && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </Form.Label>
              <Form.Select
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                disabled={submitting || loadingTemplates}
              >
                <option value="">-- Select Feedback Template --</option>
                {feedbackTemplates.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name}
                  </option>
                ))}
              </Form.Select>
              {pageContent && (
                <div className="mt-2 text-muted fs-7">
                  Selected Feedback ID: <strong>{pageContent}</strong>
                </div>
              )}
            </Form.Group>
          )}

          {/* ACTION BUTTONS */}
          <div className="d-flex gap-3 mt-15">
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={submitting || uploadingFile}
            >
              {submitting ? "Saving..." : "Save and return to course"}
            </Button>
            <Button
              variant="success"
              onClick={() => handleSave(false)}
              disabled={submitting || uploadingFile}
            >
              {submitting ? "Saving..." : "Save and stay"}
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
