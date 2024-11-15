"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const [otherDocumentType, setOtherDocumentType] = useState("");
  const [file, setFile] = useState(null);  // State to store the uploaded file
  const [previewSrc, setPreviewSrc] = useState("");  // State to store the preview image

  // Function to fetch and populate documents
  const fetchDocuments = async (page, itemsPerPage) => {
    try {
      const response = await fetch(
        `/api/documents?page=${page}&per_page=${itemsPerPage}`
      );
      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchDocuments(page, 5);
  }, [page]);

  // Function to handle OCR update
  const updateOCR = async (fileId) => {
    try {
      const response = await fetch(`/api/update_ocr/${fileId}`, {
        method: "POST",
      });
      const data = await response.json();
      alert(data.message);
      fetchDocuments(1, 5); // Refresh the document list
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    displayPreview(selectedFile);
  };

  const displayPreview = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewSrc(reader.result);
    };
  };

  return (
    <div className="container mx-auto p-6 pt-20 text-gray-900">
      <div className="flex flex-wrap gap-6">
        {/* Upload Document Section */}
        <div className="w-full md:w-full mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">Upload New Document</h4>
            <form
              method="post"
              action="/api/upload_document"
              encType="multipart/form-data"
            >
              <div className="mb-4">
                <label
                  htmlFor="document_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Document Type
                </label>
                <select
                  id="document_type"
                  name="document_type"
                  className="mt-2 p-2 border rounded-md w-full"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                >
                  <option value="">Select document type</option>
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="academic_transcript">
                    Academic Transcript
                  </option>
                  <option value="experience_certificate">
                    Experience Certificate
                  </option>
                  <option value="identification_card">
                    Identification Card
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>
              {documentType === "other" && (
                <div className="mb-4">
                  <label
                    htmlFor="other_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Specify Document Type
                  </label>
                  <input
                    type="text"
                    id="other_type"
                    name="other_type"
                    className="p-2 border rounded-md w-full"
                    value={otherDocumentType}
                    onChange={(e) => setOtherDocumentType(e.target.value)}
                  />
                </div>
              )}
              {/* File Upload with Drag-and-Drop */}
              <div className="mb-4 w-full relative border-2 border-gray-300 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 z-50"
                  onChange={handleFileChange}
                />
                <div className="text-center">
                  <img
                    className="mx-auto h-12 w-12"
                    src="https://www.svgrepo.com/show/357902/image-upload.svg"
                    alt=""
                  />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer"
                    >
                      <span>Drag and drop</span>
                      <span className="text-indigo-600"> or browse</span>
                      <span> to upload</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                {previewSrc && (
                  <img
                    src={previewSrc}
                    className="mt-4 mx-auto max-h-40"
                    alt="Preview"
                  />
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 w-full rounded-md hover:bg-blue-600"
              >
                Upload
              </button>
            </form>
          </div>
        </div>

        {/* Documents Table Section */}
        <div className="w-full">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">My Documents</h4>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Document Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date Uploaded</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        No documents uploaded
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.file_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{doc.type}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`badge ${
                              doc.status === "Verified"
                                ? "bg-green-500"
                                : doc.status === "Pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{doc.date_uploaded}</td>
                        <td className="px-4 py-2">
                          <a
                            href={`/view/${doc.file_id}`}
                            className="bg-blue-500 text-white py-1 px-3 rounded-md mr-2 hover:bg-blue-600"
                          >
                            View
                          </a>
                          <a
                            href={`/download/${doc.file_id}`}
                            className="bg-gray-500 text-white py-1 px-3 rounded-md mr-2 hover:bg-gray-600"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => updateOCR(doc.file_id)}
                            className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                          >
                            Update OCR
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <nav className="mt-6">
              <ul className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${
                      i + 1 === page ? "bg-blue-500 text-white" : ""
                    }`}
                  >
                    <a
                      href="#"
                      className="page-link p-2 text-sm cursor-pointer"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
