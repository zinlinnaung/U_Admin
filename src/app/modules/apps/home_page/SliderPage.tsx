import React, { useState } from "react";
import { KTIcon } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap";

type Slider = {
  id: number;
  title: string;
  type: "course" | "web" | "news";
  listen: string;
  image: string;
};

export const SliderPage: React.FC = () => {
  // -------------------
  // State
  // -------------------
  const [sliders, setSliders] = useState<Slider[]>([
    {
      id: 1,
      title: "AI for Youth",
      type: "course",
      listen: "course-1",
      image:
        "data:image/jpeg;base64,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",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // -------------------
  // Handlers
  // -------------------
  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setPreview(slider.image);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setSliders(sliders.filter((s) => s.id !== id));
  };

  const handleAdd = () => {
    setEditingSlider(null);
    setPreview(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newSlider: Slider = {
      id: editingSlider ? editingSlider.id : Date.now(),
      title: formData.get("title") as string,
      type: formData.get("type") as "course" | "web" | "news",
      listen: formData.get("listen") as string,
      image: preview || "/media/illustrations/placeholder.png",
    };

    if (editingSlider) {
      setSliders(
        sliders.map((s) => (s.id === editingSlider.id ? newSlider : s))
      );
    } else {
      setSliders([...sliders, newSlider]);
    }

    setShowModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // -------------------
  // Render
  // -------------------
  return (
    <div className="card p-8 shadow-sm m-10">
      <div className="d-flex justify-content-between align-items-center mb-6">
        <h2 className="fw-bold text-dark">Slider Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <KTIcon iconName="plus" className="fs-2" /> Add Item
        </button>
      </div>

      <div className="table-responsive">
        <table className="table align-middle gs-0 gy-4">
          <thead>
            <tr className="fw-bold text-muted bg-light">
              <th className="min-w-100px">Image</th>
              <th className="min-w-150px">Title</th>
              <th className="min-w-100px">Type</th>
              <th className="min-w-150px">Listen</th>
              <th className="min-w-100px text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.map((slider) => (
              <tr key={slider.id}>
                <td>
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-100px h-60px rounded object-fit-cover"
                  />
                </td>
                <td>{slider.title}</td>
                <td>
                  <span className="badge badge-light-primary text-capitalize">
                    {slider.type}
                  </span>
                </td>
                <td>{slider.listen}</td>
                <td className="text-end">
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
                    onClick={() => handleEdit(slider)}
                  >
                    <KTIcon iconName="pencil" className="fs-3" />
                  </button>
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                    onClick={() => handleDelete(slider.id)}
                  >
                    <KTIcon iconName="trash" className="fs-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingSlider ? "Edit Item" : "Add Item"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form id="sliderForm" onSubmit={handleSave}>
            {/* Image Upload */}
            <div className="mb-4 text-center">
              <div className="image-input image-input-outline">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-250px h-150px rounded mb-3 object-fit-cover"
                  />
                ) : (
                  <div className="border rounded p-10 text-muted">
                    No image selected
                  </div>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="form-control mt-3"
                onChange={handleImageUpload}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label">Title</label>
                <input
                  name="title"
                  type="text"
                  className="form-control"
                  defaultValue={editingSlider?.title}
                  required
                />
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  className="form-select"
                  defaultValue={editingSlider?.type || "course"}
                >
                  <option value="course">Course</option>
                  <option value="web">Web</option>
                  <option value="news">News</option>
                </select>
              </div>

              <div className="col-12 mb-4">
                <label className="form-label">
                  Listen (Course ID / URL / New ID)
                </label>
                <input
                  name="listen"
                  type="text"
                  className="form-control"
                  defaultValue={editingSlider?.listen}
                />
              </div>
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SliderPage;
