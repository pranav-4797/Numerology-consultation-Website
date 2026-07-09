'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Sparkles, MapPin, Phone, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { orderSchema, type OrderFormData } from '@/schemas';
import { createOrder, getSiteSettings } from '@/services/firestore';
import type { Product } from '@/types';
import Loader from '@/components/ui/Loader';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('919822492488');

  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  // Load cart and WhatsApp number
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('divyaurja_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error parsing cart:', e);
    } finally {
      setLoadingCart(false);
    }

    async function fetchSettings() {
      try {
        const settings = await getSiteSettings();
        if (settings.whatsapp) {
          setWhatsappNumber(settings.whatsapp);
        }
      } catch (e) {
        console.error('Error fetching settings:', e);
      }
    }
    fetchSettings();
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCharges = 100;
  const total = subtotal + shippingCharges;

  const onSubmit = async (formData: OrderFormData) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        items: orderItems,
        subtotal,
        shippingCharges,
        total,
        status: 'pending' as const,
      };

      // Write order to Firestore
      const orderId = await createOrder(orderData);
      toast.success('Order placed successfully!');

      // Format WhatsApp message
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const itemsBillList = cart
        .map(
          (item) =>
            `• ${item.product.name} (x${item.quantity}) — ₹${(
              item.product.price * item.quantity
            ).toLocaleString('en-IN')}`
        )
        .join('\n');

      const messageContent = 
`🧾 *DIVYA URJA - ORDER BILL*
----------------------------------
*Order ID:* #${orderId.substring(0, 8).toUpperCase()}
*Date:* ${dateStr}

*Customer Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}

*Shipping Address:*
*${formData.address}*
*District: ${formData.district}*
*State: ${formData.state}*
*Pin Code: ${formData.pincode}*

*Items Ordered:*
${itemsBillList}

*Payment Summary:*
• Subtotal: ₹${subtotal.toLocaleString('en-IN')}
• Shipping Charges: ₹${shippingCharges.toLocaleString('en-IN')}
----------------------------------
*Grand Total: ₹${total.toLocaleString('en-IN')}*
----------------------------------
Thank you for your order! Please share payment confirmation details.`;

      // Clear cart
      localStorage.removeItem('divyaurja_cart');
      setCart([]);

      // Redirect to WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageContent)}`;
      window.open(whatsappUrl, '_blank');

      // Go back to catalogue page
      router.push('/catalogue');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCart) {
    return <Loader text="Loading checkout details..." />;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-text mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-text/50 mb-6">
            You cannot proceed to checkout without items. Head back to our catalogue and pick some sacred products.
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text/60 hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-playfair text-lg font-bold text-text">Shipping Details</h2>
                <p className="text-xs text-text/50">Enter the address where you want the products delivered</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-text/40" /> Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-text/40" /> Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text/40" /> Flat, House no., Building, Street Address
                </label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="e.g. Flat 102, Shanti Niwas, Sector 4"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    {...register('district')}
                    placeholder="e.g. Pune"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  />
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text/75 uppercase tracking-wider mb-2">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    {...register('pincode')}
                    placeholder="e.g. 411001"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      Confirm Order & Open WhatsApp Bill
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text/40 mt-4 bg-gray-50 py-3 px-4 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Your order details are secured and stored safely in our database.</span>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-playfair text-lg font-bold text-text">Order Summary</h3>
              <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-bold rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} Item(s)
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100 flex items-center justify-center">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-secondary/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text truncate">{item.product.name}</h4>
                    <p className="text-xs text-text/40 mt-0.5">
                      ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-text/80 self-center">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-text/50">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-text/50">
                <span>Shipping Charges</span>
                <span className="text-green-600 font-medium">₹{shippingCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-text">Total Price</span>
                <span className="text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Note */}
            <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-4 text-xs text-text/70 leading-relaxed">
              💡 *Important*: Divya Urja processes transactions via WhatsApp. Once you submit, we record this order in our system and direct you to WhatsApp to receive payment information (Google Pay/PhonePe) and complete your order confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
