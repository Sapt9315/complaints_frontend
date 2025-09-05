import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Clock, CheckCircle, AlertCircle, XCircle, FileText } from 'lucide-react';

const ComplaintStatus = () => {
  const { complaintNumber } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState(complaintNumber || '');

  useEffect(() => {
    if (complaintNumber) {
      fetchComplaintStatus(complaintNumber);
    } else {
      setLoading(false);
    }
  }, [complaintNumber]);

  const fetchComplaintStatus = async (number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/complaints/status/${number}`);
      setComplaint(response.data.complaint);
    } catch (error) {
      console.error('Error fetching complaint status:', error);
      toast.error('Complaint not found or error occurred');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchNumber.trim()) {
      fetchComplaintStatus(searchNumber.trim());
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Status</h1>
          <p className="text-gray-600">
            Track the status of your complaint using your complaint number.
          </p>
        </div>

        {/* Search Form */}
        {!complaintNumber && (
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="Enter your complaint number (e.g., COMP-1234567890-ABCD)"
                className="form-input flex-1"
                required
              />
              <button type="submit" className="btn btn-primary">
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </form>
        )}

        {/* Complaint Details */}
        {complaint ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  {getStatusIcon(complaint.status)}
                  <span className="ml-2">Current Status</span>
                </h2>
                <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Complaint Number:</span>
                  <p className="text-gray-900">{complaint.complaintNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Priority:</span>
                  <p className={`priority-badge ${getPriorityColor(complaint.priority)} inline-block`}>
                    {complaint.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Submitted:</span>
                  <p className="text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                    {new Date(complaint.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <p className="text-gray-900">
                    {new Date(complaint.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(complaint.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Complaint Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Complaint Type:</span>
                  <p className="text-gray-900 capitalize">
                    {complaint.complaintType.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Description:</span>
                  <p className="text-gray-900 mt-1">{complaint.description}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Branch:</span>
                  <p className="text-gray-900">{complaint.branchName}</p>
                  <p className="text-sm text-gray-600">{complaint.branchAddress}</p>
                </div>
              </div>
            </div>

            {/* Resolution */}
            {complaint.resolution && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Resolution</h3>
                <p className="text-green-800">{complaint.resolution}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-blue-900">Complaint Submitted</p>
                    <p className="text-sm text-blue-700">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {complaint.status !== 'pending' && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-blue-900">Status Updated</p>
                      <p className="text-sm text-blue-700">
                        {new Date(complaint.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Need Help?</h3>
              <p className="text-yellow-800">
                If you have any questions about your complaint or need to provide additional information, 
                please contact the branch directly or visit our customer service desk.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaint Found</h3>
            <p className="text-gray-600">
              Please check your complaint number and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintStatus;
