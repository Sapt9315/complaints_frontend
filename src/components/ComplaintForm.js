import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Send, User, AlertTriangle, Package, Clock, DollarSign, Shield, Trash2 } from 'lucide-react';
import MobileImageUpload from './MobileImageUpload';

const ComplaintForm = () => {
  const { branchId } = useParams();
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [complaintNumber, setComplaintNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchedComplaintType = watch('complaintType');

  // Dynamic field configurations for each complaint type
  const complaintTypeFields = {
    product_quality: {
      icon: Package,
      title: "مشكلة جودة المنتج",
      fields: [
        { name: 'productName', label: 'اسم المنتج/الرقم التسلسلي *', type: 'text', required: true, placeholder: 'أدخل اسم المنتج أو الرقم التسلسلي' },
        { name: 'batchExpiryDate', label: 'تاريخ الإنتاج/الانتهاء', type: 'date', required: false },
        { name: 'purchaseDate', label: 'تاريخ الشراء *', type: 'date', required: true },
        { name: 'issueDescription', label: 'وصف المشكلة *', type: 'textarea', required: true, placeholder: 'اوصف مشكلة الجودة بالتفصيل' }
      ],
      imageRequired: true,
      imageLabel: 'رفع صورة للمنتج التالف/منتهي الصلاحية *'
    },
    service_issue: {
      icon: Clock,
      title: "مشكلة في الخدمة",
      fields: [
        { name: 'serviceType', label: 'نوع الخدمة *', type: 'select', required: true, options: ['التوصيل', 'الصندوق', 'مكتب المساعدة', 'خدمة العملاء', 'أخرى'] },
        { name: 'incidentDateTime', label: 'تاريخ ووقت الحادث *', type: 'datetime-local', required: true },
        { name: 'employeeName', label: 'اسم الموظف/الرقم التسلسلي (إن أمكن)', type: 'text', required: false, placeholder: 'أدخل اسم الموظف أو الرقم التسلسلي' },
        { name: 'issueDescription', label: 'وصف المشكلة *', type: 'textarea', required: true, placeholder: 'اوصف مشكلة الخدمة' }
      ],
      imageRequired: false,
      imageLabel: 'رفع صورة (الإيصال، لقطة شاشة)'
    },
    staff_behavior: {
      icon: Shield,
      title: "سلوك الموظفين",
      fields: [
        { name: 'staffName', label: 'اسم الموظف/الرقم التسلسلي (إن أمكن)', type: 'text', required: false, placeholder: 'أدخل اسم الموظف أو الرقم التسلسلي' },
        { name: 'incidentDateTime', label: 'تاريخ ووقت الحادث *', type: 'datetime-local', required: true },
        { name: 'complaintDetails', label: 'تفاصيل الشكوى *', type: 'textarea', required: true, placeholder: 'اوصف مشكلة السلوك' },
        { name: 'witnesses', label: 'الشهود (إن وجدوا)', type: 'text', required: false, placeholder: 'أسماء أي شهود' }
      ],
      imageRequired: false,
      imageLabel: 'رفع صورة (إن وجدت أدلة ذات صلة)'
    },
    pricing_dispute: {
      icon: DollarSign,
      title: "نزاع في الأسعار",
      fields: [
        { name: 'productName', label: 'اسم المنتج/الرقم التسلسلي *', type: 'text', required: true, placeholder: 'أدخل اسم المنتج أو الرقم التسلسلي' },
        { name: 'receiptPrice', label: 'السعر على الإيصال *', type: 'number', required: true, placeholder: '0.00', step: '0.01' },
        { name: 'expectedPrice', label: 'السعر المتوقع/المعروض *', type: 'number', required: true, placeholder: '0.00', step: '0.01' },
        { name: 'incidentDateTime', label: 'التاريخ والوقت *', type: 'datetime-local', required: true },
        { name: 'proofOfOffer', label: 'إثبات العرض/الخصم', type: 'text', required: false, placeholder: 'اوصف العرض أو الخصم' }
      ],
      imageRequired: true,
      imageLabel: 'رفع صورة الإيصال وعلامة السعر *'
    },
    cleanliness: {
      icon: Trash2,
      title: "النظافة/الصحة",
      fields: [
        { name: 'locationInStore', label: 'الموقع في المتجر *', type: 'select', required: true, options: ['دورة المياه', 'الممر', 'الطاولة', 'الموقف', 'المدخل', 'أخرى'] },
        { name: 'incidentDateTime', label: 'التاريخ والوقت *', type: 'datetime-local', required: true },
        { name: 'issueDetails', label: 'تفاصيل المشكلة *', type: 'textarea', required: true, placeholder: 'اوصف مشكلة النظافة' }
      ],
      imageRequired: true,
      imageLabel: 'رفع صورة للمنطقة القذرة *'
    },
    waiting_time: {
      icon: Clock,
      title: "وقت انتظار طويل",
      fields: [
        { name: 'serviceType', label: 'نوع الخدمة *', type: 'select', required: true, options: ['الفوترة', 'خدمة العملاء', 'المرتجعات', 'مكتب المساعدة', 'أخرى'] },
        { name: 'incidentDateTime', label: 'التاريخ والوقت *', type: 'datetime-local', required: true },
        { name: 'waitingDuration', label: 'مدة الانتظار (بالدقائق) *', type: 'number', required: true, placeholder: '30', min: '1' },
        { name: 'issueDescription', label: 'وصف المشكلة', type: 'textarea', required: false, placeholder: 'تفاصيل إضافية حول الانتظار' }
      ],
      imageRequired: false,
      imageLabel: 'رفع صورة (صورة الطابور، رقم التذكرة)'
    },
    other: {
      icon: AlertTriangle,
      title: "مشكلة أخرى",
      fields: [
        { name: 'issueDescription', label: 'وصف المشكلة *', type: 'textarea', required: true, placeholder: 'يرجى وصف مشكلتك بالتفصيل' }
      ],
      imageRequired: false,
      imageLabel: 'رفع صورة (إن أمكن)'
    }
  };

  useEffect(() => {
    fetchBranches();
    if (branchId) {
      fetchBranchDetails();
    }
  }, [branchId, fetchBranchDetails]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/branches/active');
      console.log('Fetched branches:', response.data);
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching active branches, trying all branches:', error);
      try {
        // Fallback to all branches if active endpoint fails
        const fallbackResponse = await axios.get('http://localhost:3000/api/branches');
        const allBranches = fallbackResponse.data.branches || fallbackResponse.data;
        console.log('Fetched all branches as fallback:', allBranches);
        setBranches(allBranches);
      } catch (fallbackError) {
        console.error('Error fetching all branches:', fallbackError);
        toast.error('Failed to load branches');
      }
    }
  };

  const fetchBranchDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/branches/${branchId}`);
      setBranch(response.data.branch);
    } catch (error) {
      console.error('Error fetching branch details:', error);
      toast.error('Failed to load branch information');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Extract only the dynamic fields (exclude basic form fields)
      const basicFields = ['customerName', 'customerPhone', 'branchId', 'complaintType', 'priority', 'description', 'purchaseDate'];
      const dynamicFields = Object.keys(data).reduce((acc, key) => {
        if (!basicFields.includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      const submitData = {
        ...data,
        branchId: data.branchId,
        description: data.description || 'No description provided', // Fallback description
        dynamicFields: dynamicFields,
        attachments: (uploadedFiles || []).map(file => ({
          imageUrl: file.imageUrl,
          publicId: file.publicId
        }))
      };

      console.log('Submitting complaint data:', submitData);

      const response = await axios.post('http://localhost:3000/api/complaints', submitData);
      
      setComplaintNumber(response.data.complaintNumber);
      setIsSubmitted(true);
      reset();
      toast.success('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error.response?.data?.details) {
        toast.error(`Validation Error: ${error.response.data.details}`);
      } else {
        toast.error('Failed to submit complaint. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تقديم الشكوى بنجاح!</h2>
          <p className="text-gray-600 mb-4">
            شكراً لك على إبلاغنا بهذا الأمر. سنراجع شكواك وسنعود إليك قريباً.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>رقم الشكوى:</strong> {complaintNumber}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              يرجى حفظ هذا الرقم لمتابعة حالة شكواك.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn btn-primary"
          >
            تقديم شكوى أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noor, Arial, sans-serif' }}>
            نموذج شكاوى العملاء
          </h1>
          <p className="text-gray-600">
            نقدر ملاحظاتكم وملتزمون بحل أي مشاكل قد تكونوا واجهتموها.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 ml-2" />
              معلومات العميل
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input
                  type="text"
                  className={`form-input ${errors.customerName ? 'border-red-500' : ''}`}
                  {...register('customerName', { 
                    required: 'الاسم مطلوب',
                    minLength: { value: 2, message: 'يجب أن يكون الاسم حرفين على الأقل' }
                  })}
                  placeholder="أدخل اسمك الكامل"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input
                  type="tel"
                  className={`form-input ${errors.customerPhone ? 'border-red-500' : ''}`}
                  {...register('customerPhone', {
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'تنسيق رقم الهاتف غير صحيح'
                    }
                  })}
                  placeholder="+966 50 123 4567"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">موقع الفرع *</label>
              <select
                className={`form-input form-select ${errors.branchId ? 'border-red-500' : ''}`}
                {...register('branchId', { required: 'يرجى اختيار فرع' })}
              >
                <option value="">اختر فرعك</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name} - {branch.city}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="text-red-500 text-sm mt-1">{errors.branchId.message}</p>
              )}
            </div>
          </div>

          {/* Complaint Details */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 ml-2" />
              تفاصيل الشكوى
            </h2>

            <div className="form-group">
              <label className="form-label">نوع الشكوى *</label>
              <select
                className={`form-input form-select ${errors.complaintType ? 'border-red-500' : ''}`}
                {...register('complaintType', { required: 'يرجى اختيار نوع الشكوى' })}
              >
                <option value="">اختر نوع الشكوى</option>
                <option value="product_quality">مشكلة جودة المنتج</option>
                <option value="service_issue">مشكلة في الخدمة</option>
                <option value="staff_behavior">سلوك الموظفين</option>
                <option value="pricing_dispute">نزاع في الأسعار</option>
                <option value="cleanliness">النظافة/الصحة</option>
                <option value="waiting_time">وقت انتظار طويل</option>
                <option value="other">أخرى</option>
              </select>
              {errors.complaintType && (
                <p className="text-red-500 text-sm mt-1">{errors.complaintType.message}</p>
              )}
            </div>

            {/* Dynamic Fields Based on Complaint Type */}
            {watchedComplaintType && complaintTypeFields[watchedComplaintType] && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  {React.createElement(complaintTypeFields[watchedComplaintType].icon, { className: "h-5 w-5 mr-2" })}
                  {complaintTypeFields[watchedComplaintType].title}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaintTypeFields[watchedComplaintType].fields.map((field) => (
                    <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                      <label className="form-label">{field.label}</label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false 
                          })}
                          placeholder={field.placeholder}
                        />
                      )}
                      
                      {field.type === 'number' && (
                        <input
                          type="number"
                          className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false,
                            min: field.min ? { value: field.min, message: `Minimum value is ${field.min}` } : undefined
                          })}
                          placeholder={field.placeholder}
                          step={field.step}
                          min={field.min}
                        />
                      )}
                      
                      {field.type === 'date' && (
                        <input
                          type="date"
                          className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false 
                          })}
                        />
                      )}
                      
                      {field.type === 'datetime-local' && (
                        <input
                          type="datetime-local"
                          className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false 
                          })}
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          className={`form-input form-select ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false 
                          })}
                        >
                          <option value="">Select {field.label.replace(' *', '').toLowerCase()}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea
                          className={`form-input form-textarea ${errors[field.name] ? 'border-red-500' : ''}`}
                          {...register(field.name, { 
                            required: field.required ? `${field.label.replace(' *', '')} is required` : false,
                            minLength: field.required ? { value: 10, message: 'Description must be at least 10 characters' } : undefined
                          })}
                          placeholder={field.placeholder}
                          rows="3"
                        />
                      )}
                      
                      {errors[field.name] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field.name].message}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Image Upload Section */}
                <div className="mt-6">
                  <MobileImageUpload
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    maxImages={5}
                    required={complaintTypeFields[watchedComplaintType].imageRequired}
                    label={complaintTypeFields[watchedComplaintType].imageLabel}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Receipt className="h-5 w-5 ml-2" />
              معلومات إضافية (اختياري)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">تاريخ الشراء</label>
                <input
                  type="date"
                  className="form-input"
                  {...register('purchaseDate')}
                />
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-8 py-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="loading mr-2"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  تقديم الشكوى
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
