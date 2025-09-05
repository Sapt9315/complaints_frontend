import React, { useState, useRef } from 'react';
import { Camera, Image, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const MobileImageUpload = ({ 
  uploadedFiles, 
  setUploadedFiles, 
  maxImages = 5, 
  required = false,
  label = "رفع الصور"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > maxImages) {
      toast.error(`الحد الأقصى ${maxImages} صور مسموح`);
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} ليس ملف صورة`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} كبير جداً (الحد الأقصى 10 ميجابايت)`);
        }

        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axios.post('http://localhost:3000/api/upload/upload-single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return {
          file: file,
          imageUrl: response.data.imageUrl,
          publicId: response.data.publicId,
          id: Date.now() + Math.random() // Unique ID for React key
        };
      });
      
      const newUploadedFiles = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      toast.success(`تم رفع ${files.length} صورة بنجاح!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'فشل في رفع الصور. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    
    try {
      // Delete from Cloudinary
      if (fileToRemove?.publicId) {
        await axios.delete(`http://localhost:3000/api/upload/delete/${fileToRemove.publicId}`);
      }
      
      // Remove from state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('تم حذف الصورة بنجاح!');
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from state even if Cloudinary deletion fails
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast.error('فشل في حذف الصورة من السحابة، لكن تم حذفها من النموذج.');
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCameraInputChange = (e) => {
    handleFileUpload(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <label className="form-label flex items-center">
        <Image className="h-4 w-4 mr-2" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Drag and Drop Area (Desktop) */}
      <div
        className={`hidden md:block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading || uploadedFiles.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleGallerySelect}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragOver ? 'أفلت الصور هنا' : 'اسحب وأفلت الصور هنا'}
        </p>
        <p className="text-sm text-gray-500">
          أو انقر لتصفح الملفات
        </p>
      </div>

      {/* Mobile Upload Options */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {/* Camera Capture */}
        <button
          type="button"
          onClick={handleCameraCapture}
          disabled={isUploading || uploadedFiles.length >= maxImages}
          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm font-medium text-blue-700">التقاط صورة</span>
          <span className="text-xs text-gray-500">استخدم الكاميرا</span>
        </button>

        {/* Gallery Selection */}
        <button
          type="button"
          onClick={handleGallerySelect}
          disabled={isUploading || uploadedFiles.length >= maxImages}
          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image className="h-8 w-8 text-green-500 mb-2" />
          <span className="text-sm font-medium text-green-700">اختر من المعرض</span>
          <span className="text-xs text-gray-500">اختر الصور</span>
        </button>
      </div>

      {/* Desktop Upload Options */}
      <div className="hidden md:flex gap-3">
        <button
          type="button"
          onClick={handleCameraCapture}
          disabled={isUploading || uploadedFiles.length >= maxImages}
          className="flex items-center px-4 py-2 border border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-blue-700">الكاميرا</span>
        </button>

        <button
          type="button"
          onClick={handleGallerySelect}
          disabled={isUploading || uploadedFiles.length >= maxImages}
          className="flex items-center px-4 py-2 border border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm font-medium text-green-700">تصفح الملفات</span>
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700 font-medium">جاري رفع الصور...</span>
        </div>
      )}

      {/* Image Previews */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              الصور المرفوعة ({uploadedFiles.length}/{maxImages})
            </h4>
            {uploadedFiles.length >= maxImages && (
              <span className="text-xs text-red-500">تم الوصول للحد الأقصى</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={file.imageUrl} 
                    alt={`Upload ${file.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 rounded-b-lg">
                  <div className="truncate">{file.file.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="md:hidden">• اضغط "التقاط صورة" لالتقاط الصور بكاميرتك</p>
        <p className="md:hidden">• اضغط "اختر من المعرض" لاختيار الصور الموجودة</p>
        <p className="hidden md:block">• اسحب وأفلت الصور أو انقر على المنطقة أعلاه</p>
        <p className="hidden md:block">• استخدم أزرار الكاميرا/المعرض لرفع الصور على الطريقة المحمولة</p>
        <p>• الحد الأقصى {maxImages} صور مسموح (10 ميجابايت لكل صورة)</p>
        <p>• الصيغ المدعومة: JPG، PNG، GIF، WebP</p>
      </div>

      {/* Validation Error */}
      {required && uploadedFiles.length === 0 && (
        <p className="text-red-500 text-sm">مطلوب صورة واحدة على الأقل</p>
      )}
    </div>
  );
};

export default MobileImageUpload;
