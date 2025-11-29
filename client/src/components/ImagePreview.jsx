import React, { useState } from 'react';

export default function ImagePreview({ images, onRemove, maxImages = 5 }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              src={image.preview || URL.createObjectURL(image.file)}
              alt={`Evidence ${index + 1}`}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => setSelectedImage(image)}
            />
            
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              ×
            </button>

            {/* File size overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
              {formatFileSize(image.file.size)}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy reminder */}
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900 flex items-start gap-2">
          <span>🔒</span>
          <span>
            <strong>Privacy:</strong> All metadata (location, camera info, etc.) will be automatically removed from images for your safety.
          </span>
        </p>
      </div>

      {/* Image limit warning */}
      {images.length >= maxImages && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-900">
            Maximum {maxImages} images allowed. Remove an image to add more.
          </p>
        </div>
      )}

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.preview || URL.createObjectURL(selectedImage.file)}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

