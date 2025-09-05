import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, MapPin, Phone, Mail, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BranchManagement = () => {
  const { getAuthHeaders } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    managerName: '',
    isActive: true
  });

  useEffect(() => {
    fetchBranches();
  }, [getAuthHeaders]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('https://complaints-backend-mhrr.onrender.com/api/branches', {
        headers: getAuthHeaders()
      });
      setBranches(response.data.branches || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBranch) {
        // Update existing branch
        await axios.put(`https://complaints-backend-mhrr.onrender.com/api/branches/${editingBranch._id}`, formData, {
          headers: getAuthHeaders()
        });
        toast.success('Branch updated successfully!');
      } else {
        // Create new branch
        await axios.post('https://complaints-backend-mhrr.onrender.com/api/branches', formData, {
          headers: getAuthHeaders()
        });
        toast.success('Branch created successfully!');
      }
      
      setShowForm(false);
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        managerName: '',
        isActive: true
      });
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(error.response?.data?.details || 'Failed to save branch');
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      isActive: branch.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to deactivate this branch?')) {
      try {
        await axios.delete(`https://complaints-backend-mhrr.onrender.com/api/branches/${branchId}`, {
          headers: getAuthHeaders()
        });
        toast.success('Branch deactivated successfully!');
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error('Failed to deactivate branch');
      }
    }
  };

  const handleRestore = async (branchId) => {
    try {
      await axios.patch(`https://complaints-backend-mhrr.onrender.com/api/branches/${branchId}/restore`, {}, {
        headers: getAuthHeaders()
      });
      toast.success('Branch restored successfully!');
      fetchBranches();
    } catch (error) {
      console.error('Error restoring branch:', error);
      toast.error('Failed to restore branch');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      managerName: '',
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-6 w-6 mr-2" />
                <span style={{ fontFamily: 'Noor, Arial, sans-serif' }}>إدارة الفروع</span>
              </h1>
              <p className="text-gray-600 mt-1">إدارة فروع السوبر ماركت</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Branch
            </button>
          </div>
        </div>

        {/* Branch Form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">اسم الفرع *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., Main Branch"
                />
              </div>

              <div>
                <label className="form-label">المدينة *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., New York"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">العنوان *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  required
                  rows="2"
                  placeholder="Full address of the branch"
                />
              </div>

              <div>
                <label className="form-label">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="branch@supermarket.com"
                />
              </div>

              <div>
                <label className="form-label">اسم المدير</label>
                <input
                  type="text"
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Branch manager name"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <label className="ml-2 text-sm text-gray-700">فرع نشط</label>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn btn-primary flex items-center">
                  <Save className="h-4 w-4 ml-2" />
                  {editingBranch ? 'تحديث الفرع' : 'إنشاء الفرع'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Branches List */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className={`border rounded-lg p-4 ${
                  branch.isActive === false ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit branch"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {branch.isActive !== false ? (
                      <button
                        onClick={() => handleDelete(branch._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Deactivate branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(branch._id)}
                        className="text-green-500 hover:text-green-700 p-1"
                        title="Restore branch"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{branch.address}, {branch.city}</span>
                  </div>
                  
                  {branch.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  
                  {branch.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{branch.email}</span>
                    </div>
                  )}
                  
                  {branch.managerName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{branch.managerName}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    branch.isActive === false 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {branch.isActive === false ? 'غير نشط' : 'نشط'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {branches.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first branch</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Branch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManagement;
