'use client';

import { useState } from 'react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { updateOrder, deleteOrder } from '@/services/firestore';
import type { Order, OrderStatus } from '@/types';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { 
  Eye, Trash2, X, CheckCircle, XCircle, Clock, 
  MapPin, Phone, Mail, User, Printer, ShoppingBag, Receipt
} from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus; label: string; bg: string; text: string }[] = [
  { value: 'pending', label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
  { value: 'completed', label: 'Completed', bg: 'bg-green-50', text: 'text-green-700' },
  { value: 'cancelled', label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700' },
];

export default function AdminOrdersPage() {
  const { data: orders, loading } = useFirestoreCollection<Order>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter orders by active status tab
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrder(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      // Update local modal state if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOrder(deleteModal.id);
      toast.success('Order deleted successfully');
      if (selectedOrder && selectedOrder.id === deleteModal.id) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
    } catch {
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: '' });
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice')?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Create a temporary print stylesheet and content container
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - Divya Urja</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; }
                .invoice-header { display: flex; justify-between; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px; }
                .invoice-header h1 { font-family: Georgia, serif; font-size: 24px; color: #851C1C; margin: 0 0 5px 0; }
                .invoice-header p { font-size: 12px; color: #666; margin: 2px 0; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .details-box h3 { font-size: 13px; text-transform: uppercase; color: #999; margin: 0 0 10px 0; }
                .details-box p { font-size: 13px; line-height: 1.5; margin: 4px 0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { border-bottom: 1px solid #e5e7eb; padding: 12px 8px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; }
                td { padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .totals { float: right; width: 300px; margin-top: 10px; }
                .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
                .totals-row.grand-total { border-top: 2px solid #f3f4f6; font-weight: bold; font-size: 16px; color: #851C1C; padding-top: 12px; }
                .text-right { text-align: right; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (loading) return <Loader text="Loading orders list..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-text">Orders History</h1>
          <p className="text-sm text-text/50">{orders.length} total orders recorded</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text/50 hover:text-text'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {STATUS_OPTIONS.map((opt) => {
          const count = orders.filter((o) => o.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveTab(opt.value)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === opt.value
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-text/50 hover:text-text'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState title="No Orders" description="No orders matching this status were found." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const statusOpt = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];
                  const formattedDate = order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-text/70 uppercase">
                        #{order.id ? order.id.substring(0, 8) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text/60">{formattedDate}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-text">{order.name}</p>
                          <p className="text-xs text-text/40">{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-text">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateStatus(order.id!, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:ring-1 focus:ring-primary/20 bg-white ${statusOpt.bg} ${statusOpt.text} cursor-pointer disabled:opacity-50`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="completed">✅ Completed</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowInvoiceModal(true);
                            }}
                            className="p-2 hover:bg-secondary/10 text-secondary rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Receipt className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: order.id! })}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl mb-8 relative">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedOrder(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-bold">
                  Order Details <span className="font-mono text-sm text-text/40 uppercase">#{selectedOrder.id?.substring(0, 8)}</span>
                </h2>
                <p className="text-xs text-text/50">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-text/50 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer Info
                </h3>
                <p className="text-sm font-semibold text-text">{selectedOrder.name}</p>
                <p className="text-sm text-text/60 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-text/40" /> {selectedOrder.phone}
                </p>
                <p className="text-sm text-text/60 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-text/40" /> {selectedOrder.email}
                </p>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-text/50 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Shipping Address
                </h3>
                <p className="text-sm text-text/70 leading-relaxed whitespace-pre-wrap">{selectedOrder.address}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xs font-semibold text-text/50 uppercase tracking-wider">Items</h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50/50">
                    <div>
                      <p className="text-sm font-semibold text-text">{item.productName}</p>
                      <p className="text-xs text-text/40">₹{item.price.toLocaleString('en-IN')} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-text/40">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Details */}
            <div className="border-t border-gray-100 pt-4 flex flex-col items-end gap-2 text-sm text-text/60 mb-6">
              <div className="flex justify-between w-64">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-64">
                <span>Shipping Charges</span>
                <span>₹{selectedOrder.shippingCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-64 border-t border-gray-100 pt-2 font-bold text-text text-base">
                <span>Total</span>
                <span className="text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text/50">Order Status:</span>
                <select
                  value={selectedOrder.status}
                  disabled={updatingId === selectedOrder.id}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id!, e.target.value as OrderStatus)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 bg-white cursor-pointer"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowInvoiceModal(true);
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-text/75 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-4 h-4" /> View Invoice
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, id: selectedOrder.id! })}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl mb-8 relative">
            <button
              onClick={() => {
                setShowInvoiceModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="bg-white p-2">
              <div className="invoice-header flex justify-between border-b-2 border-gray-100 pb-4 mb-6">
                <div>
                  <h1 className="font-playfair text-xl font-bold text-red-800">DIVYA URJA</h1>
                  <p className="text-xs text-text/50">Ancient Sciences & Spiritual Store</p>
                  <p className="text-[11px] text-text/40">Pune, Maharashtra, India</p>
                  <p className="text-[11px] text-text/40">Email: billing@divyaurja.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-text uppercase tracking-wider mb-1">INVOICE</h2>
                  <p className="text-xs font-semibold text-text/60">Invoice: <span className="font-mono uppercase">#{selectedOrder.id?.substring(0, 8)}</span></p>
                  <p className="text-xs text-text/40">Date: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p className="text-xs text-text/40">Status: <span className="font-semibold capitalize text-primary">{selectedOrder.status}</span></p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="details-box">
                  <h3 className="text-xs font-bold text-text/40 uppercase mb-2">Billed To:</h3>
                  <p className="text-sm font-bold text-text">{selectedOrder.name}</p>
                  <p className="text-xs text-text/60">Phone: {selectedOrder.phone}</p>
                  <p className="text-xs text-text/60">Email: {selectedOrder.email}</p>
                </div>
                <div className="details-box">
                  <h3 className="text-xs font-bold text-text/40 uppercase mb-2">Shipping Destination:</h3>
                  <p className="text-xs text-text/70 whitespace-pre-wrap leading-relaxed">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Billing Items Table */}
              <table className="w-full text-left mb-6 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-xs font-bold text-text/50 uppercase">Description</th>
                    <th className="py-2 text-xs font-bold text-text/50 uppercase text-right">Unit Price</th>
                    <th className="py-2 text-xs font-bold text-text/50 uppercase text-center">Qty</th>
                    <th className="py-2 text-xs font-bold text-text/50 uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 text-sm font-semibold text-text">{item.productName}</td>
                      <td className="py-3 text-sm text-text/70 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-sm text-text/70 text-center">{item.quantity}</td>
                      <td className="py-3 text-sm font-semibold text-text text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="w-72 ml-auto border-t border-gray-100 pt-2">
                <div className="flex justify-between py-1 text-xs text-text/60">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-xs text-text/60">
                  <span>Shipping Fee:</span>
                  <span>₹{selectedOrder.shippingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-100 font-bold text-red-800 text-sm mt-1">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Print and Close buttons */}
            <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4 no-print">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-primary/95 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                }}
                className="px-5 py-2.5 border border-gray-200 text-text/75 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '' })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order Record"
      />
    </div>
  );
}
