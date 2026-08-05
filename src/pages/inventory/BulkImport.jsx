import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Trash2
} from "lucide-react";

const BulkImport = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImported(false);
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setImported(false);
      setResults(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImport = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImported(true);
      setResults({
        total: 45,
        success: 42,
        failed: 3,
        errors: [
          { row: 12, message: "Invalid price format" },
          { row: 23, message: "SKU already exists" },
          { row: 38, message: "Category not found" }
        ]
      });
    }, 3000);
  };

  const downloadTemplate = () => {
    alert("Downloading template CSV file...");
  };

  const removeFile = () => {
    setFile(null);
    setImported(false);
    setResults(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Bulk Import Products</h1>
          <p className="text-gray-600 font-medium text-sm">Import multiple products at once using CSV or Excel files</p>
        </div>
        <Link to="/inventory/products">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Products</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Import Area */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Upload File</h2>
            
            {/* File Upload Area */}
            {!file && (
              <div
                className="border-2 border-dashed border-blue-950/30 p-12 text-center hover:border-blue-950 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <Upload size={48} className="text-blue-950/30 mx-auto mb-4" />
                <p className="text-blue-950 font-bold text-lg">Drop your file here</p>
                <p className="text-gray-600 font-medium text-sm">or click to browse</p>
                <p className="text-gray-500 text-xs font-medium mt-2">Supported formats: .csv, .xlsx, .xls</p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* File Preview */}
            {file && (
              <div className="border-2 border-blue-950/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={32} className="text-blue-950" />
                    <div>
                      <p className="font-bold text-blue-950">{file.name}</p>
                      <p className="text-sm text-gray-600 font-medium">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!imported && (
                      <button
                        onClick={removeFile}
                        className="text-red-800 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <span className={`px-2 py-1 text-xs font-bold ${file ? 'bg-green-800 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {file ? 'Ready' : 'No File'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Import Button */}
            {file && !imported && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full mt-4 bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload size={18} />
                    Start Import
                  </>
                )}
              </button>
            )}

            {/* Import Results */}
            {imported && results && (
              <div className="mt-4 border-2 border-green-800/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-green-800" />
                  <h3 className="font-bold text-green-800">Import Completed</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-950">{results.total}</p>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total</p>
                  </div>
                  <div className="bg-green-50 p-3 text-center border-l-2 border-green-800">
                    <p className="text-2xl font-bold text-green-800">{results.success}</p>
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Success</p>
                  </div>
                  <div className="bg-red-50 p-3 text-center border-l-2 border-red-800">
                    <p className="text-2xl font-bold text-red-800">{results.failed}</p>
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Failed</p>
                  </div>
                </div>
                {results.errors.length > 0 && (
                  <div className="border-2 border-red-800/20 p-3">
                    <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Errors
                    </h4>
                    <div className="space-y-1">
                      {results.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-red-800">Row {error.row}:</span>
                          <span className="text-gray-700">{error.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Instructions</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">1.</span>
                <p className="text-gray-700 font-medium">Download the template file below</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">2.</span>
                <p className="text-gray-700 font-medium">Fill in your product data in the template</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">3.</span>
                <p className="text-gray-700 font-medium">Upload the completed file</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">4.</span>
                <p className="text-gray-700 font-medium">Review the import results</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Template</h2>
            <button
              onClick={downloadTemplate}
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Template CSV
            </button>
            <div className="mt-3 text-xs text-gray-500 font-medium">
              <p>Required fields: Name, SKU, Category, Price, Stock</p>
              <p>Optional: Cost, Reorder, Description, Supplier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;