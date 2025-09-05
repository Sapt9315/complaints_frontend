import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Download, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit3,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    branch_id: '',
    hasImages: '',
    limit: 50
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters, getAuthHeaders]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch complaints with filters
      const complaintParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) complaintParams.append(key, value);
      });
      
      const [complaintsRes, branchesRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/admin/complaints?${complaintParams}`, {
          headers: getAuthHeaders()
        }),
        axios.get('http://localhost:3000/api/branches'),
        axios.get('http://localhost:3000/api/admin/stats', {
          headers: getAuthHeaders()
        })
      ]);

      setComplaints(complaintsRes.data.complaints);
      setBranches(branchesRes.data.branches);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus, resolution) => {
    try {
      await axios.put(`http://localhost:3000/api/admin/complaints/${complaintId}/status`, {
        status: newStatus,
        resolution: resolution
      }, {
        headers: getAuthHeaders()
      });
      
      toast.success('تم تحديث حالة الشكوى بنجاح');
      setShowModal(false);
      setSelectedComplaint(null);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل في تحديث حالة الشكوى');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'limit') params.append(key, value);
      });
      
      const response = await axios.get(`http://localhost:3000/api/admin/export?${params}`, {
        responseType: 'blob',
        headers: getAuthHeaders()
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaints.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('تم تصدير الشكاوى بنجاح');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('فشل في تصدير الشكاوى');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'معلقة';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'محلولة';
      case 'closed': return 'مغلقة';
      default: return 'معلقة';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return 'متوسطة';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noor, Arial, sans-serif' }}>
          لوحة تحكم الإدارة
        </h1>
        <p className="text-gray-600">إدارة شكاوى العملاء ومتابعة أداء النظام</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الشكاوى</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">معلقة</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">محلولة</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">عاجلة</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 ml-2" />
            الفلاتر
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="btn btn-secondary"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </button>
            <button
              onClick={handleExport}
              className="btn btn-success"
            >
              <Download className="h-4 w-4 mr-2" />
              تصدير CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="form-label">الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-input form-select"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">معلقة</option>
              <option value="in_progress">قيد المعالجة</option>
              <option value="resolved">محلولة</option>
              <option value="closed">مغلقة</option>
            </select>
          </div>

          <div>
            <label className="form-label">الأولوية</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="form-input form-select"
            >
              <option value="">جميع الأولويات</option>
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>

          <div>
            <label className="form-label">الفرع</label>
            <select
              value={filters.branch_id}
              onChange={(e) => setFilters({...filters, branch_id: e.target.value})}
              className="form-input form-select"
            >
              <option value="">جميع الفروع</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">الصور</label>
            <select
              value={filters.hasImages}
              onChange={(e) => setFilters({...filters, hasImages: e.target.value})}
              className="form-input form-select"
            >
              <option value="">جميع الشكاوى</option>
              <option value="true">مع صور</option>
              <option value="false">بدون صور</option>
            </select>
          </div>

          <div>
            <label className="form-label">الحد الأقصى</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value})}
              className="form-input form-select"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">الشكاوى</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الشكوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأولوية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفرع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.complaintNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{complaint.customerName}</div>
                      {complaint.customerPhone && (
                        <div className="text-blue-600 font-medium">{complaint.customerPhone}</div>
                      )}
                      {complaint.customerEmail && (
                        <div className="text-gray-500">{complaint.customerEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {complaint.complaintType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`priority-badge ${getPriorityColor(complaint.priority)}`}>
                      {getPriorityText(complaint.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint.branchId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint.attachments && complaint.attachments.length > 0 ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex -space-x-1">
                          {complaint.attachments.slice(0, 3).map((attachment, index) => (
                            <img
                              key={index}
                              src={attachment.imageUrl}
                              alt={`الشكوى ${index + 1}`}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                              title={`Image ${index + 1}`}
                            />
                          ))}
                        </div>
                        {complaint.attachments.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{complaint.attachments.length - 3} more
                          </span>
                        )}
                        <span className="text-xs text-green-600 font-medium">
                          {complaint.attachments.length} image{complaint.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">لا توجد صور</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowModal(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {complaints.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No complaints found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Modal for viewing/editing complaint */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  تفاصيل الشكوى - {selectedComplaint.complaintNumber}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="form-label">Customer Name</label>
                  <p className="text-gray-900">{selectedComplaint.customerName}</p>
                </div>

                {selectedComplaint.customerPhone && (
                  <div>
                    <label className="form-label">Phone Number</label>
                    <p className="text-gray-900">{selectedComplaint.customerPhone}</p>
                  </div>
                )}

                <div>
                  <label className="form-label">Description</label>
                  <p className="text-gray-900">{selectedComplaint.description}</p>
                </div>

                {/* Dynamic Fields Display */}
                {selectedComplaint.dynamicFields && Object.keys(selectedComplaint.dynamicFields).length > 0 && (
                  <div>
                    <label className="form-label">Additional Details</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {Object.entries(selectedComplaint.dynamicFields).map(([key, value]) => (
                        value && (
                          <div key={key} className="mb-2">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span className="ml-2 text-gray-900">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments Display */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <label className="form-label">Attached Images ({selectedComplaint.attachments.length})</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedComplaint.attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={attachment.imageUrl} 
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(attachment.imageUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-2">
                              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 rounded-b-lg">
                            <div className="flex items-center justify-between">
                              <span>Image {index + 1}</span>
                              <span className="text-xs opacity-75">Click to enlarge</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Click on any image to view it in full size
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Current Status</label>
                  <span className={`status-badge ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>

                {selectedComplaint.resolution && (
                  <div>
                    <label className="form-label">الحل</label>
                    <p className="text-gray-900">{selectedComplaint.resolution}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const resolution = newStatus === 'resolved' ? 
                      prompt('Enter resolution details:') : 
                      selectedComplaint.resolution;
                    
                    if (newStatus && (newStatus !== 'resolved' || resolution)) {
                      handleStatusUpdate(selectedComplaint._id, newStatus, resolution);
                    }
                  }}
                  className="form-input form-select flex-1"
                >
                  <option value="">تحديث الحالة</option>
                  <option value="pending">معلقة</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">محلولة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
