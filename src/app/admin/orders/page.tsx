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
  MapPin, Phone, Mail, User, Printer, ShoppingBag, Receipt, Download
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
    if (!selectedOrder) return;

    const dateStr = selectedOrder.createdAt 
      ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'N/A';

    const itemsRows = selectedOrder.items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: left;">${item.productName}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const emailRow = selectedOrder.email ? `<p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Email:</strong> ${selectedOrder.email}</p>` : '';
    const districtState = [selectedOrder.district, selectedOrder.state].filter(Boolean).join(', ');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Divya Urja</title>
            <style>
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none; }
              }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 40px;
                background-color: #fff;
              }
              .invoice-container {
                max-width: 750px;
                margin: 0 auto;
                background: #fff;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #f3f4f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo-area h1 {
                font-family: Georgia, serif;
                font-size: 28px;
                color: #851C1C;
                margin: 0 0 5px 0;
                font-weight: bold;
              }
              .logo-area p {
                margin: 2px 0;
                font-size: 12px;
                color: #666;
              }
              .invoice-details {
                text-align: right;
              }
              .invoice-details h2 {
                font-size: 24px;
                margin: 0 0 10px 0;
                color: #111;
                letter-spacing: 1px;
                font-weight: bold;
              }
              .invoice-details p {
                margin: 3px 0;
                font-size: 12px;
                color: #555;
              }
              .billing-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 35px;
                gap: 40px;
              }
              .info-block {
                flex: 1;
              }
              .info-block h3 {
                font-size: 11px;
                text-transform: uppercase;
                color: #999;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 6px;
                margin-bottom: 12px;
                letter-spacing: 0.5px;
                font-weight: bold;
              }
              .info-block p {
                margin: 4px 0;
                font-size: 13px;
                line-height: 1.5;
              }
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              .invoice-table th {
                background-color: #f9fafb;
                border-bottom: 2px solid #e5e7eb;
                padding: 12px 10px;
                text-align: left;
                font-size: 11px;
                font-weight: bold;
                color: #4b5563;
                text-transform: uppercase;
              }
              .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
              }
              .totals-table {
                width: 250px;
                border-collapse: collapse;
              }
              .totals-table td {
                padding: 8px 10px;
                font-size: 13px;
                color: #4b5563;
              }
              .totals-table tr.grand-total td {
                border-top: 2px solid #e5e7eb;
                font-weight: bold;
                font-size: 16px;
                color: #851C1C;
                padding-top: 10px;
              }
              .footer-note {
                margin-top: 50px;
                text-align: center;
                font-size: 11px;
                color: #9ca3af;
                border-top: 1px dashed #e5e7eb;
                padding-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <div class="logo-area">
                  <h1>DIVYA URJA</h1>
                  <p>Ancient Sciences & Spiritual Store</p>
                  <p>Akola, Maharashtra, India</p>
                  <p>Phone: +91 7218733125</p>
                  <p>Email: divyaurja37@gmail.com</p>
                </div>
                <div class="invoice-details">
                  <h2>INVOICE</h2>
                  <p><strong>Invoice ID:</strong> #${selectedOrder.id?.substring(0, 8).toUpperCase()}</p>
                  <p><strong>Date:</strong> ${dateStr}</p>
                  <p><strong>Status:</strong> ${selectedOrder.status.toUpperCase()}</p>
                </div>
              </div>

              <div class="billing-info">
                <div class="info-block">
                  <h3>Billed To</h3>
                  <p><strong>${selectedOrder.name}</strong></p>
                  <p>Phone: ${selectedOrder.phone}</p>
                  ${emailRow}
                </div>
                <div class="info-block">
                  <h3>Shipping Destination</h3>
                  <p><strong>${selectedOrder.address}</strong></p>
                  ${districtState ? `<p><strong>${districtState}</strong></p>` : ''}
                  ${selectedOrder.pincode ? `<p><strong>PIN: ${selectedOrder.pincode}</strong></p>` : ''}
                </div>
              </div>

              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Description</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <div class="totals-section">
                <table class="totals-table">
                  <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">₹${selectedOrder.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Shipping Charges:</td>
                    <td style="text-align: right;">₹${selectedOrder.shippingCharges.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr class="grand-total">
                    <td>Grand Total:</td>
                    <td style="text-align: right;">₹${selectedOrder.total.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </div>

              <div class="footer-note">
                <p>Thank you for shopping with Divya Urja!</p>
                <p>This is a computer generated invoice and requires no signature.</p>
              </div>
            </div>
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
  };

  const generateInvoiceHtml = (order: Order): string => {
    const invoiceId = order.id?.substring(0, 8).toUpperCase() || 'ORDER';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A';
    const isCompleted = order.status === 'completed';
    const statusText = order.status ? order.status.toUpperCase() : 'PENDING';

    const itemsRows = order.items
      .map(
        (item, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #000000;">${item.productName}</td>
          <td style="padding: 14px 16px; font-size: 14px; color: #1e293b; text-align: right; font-family: Arial, sans-serif;">Rs. ${item.price.toLocaleString('en-IN')}</td>
          <td style="padding: 14px 16px; font-size: 14px; color: #1e293b; text-align: center; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #000000; text-align: right; font-family: Arial, sans-serif;">Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    return `
      <div style="width: 730px; box-sizing: border-box; background: #ffffff; font-family: Arial, Helvetica, sans-serif; color: #000000; padding: 24px 12px;">
        <!-- Header Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: top; width: 55%;">
              <h1 style="font-size: 28px; font-weight: 900; color: #000000; margin: 0 0 4px 0; letter-spacing: 0.5px;">DIVYA URJA</h1>
              <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Ancient Sciences & Spiritual Store</p>
              <p style="font-size: 12px; color: #475569; margin: 0 0 4px 0;">Pune, Maharashtra, India</p>
              <p style="font-size: 12px; color: #475569; margin: 0 0 4px 0;">Phone: +91 98224 92488 | Email: info@divyaurja.in</p>
              <p style="font-size: 12px; color: #475569; margin: 0;">Website: https://divyaurja.in</p>
            </td>
            <td style="vertical-align: top; width: 45%; text-align: right;">
              <div style="display: inline-block; background-color: #000000; color: #ffffff; padding: 8px 20px; border-radius: 4px; font-size: 18px; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 12px;">TAX INVOICE</div>
              <p style="font-size: 13px; color: #000000; margin: 0 0 5px 0;"><strong>Invoice No:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold;">#${invoiceId}</span></p>
              <p style="font-size: 13px; color: #000000; margin: 0 0 10px 0;"><strong>Date:</strong> ${orderDate}</p>
              <div>
                <span style="background-color: ${isCompleted ? '#f1f5f9' : '#ffffff'}; color: #000000; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 800; display: inline-block; border: 1.5px solid #000000;">
                  STATUS: ${statusText}
                </span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Solid Black Divider Line -->
        <div style="height: 3px; background-color: #000000; margin-bottom: 24px; border-radius: 1px;"></div>

        <!-- Customer & Shipping Section -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 16px 0; margin-left: -16px; margin-right: -16px; margin-bottom: 28px;">
          <tr>
            <td style="width: 50%; vertical-align: top; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 6px; padding: 16px;">
              <p style="font-size: 11px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">BILLED TO (CUSTOMER)</p>
              <p style="font-size: 16px; font-weight: 800; color: #000000; margin: 0 0 6px 0;">${order.name}</p>
              <p style="font-size: 13px; color: #1e293b; margin: 0 0 4px 0;">Phone: <strong>${order.phone}</strong></p>
              ${order.email ? `<p style="font-size: 13px; color: #1e293b; margin: 0;">Email: ${order.email}</p>` : ''}
            </td>
            <td style="width: 50%; vertical-align: top; background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 6px; padding: 16px;">
              <p style="font-size: 11px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">SHIPPING DESTINATION</p>
              <p style="font-size: 13px; font-weight: 700; color: #000000; margin: 0 0 4px 0; line-height: 1.4;">${order.address}</p>
              ${(order.district || order.state) ? `<p style="font-size: 13px; color: #1e293b; margin: 0 0 4px 0;">${[order.district, order.state].filter(Boolean).join(', ')}</p>` : ''}
              ${order.pincode ? `<p style="font-size: 13px; font-weight: 700; color: #000000; margin: 0;">PIN Code: ${order.pincode}</p>` : ''}
            </td>
          </tr>
        </table>

        <!-- Products Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; border: 1.5px solid #000000; border-radius: 4px; overflow: hidden;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff;">
              <th style="padding: 14px 16px; text-align: left; width: 45%; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">Product Description</th>
              <th style="padding: 14px 16px; text-align: right; width: 20%; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">Unit Price</th>
              <th style="padding: 14px 16px; text-align: center; width: 15%; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">Qty</th>
              <th style="padding: 14px 16px; text-align: right; width: 20%; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Totals Section Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 36px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="background-color: #f8fafc; border: 1px solid #94a3b8; border-radius: 6px; padding: 14px 16px;">
                <p style="font-size: 12px; font-weight: 800; color: #000000; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Authenticity & Guarantee</p>
                <p style="font-size: 12px; color: #334155; margin: 0; line-height: 1.4;">All spiritual items are 100% natural, lab-certified, and spiritually energized prior to dispatch.</p>
              </div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
                <tr>
                  <td style="padding: 8px 14px; font-size: 13px; color: #475569; text-align: left;">Subtotal:</td>
                  <td style="padding: 8px 14px; font-size: 14px; font-weight: 700; color: #000000; text-align: right;">Rs. ${order.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 13px; color: #475569; text-align: left;">Shipping & Handling:</td>
                  <td style="padding: 8px 14px; font-size: 14px; font-weight: 700; color: #000000; text-align: right;">Rs. ${order.shippingCharges.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="border-top: 2px solid #000000; background-color: #f1f5f9;">
                  <td style="padding: 12px 14px; font-size: 16px; font-weight: 900; color: #000000; text-align: left;">Grand Total:</td>
                  <td style="padding: 12px 14px; font-size: 18px; font-weight: 900; color: #000000; text-align: right;">Rs. ${order.total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer Section -->
        <div style="border-top: 1.5px solid #000000; padding-top: 20px; text-align: center;">
          <p style="font-size: 14px; font-weight: 900; color: #000000; margin: 0 0 6px 0;">Thank you for choosing Divya Urja!</p>
          <p style="font-size: 12px; color: #334155; margin: 0 0 8px 0;">For queries regarding your order, please contact +91 98224 92488 or info@divyaurja.in</p>
          <p style="font-size: 11px; color: #64748b; margin: 0; font-style: italic;">* This is an official computer-generated tax invoice. No physical signature required.</p>
        </div>
      </div>
    `;
  };

  const loadJsPDF = async () => {
    const win = window as unknown as Record<string, any>;
    if (win.jspdf && win.jspdf.jsPDF) {
      return win.jspdf;
    }

    // Load jsPDF core
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load jsPDF core library.'));
      document.head.appendChild(script);
    });

    // Load jsPDF-AutoTable plugin
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load jsPDF AutoTable plugin.'));
      document.head.appendChild(script);
    });

    return (window as unknown as Record<string, any>).jspdf;
  };

  const handleDownloadPDF = async (orderTarget?: Order) => {
    const target = orderTarget || selectedOrder;
    if (!target) return;
    const toastId = toast.loading('Generating Invoice PDF...');

    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const invoiceId = target.id?.substring(0, 8).toUpperCase() || 'ORDER';
      const orderDate = target.createdAt ? new Date(target.createdAt).toLocaleDateString('en-IN') : 'N/A';
      const isCompleted = target.status === 'completed';

      // High-Contrast Monochrome Corporate Palette for B&W Printing
      const primaryColor: [number, number, number] = [0, 0, 0];        // Solid Black
      const darkText: [number, number, number] = [15, 23, 42];         // Dark Slate
      const grayText: [number, number, number] = [71, 85, 105];        // Dark Gray
      const lightBg: [number, number, number] = [248, 250, 252];       // Light Gray Fill
      const borderColor: [number, number, number] = [148, 163, 184];   // Medium Dark Gray Outline

      // 1. Header Left: Brand Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      doc.text('DIVYA URJA', 14, 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...darkText);
      doc.text('ANCIENT SCIENCES & SPIRITUAL STORE', 14, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grayText);
      doc.text('Pune, Maharashtra, India', 14, 31);
      doc.text('Phone: +91 98224 92488 | Email: info@divyaurja.in', 14, 36);
      doc.text('Website: https://divyaurja.in', 14, 41);

      // 2. Header Right: Invoice Badge & Details
      doc.setFillColor(...primaryColor);
      doc.roundedRect(145, 14, 51, 10, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('TAX INVOICE', 170.5, 20.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...darkText);
      doc.text(`Invoice No: #${invoiceId}`, 196, 29, { align: 'right' });
      doc.text(`Date: ${orderDate}`, 196, 35, { align: 'right' });

      // Status Badge Right (High-Contrast Black Outlined Box)
      const statusText = `STATUS: ${(target.status || 'PENDING').toUpperCase()}`;
      if (isCompleted) {
        doc.setFillColor(241, 245, 249); // Light Gray Fill
        doc.setDrawColor(0, 0, 0);       // Solid Black Outline
        doc.setTextColor(0, 0, 0);       // Solid Black Bold Text
      } else {
        doc.setFillColor(255, 255, 255); // Pure White Fill
        doc.setDrawColor(0, 0, 0);       // Solid Black Outline
        doc.setTextColor(0, 0, 0);       // Solid Black Bold Text
      }
      doc.setLineWidth(0.4);
      doc.roundedRect(145, 38, 51, 6, 1.5, 1.5, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, 170.5, 42.2, { align: 'center' });

      // Solid Black Divider Line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(14, 46, 196, 46);

      // 3. Customer & Shipping Info Card Containers
      // Billed To Box (Left)
      doc.setFillColor(...lightBg);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, 50, 88, 30, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('BILLED TO (CUSTOMER)', 18, 55);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...darkText);
      doc.text(target.name || 'N/A', 18, 62);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grayText);
      doc.text(`Phone: ${target.phone}`, 18, 68);
      if (target.email) {
        doc.text(`Email: ${target.email}`, 18, 74);
      }

      // Shipping Destination Box (Right)
      doc.setFillColor(...lightBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(108, 50, 88, 30, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('SHIPPING DESTINATION', 112, 55);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...darkText);
      const splitAddress = doc.splitTextToSize(target.address || '', 80);
      doc.text(splitAddress, 112, 62);

      const cityState = [target.district, target.state].filter(Boolean).join(', ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      if (cityState) {
        doc.text(cityState, 112, 69);
      }
      if (target.pincode) {
        doc.text(`PIN Code: ${target.pincode}`, 112, 75);
      }

      // 4. Products Table (jsPDF AutoTable Monochrome Header & Grid)
      const tableHead = [['Product Description', 'Unit Price', 'Qty', 'Amount']];
      const tableBody = target.items.map((item) => [
        item.productName,
        `Rs. ${item.price.toLocaleString('en-IN')}`,
        item.quantity.toString(),
        `Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`,
      ]);

      (doc as any).autoTable({
        startY: 85,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 0, 0], // Solid Black header bar
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
        },
        columnStyles: {
          0: { cellWidth: 90, halign: 'left' },
          1: { cellWidth: 32, halign: 'right' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 40, halign: 'right' },
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [0, 0, 0],
          lineColor: [180, 180, 180],
          lineWidth: 0.2,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 8;

      // 5. Authenticity Guarantee Box & Totals Summary Table
      // Authenticity box (Left)
      doc.setFillColor(...lightBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(14, finalY, 90, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text('AUTHENTICITY & GUARANTEE', 18, finalY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const authText = 'All spiritual items are 100% natural, lab-certified, and spiritually energized prior to dispatch.';
      doc.text(doc.splitTextToSize(authText, 82), 18, finalY + 12);

      // Totals Table (Right)
      const totalXLabel = 145;
      const totalXVal = 196;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...grayText);
      doc.text('Subtotal:', totalXLabel, finalY + 6);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${target.subtotal.toLocaleString('en-IN')}`, totalXVal, finalY + 6, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayText);
      doc.text('Shipping Fee:', totalXLabel, finalY + 12);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${target.shippingCharges.toLocaleString('en-IN')}`, totalXVal, finalY + 12, { align: 'right' });

      // Grand Total Highlight Bar (High Contrast Dark Box)
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.6);
      doc.roundedRect(138, finalY + 16, 58, 9, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Grand Total:', 140, finalY + 22);
      doc.text(`Rs. ${target.total.toLocaleString('en-IN')}`, totalXVal, finalY + 22, { align: 'right' });

      // 6. Footer Section
      const footerY = Math.max(finalY + 36, 268);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.6);
      doc.line(14, footerY, 196, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Thank you for choosing Divya Urja!', 105, footerY + 6, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...grayText);
      doc.text('For queries regarding your order, please contact +91 98224 92488 or info@divyaurja.in', 105, footerY + 11, { align: 'center' });
      doc.text('* This is an official computer-generated tax invoice. No signature required.', 105, footerY + 16, { align: 'center' });

      // Save PDF document directly
      doc.save(`DivyaUrja_Invoice_${invoiceId}.pdf`);
      toast.success('Invoice PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF invoice.', { id: toastId });
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
                {selectedOrder.email && (
                  <p className="text-sm text-text/60 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-text/40" /> {selectedOrder.email}
                  </p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-text/50 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Shipping Address
                </h3>
                <div className="text-sm text-text/70 leading-relaxed whitespace-pre-wrap">
                  <p className="font-semibold">{selectedOrder.address}</p>
                  {(selectedOrder.district || selectedOrder.state) && (
                    <p>{[selectedOrder.district, selectedOrder.state].filter(Boolean).join(', ')}</p>
                  )}
                  {selectedOrder.pincode && <p className="font-medium">PIN: {selectedOrder.pincode}</p>}
                </div>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-100 pt-5 gap-3">
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

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => handleDownloadPDF(selectedOrder)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white hover:bg-primary/95 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceModal(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 hover:bg-gray-50 text-text/75 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4" /> View Invoice
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, id: selectedOrder.id! })}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto">
            <button
              onClick={() => {
                setShowInvoiceModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg no-print cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="bg-white p-2">
              <div className="invoice-header flex justify-between border-b-2 border-primary/20 pb-4 mb-6">
                <div>
                  <h1 className="font-playfair text-2xl font-extrabold text-primary tracking-wide">DIVYA URJA</h1>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Ancient Sciences & Spiritual Store</p>
                  <p className="text-xs text-text/60 mt-1">Pune, Maharashtra, India</p>
                  <p className="text-xs text-text/60">Phone: +91 98224 92488 | Email: info@divyaurja.in</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-primary text-white text-xs font-extrabold px-3 py-1 rounded mb-2 tracking-widest uppercase">
                    INVOICE
                  </div>
                  <p className="text-xs font-semibold text-text/70">Invoice #: <span className="font-mono text-sm">#{selectedOrder.id?.substring(0, 8).toUpperCase()}</span></p>
                  <p className="text-xs text-text/50">Date: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p className="text-xs text-text/50 mt-1">
                    Status:{' '}
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedOrder.status ? selectedOrder.status.toUpperCase() : 'PENDING'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">BILLED TO (CUSTOMER)</h3>
                  <p className="text-sm font-bold text-text mb-1">{selectedOrder.name}</p>
                  <p className="text-xs text-text/70">Phone: <span className="font-medium text-text">{selectedOrder.phone}</span></p>
                  {selectedOrder.email && <p className="text-xs text-text/70 mt-0.5">Email: {selectedOrder.email}</p>}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">SHIPPING DESTINATION</h3>
                  <div className="text-xs text-text/80 leading-relaxed whitespace-pre-wrap">
                    <p className="font-semibold text-text">{selectedOrder.address}</p>
                    {(selectedOrder.district || selectedOrder.state) && (
                      <p className="text-text/70">{[selectedOrder.district, selectedOrder.state].filter(Boolean).join(', ')}</p>
                    )}
                    {selectedOrder.pincode && <p className="font-semibold text-text mt-0.5">PIN Code: {selectedOrder.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Billing Items Table */}
              <div className="overflow-x-auto mb-6 border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-primary text-white text-[11px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4 w-[45%]">Product Description</th>
                      <th className="py-3 px-4 w-[20%] text-right">Unit Price</th>
                      <th className="py-3 px-4 w-[15%] text-center">Qty</th>
                      <th className="py-3 px-4 w-[20%] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-3 px-4 font-semibold text-text">{item.productName}</td>
                        <td className="py-3 px-4 text-text/70 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-text/70 text-center font-medium">{item.quantity}</td>
                        <td className="py-3 px-4 font-bold text-text text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs max-w-xs">
                  <p className="font-bold text-green-800 uppercase text-[10px] mb-1">Authenticity & Guarantee</p>
                  <p className="text-green-700 text-[11px] leading-snug">All products are 100% natural, lab-certified, and spiritually energized.</p>
                </div>
                <div className="w-full sm:w-72 border-t border-gray-200 pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-text/60">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-text">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text/60">
                    <span>Shipping Fee:</span>
                    <span className="font-semibold text-text">₹{selectedOrder.shippingCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-primary bg-green-50/60 px-2 rounded-lg font-bold text-primary text-sm mt-2">
                    <span>Grand Total:</span>
                    <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print, Download PDF, and Close buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-4 no-print">
              <button
                onClick={() => handleDownloadPDF(selectedOrder)}
                className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-primary/95 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 border border-gray-200 text-text/75 text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                }}
                className="px-4 py-2.5 border border-gray-200 text-text/75 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
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
