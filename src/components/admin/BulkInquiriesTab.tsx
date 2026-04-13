import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Package, 
  MessageCircle, 
  Calendar,
  Edit3,
  Check,
  X,
  Loader2,
  Filter
} from 'lucide-react';

interface BulkInquiry {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  estimated_quantity: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'quoted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
}

const BulkInquiriesTab: React.FC = () => {
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch bulk inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bulk_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedData = (data || []) as BulkInquiry[];
      setInquiries(typedData);
    } catch (err) {
      console.error('Error fetching bulk inquiries:', err);
      setError('Failed to load bulk inquiries');
    } finally {
      setLoading(false);
    }
  };

  // Update inquiry status
  const updateStatus = async (id: string, newStatus: BulkInquiry['status']) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from('bulk_inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id 
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // Update admin notes
  const updateAdminNotes = async (id: string, notes: string) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from('bulk_inquiries')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id 
            ? { ...inquiry, admin_notes: notes }
            : inquiry
        )
      );
      
      setEditingNotes(null);
      setTempNotes('');
    } catch (err) {
      console.error('Error updating notes:', err);
      setError('Failed to update notes');
    } finally {
      setUpdating(null);
    }
  };

  // Handle edit notes
  const handleEditNotes = (inquiry: BulkInquiry) => {
    setEditingNotes(inquiry.id);
    setTempNotes(inquiry.admin_notes || '');
  };

  // Handle save notes
  const handleSaveNotes = (id: string) => {
    updateAdminNotes(id, tempNotes);
  };

  // Handle cancel edit notes
  const handleCancelEdit = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => 
    filterStatus === 'all' || inquiry.status === filterStatus
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get stats
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    completed: inquiries.filter(i => i.status === 'completed').length
  };

  // Define valid statuses
  const validStatuses: BulkInquiry['status'][] = ['pending', 'contacted', 'quoted', 'completed', 'cancelled'];

  useEffect(() => {
    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Bulk Purchase Inquiries</h2>
        <Button onClick={fetchInquiries} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Package className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
            </div>
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by status:</span>
        </div>
        <div className="flex space-x-2">
          {['all', ...validStatuses].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bulk inquiries found</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{inquiry.company_name}</h3>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(inquiry.created_at)}
                  </div>
                </div>
                
                {/* Status Update Buttons */}
                <div className="flex space-x-2">
                  {validStatuses.map(status => (
                    <Button
                      key={status}
                      variant={inquiry.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(inquiry.id, status)}
                      disabled={updating === inquiry.id}
                    >
                      {updating === inquiry.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        status.charAt(0).toUpperCase() + status.slice(1)
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium ml-1">{inquiry.contact_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Email:</span>
                    <a href={`mailto:${inquiry.email}`} className="text-blue-600 ml-1 hover:underline">
                      {inquiry.email}
                    </a>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Phone:</span>
                    <a href={`tel:${inquiry.phone}`} className="text-blue-600 ml-1 hover:underline">
                      {inquiry.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium ml-1">{inquiry.estimated_quantity}</span>
                  </div>
                </div>
              </div>

              {/* Customer Message */}
              {inquiry.message && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Customer Message:
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {inquiry.message}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Edit3 className="h-4 w-4 mr-1" />
                    Admin Notes:
                  </div>
                  {editingNotes !== inquiry.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNotes(inquiry)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {editingNotes === inquiry.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add admin notes..."
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(inquiry.id)}
                        disabled={updating === inquiry.id}
                      >
                        {updating === inquiry.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    {inquiry.admin_notes || 'No admin notes yet...'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BulkInquiriesTab;