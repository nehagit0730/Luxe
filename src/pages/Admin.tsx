import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Layers, 
  Settings, 
  Image as ImageIcon,
  Plus,
  Search,
  Bell,
  LogOut,
  FileText,
  LayoutTemplate,
  Navigation,
  Palette,
  Eye,
  Trash2,
  Copy,
  Edit,
  CheckCircle,
  XCircle,
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  ExternalLink,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Menu as MenuIcon,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Tooltip } from '../components/Tooltip';
import { MediaPicker } from '../components/MediaPicker';
import { cn, formatPrice } from '../lib/utils';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, where, limit, getDoc, setDoc } from 'firebase/firestore';
import { Product, Category, Order, User, Page, Menu } from '../types';

// --- Admin Sub-pages Components ---

const AdminHome = () => {
  const [stats, setStats] = React.useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const productsSnap = await getDocs(collection(db, 'products'));
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      
      // Auto-seed if empty
      if (productsSnap.empty) {
        const defaultCollections = [
          { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest premium pieces', createdAt: new Date().toISOString() },
          { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Stay cool and stylish', createdAt: new Date().toISOString() }
        ];
        
        for (const cat of defaultCollections) {
          const catRef = await addDoc(collection(db, 'categories'), cat);
          
          // Add 2 products per collection
          const products = [
            { 
              name: `${cat.name} Item 1`, 
              slug: `${cat.slug}-item-1`, 
              description: 'Premium quality essential for your wardrobe.', 
              price: 129, 
              stock: 50, 
              sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
              images: [`https://picsum.photos/seed/${cat.slug}1/800/1000`],
              categoryId: catRef.id,
              isFeatured: true,
              createdAt: new Date().toISOString()
            },
            { 
              name: `${cat.name} Item 2`, 
              slug: `${cat.slug}-item-2`, 
              description: 'Timeless design meets modern comfort.', 
              price: 199, 
              stock: 30, 
              sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
              images: [`https://picsum.photos/seed/${cat.slug}2/800/1000`],
              categoryId: catRef.id,
              isFeatured: false,
              createdAt: new Date().toISOString()
            }
          ];
          
          for (const prod of products) {
            await addDoc(collection(db, 'products'), prod);
          }
        }
      }

      let totalRev = 0;
      ordersSnap.forEach(doc => {
        totalRev += doc.data().total || 0;
      });

      setStats({
        revenue: totalRev,
        orders: ordersSnap.size,
        customers: usersSnap.size,
        products: productsSnap.size
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export Report</Button>
          <Button size="sm">Refresh Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.revenue), change: '+12.5%', icon: LayoutDashboard, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Orders', value: stats.orders.toString(), change: '+8.2%', icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
          { label: 'Total Customers', value: stats.customers.toString(), change: '+18.1%', icon: Users, color: 'bg-green-50 text-green-600' },
          { label: 'Total Products', value: stats.products.toString(), change: '0%', icon: Package, color: 'bg-orange-50 text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.color)}><stat.icon className="h-6 w-6" /></div>
              <span className="text-xs font-bold text-green-600 px-2 py-1 rounded-full bg-green-50">{stat.change}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-black mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-bold text-gray-400 hover:text-black">View All</Link>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Order #ORD-99{i}</p>
                    <p className="text-xs text-gray-400">Customer: John Doe</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black">$120.00</p>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Top Products</h3>
            <Link to="/admin/products" className="text-sm font-bold text-gray-400 hover:text-black">Manage Inventory</Link>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors overflow-hidden">
                    <img src={`https://picsum.photos/seed/prod${i}/100/100`} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Premium Item {i}</p>
                    <p className="text-xs text-gray-400">42 units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black">$299.00</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">In Stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Products Management ---
const AdminProducts = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    // User wants it to delete on click, but a small confirmation is safer.
    // I'll use a simple confirm for now as requested "on click it delete the product"
    // but I'll make it reactive.
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (product: Product) => {
    const { id, ...rest } = product;
    const newProduct = {
      ...rest,
      name: `${rest.name} (Copy)`,
      slug: `${rest.slug}-copy-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic update
    const tempId = 'temp-' + Math.random();
    setProducts(prev => [{ id: tempId, ...newProduct } as Product, ...prev]);
    
    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      setProducts(prev => prev.map(p => p.id === tempId ? { id: docRef.id, ...newProduct } as Product : p));
    } catch (err) {
      console.error(err);
      setProducts(prev => prev.filter(p => p.id !== tempId));
    }
  };

  if (isAdding || isEditing) {
    return (
      <ProductForm 
        product={isEditing} 
        onCancel={() => { setIsAdding(false); setIsEditing(null); }} 
        onSuccess={() => { setIsAdding(false); setIsEditing(null); fetchProducts(); }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory and product listings.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Inventory</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden border">
                        <img src={product.images[0] || 'https://picsum.photos/seed/prod/100/100'} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{product.name}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                      product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {product.stock} in stock
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-black">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Edit Product">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsEditing(product)}><Edit className="h-4 w-4" /></Button>
                      </Tooltip>
                      <Tooltip content="View in Store">
                        <Link to={`/product/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                      </Tooltip>
                      <Tooltip content="Duplicate">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleDuplicate(product)}><Copy className="h-4 w-4" /></Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-600" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductForm = ({ product, onCancel, onSuccess }: { product: Product | null, onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [collections, setCollections] = React.useState<Category[]>([]);
  const [showMediaPicker, setShowMediaPicker] = React.useState<{ activeIndex: number | null }>({ activeIndex: null });
  const [showPreview, setShowPreview] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    sku: product?.sku || '',
    images: product?.images || [],
    categoryId: product?.categoryId || '',
    isFeatured: product?.isFeatured || false,
    status: product?.status || 'active',
    variants: product?.variants || [],
    tags: product?.tags || []
  });

  React.useEffect(() => {
    const fetchCollections = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      setCollections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };
    fetchCollections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const data = {
        ...formData,
        slug,
        updatedAt: new Date().toISOString()
      };
      if (product) {
        await updateDoc(doc(db, 'products', product.id), data);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { id: Math.random().toString(36).substring(7), name: '', price: formData.price, stock: 0, sku: '' }]
    });
  };

  const removeVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants?.filter(v => v.id !== id)
    });
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      variants: formData.variants?.map(v => v.id === id ? { ...v, [field]: value } : v)
    });
  };

  if (showPreview) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowPreview(false)} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor</Button>
          <h2 className="text-2xl font-bold">Product Preview</h2>
          <Button onClick={handleSubmit} isLoading={loading}>Save Product</Button>
        </div>
        <div className="bg-white rounded-3xl border p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border">
                <img src={formData.images[0] || 'https://picsum.photos/seed/placeholder/800/1000'} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {formData.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-black tracking-tight">{formData.name || 'Product Name'}</h1>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(formData.price)}</p>
              </div>
              <p className="text-gray-500 leading-relaxed">{formData.description || 'No description provided.'}</p>
              {formData.variants && formData.variants.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.variants.map(v => (
                      <button key={v.id} className="px-4 py-2 rounded-xl border-2 border-gray-100 font-bold text-sm hover:border-black transition-all">
                        {v.name || 'Unnamed Variant'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button className="w-full h-14 rounded-2xl text-lg font-bold">Add to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button>
          <h1 className="text-3xl font-bold tracking-tight text-black">{product ? 'Edit Product' : 'Add Product'}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="rounded-full px-6">Preview</Button>
          <Button onClick={handleSubmit} className="rounded-full px-8" isLoading={loading}>Save Product</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Basic Information</h3>
            <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                className="w-full rounded-xl border border-gray-300 p-4 text-sm focus:ring-2 focus:ring-black min-h-[200px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Base Price ($)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
              <Input label="Total Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
            </div>
            <Input label="Base SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Media</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaPicker({ activeIndex: formData.images.length })} className="text-blue-600 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Add Media
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                  {img ? (
                    <>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100" onClick={() => setShowMediaPicker({ activeIndex: i })}>
                          <Edit className="h-4 w-4 text-black" />
                        </button>
                        <button type="button" className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50" onClick={() => {
                          const newImgs = [...formData.images];
                          newImgs.splice(i, 1);
                          setFormData({...formData, images: newImgs});
                        }}><Trash2 className="h-4 w-4 text-red-600" /></button>
                      </div>
                    </>
                  ) : (
                    <button type="button" className="w-full h-full flex flex-col items-center justify-center" onClick={() => setShowMediaPicker({ activeIndex: i })}>
                      <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Select</p>
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button"
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors group"
                onClick={() => setShowMediaPicker({ activeIndex: formData.images.length })}
              >
                <Plus className="h-6 w-6 text-gray-300 group-hover:text-black transition-colors" />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Variants</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </div>
            {formData.variants && formData.variants.length > 0 ? (
              <div className="space-y-4">
                {formData.variants.map((variant, i) => (
                  <div key={variant.id} className="p-6 rounded-2xl border bg-gray-50/50 flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-all">
                      {variant.image ? <img src={variant.image} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                    </div>
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <Input placeholder="Variant Name (e.g. Red / M)" value={variant.name} onChange={e => updateVariant(variant.id, 'name', e.target.value)} />
                      <Input placeholder="Price" type="number" value={variant.price} onChange={e => updateVariant(variant.id, 'price', Number(e.target.value))} />
                      <Input placeholder="Stock" type="number" value={variant.stock} onChange={e => updateVariant(variant.id, 'stock', Number(e.target.value))} />
                      <Input placeholder="SKU" value={variant.sku} onChange={e => updateVariant(variant.id, 'sku', e.target.value)} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-600 opacity-0 group-hover:opacity-100" onClick={() => removeVariant(variant.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-2xl">
                <p className="text-sm text-gray-400">No variants added. Add variants for size, color, etc.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Status & Visibility</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Product Status</label>
              <select 
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'draft' | 'archived'})}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <span className="text-sm font-medium">Featured Product</span>
              <input 
                type="checkbox" 
                checked={formData.isFeatured} 
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
              />
            </div>
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Organization</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Collection</label>
              <select 
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select Collection...</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="Tags" placeholder="Summer, New, Sale" value={formData.tags?.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} />
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showMediaPicker.activeIndex !== null && (
          <MediaPicker 
            onClose={() => setShowMediaPicker({ activeIndex: null })}
            onSelect={(url) => {
              const newImgs = [...formData.images];
              if (showMediaPicker.activeIndex! < newImgs.length) {
                newImgs[showMediaPicker.activeIndex!] = url;
              } else {
                newImgs.push(url);
              }
              setFormData({ ...formData, images: newImgs });
              setShowMediaPicker({ activeIndex: null });
            }}
            selectedUrls={formData.images}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CMS Pages Management ---
const AdminPages = () => {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState<Page | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);

  const fetchPages = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'pages'));
    setPages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page)));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pages', id));
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (page: Page) => {
    const { id, ...rest } = page;
    const newPage = {
      ...rest,
      title: `${rest.title} (Copy)`,
      slug: `${rest.slug}-copy-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic update
    const tempId = 'temp-' + Math.random();
    setPages(prev => [{ id: tempId, ...newPage } as Page, ...prev]);
    
    try {
      const docRef = await addDoc(collection(db, 'pages'), newPage);
      setPages(prev => prev.map(p => p.id === tempId ? { id: docRef.id, ...newPage } as Page : p));
    } catch (err) {
      console.error(err);
      setPages(prev => prev.filter(p => p.id !== tempId));
    }
  };

  if (isAdding || isEditing) {
    return (
      <PageForm 
        page={isEditing} 
        onCancel={() => { setIsAdding(false); setIsEditing(null); }} 
        onSuccess={() => { setIsAdding(false); setIsEditing(null); fetchPages(); }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage custom store pages.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Page
        </Button>
      </div>

      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Page Title</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">URL Slug</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Last Modified</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-bold text-black">{page.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">/{page.slug}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    page.status === 'published' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {page.status || 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(page.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Edit">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsEditing(page)}><Edit className="h-4 w-4" /></Button>
                    </Tooltip>
                    <Tooltip content="Preview">
                      <Link to={`/p/${page.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </Tooltip>
                    <Tooltip content="Duplicate">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDuplicate(page)}><Copy className="h-4 w-4" /></Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-600" onClick={() => handleDelete(page.id)}><Trash2 className="h-4 w-4" /></Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PageForm = ({ page, onCancel, onSuccess }: { page: Page | null, onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = React.useState<{ sectionIndex: number, field: string } | null>(null);
  const [formData, setFormData] = React.useState({
    title: page?.title || '',
    slug: page?.slug || '',
    status: page?.status || 'draft',
    sections: page?.sections || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      if (page) {
        await updateDoc(doc(db, 'pages', page.id), data);
      } else {
        await addDoc(collection(db, 'pages'), {
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSection = (type: string) => {
    const newSection = { 
      id: Math.random().toString(36).substring(7),
      type, 
      content: {
        title: 'New Section',
        text: 'Add your content here...',
        image: ''
      } 
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
    setActiveSection(formData.sections.length);
  };

  const removeSection = (index: number) => {
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData({ ...formData, sections: newSections });
    if (activeSection === index) setActiveSection(null);
  };

  const duplicateSection = (index: number) => {
    const section = formData.sections[index];
    const newSection = { ...section, id: Math.random().toString(36).substring(7) };
    const newSections = [...formData.sections];
    newSections.splice(index + 1, 0, newSection);
    setFormData({ ...formData, sections: newSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setFormData({ ...formData, sections: newSections });
    if (activeSection === index) setActiveSection(newIndex);
    else if (activeSection === newIndex) setActiveSection(index);
  };

  const updateSectionContent = (index: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = {
      ...newSections[index],
      content: { ...newSections[index].content, [field]: value }
    };
    setFormData({ ...formData, sections: newSections });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button>
          <h1 className="text-3xl font-bold tracking-tight text-black">{page ? 'Edit Page' : 'Create Page'}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-full px-6">Cancel</Button>
          <Button onClick={handleSubmit} className="rounded-full px-8" isLoading={loading}>Save Page</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Page Structure</h3>
            <div className="space-y-4">
              {formData.sections.length === 0 ? (
                <div className="p-12 border-2 border-dashed rounded-3xl text-center bg-gray-50">
                  <LayoutTemplate className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Your page is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Add sections from the sidebar to start building</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.sections.map((section, i) => (
                    <div 
                      key={section.id || i} 
                      className={cn(
                        "rounded-2xl border transition-all overflow-hidden",
                        activeSection === i ? "border-black ring-4 ring-black/5" : "border-gray-100 bg-white"
                      )}
                    >
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => setActiveSection(activeSection === i ? null : i)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-600">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400">{i + 1}</div>
                          <div>
                            <p className="font-bold text-black capitalize text-sm">{section.type.replace(/-/g, ' ')}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section.content.title || 'Untitled Section'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); moveSection(i, 'up'); }} disabled={i === 0}><Plus className="h-4 w-4 rotate-180" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); moveSection(i, 'down'); }} disabled={i === formData.sections.length - 1}><Plus className="h-4 w-4" /></Button>
                          <div className="w-px h-4 bg-gray-200 mx-1" />
                          <Tooltip content="Duplicate Section">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); duplicateSection(i); }}><Copy className="h-4 w-4" /></Button>
                          </Tooltip>
                          <Tooltip content="Remove Section">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={(e) => { e.stopPropagation(); removeSection(i); }}><Trash2 className="h-4 w-4" /></Button>
                          </Tooltip>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {activeSection === i && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-gray-50/50 p-6 space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <Input label="Section Title" value={section.content.title} onChange={e => updateSectionContent(i, 'title', e.target.value)} />
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content Text</label>
                                  <textarea 
                                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black min-h-[100px]"
                                    value={section.content.text}
                                    onChange={e => updateSectionContent(i, 'text', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Section Image</label>
                                <div 
                                  className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-white overflow-hidden cursor-pointer hover:bg-gray-50 transition-all group"
                                  onClick={() => setShowMediaPicker({ sectionIndex: i, field: 'image' })}
                                >
                                  {section.content.image ? (
                                    <img src={section.content.image} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <>
                                      <ImageIcon className="h-8 w-8 text-gray-200 mb-2" />
                                      <p className="text-[10px] font-bold text-gray-400 uppercase">Select Image</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Page Settings</h3>
            <Input 
              label="Page Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
              required 
            />
            <Input label="URL Slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select 
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Add Section</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { type: 'hero', icon: LayoutTemplate },
                { type: 'image-with-text', icon: ImageIcon },
                { type: 'featured-collection', icon: Package },
                { type: 'newsletter', icon: Bell },
                { type: 'rich-text', icon: FileText },
                { type: 'gallery', icon: ImageIcon },
                { type: 'faq', icon: FileText }
              ].map(item => (
                <button 
                  key={item.type}
                  type="button"
                  onClick={() => addSection(item.type)}
                  className="flex items-center justify-between p-4 rounded-2xl border hover:border-black hover:bg-gray-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                      <item.icon className="h-4 w-4 text-gray-400 group-hover:text-black" />
                    </div>
                    <span className="text-sm font-bold capitalize">{item.type.replace(/-/g, ' ')}</span>
                  </div>
                  <Plus className="h-4 w-4 text-gray-300 group-hover:text-black" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker 
            onClose={() => setShowMediaPicker(null)}
            onSelect={(url) => {
              updateSectionContent(showMediaPicker.sectionIndex, showMediaPicker.field, url);
              setShowMediaPicker(null);
            }}
            selectedUrls={[]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Collections Management ---
const AdminCollections = () => {
  const [collections, setCollections] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<Category | null>(null);

  const fetchCollections = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'categories'));
    setCollections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      await deleteDoc(doc(db, 'categories', id));
      setCollections(collections.filter(c => c.id !== id));
    }
  };

  const handleDuplicate = async (collectionData: Category) => {
    const { id, ...rest } = collectionData;
    const newCollection = {
      ...rest,
      name: `${rest.name} (Copy)`,
      slug: `${rest.slug}-copy-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic update
    const tempId = 'temp-' + Math.random();
    setCollections(prev => [{ id: tempId, ...newCollection } as Category, ...prev]);
    
    try {
      const docRef = await addDoc(collection(db, 'categories'), newCollection);
      setCollections(prev => prev.map(c => c.id === tempId ? { id: docRef.id, ...newCollection } as Category : c));
    } catch (err) {
      console.error(err);
      setCollections(prev => prev.filter(c => c.id !== tempId));
    }
  };

  if (isAdding || isEditing) {
    return (
      <CollectionForm 
        collectionData={isEditing} 
        onCancel={() => { setIsAdding(false); setIsEditing(null); }} 
        onSuccess={() => { setIsAdding(false); setIsEditing(null); fetchCollections(); }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Group your products into collections.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map(cat => (
          <div key={cat.id} className="p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all group">
            <div className="aspect-video rounded-2xl bg-gray-50 mb-4 overflow-hidden border relative">
              <img src={cat.image || `https://picsum.photos/seed/${cat.slug}/400/200`} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Tooltip content="View Collection">
                  <Link to={`/category/${cat.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white text-black hover:bg-gray-100"><ExternalLink className="h-5 w-5" /></Button>
                  </Link>
                </Tooltip>
              </div>
            </div>
            <h3 className="font-bold text-lg text-black">{cat.name}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description || 'No description'}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Collection</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Edit">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsEditing(cat)}><Edit className="h-4 w-4" /></Button>
                </Tooltip>
                <Tooltip content="Duplicate">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDuplicate(cat)}><Copy className="h-4 w-4" /></Button>
                </Tooltip>
                <Tooltip content="Delete">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-600" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CollectionForm = ({ collectionData, onCancel, onSuccess }: { collectionData: Category | null, onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: collectionData?.name || '',
    slug: collectionData?.slug || '',
    description: collectionData?.description || '',
    image: collectionData?.image || ''
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const pSnap = await getDocs(collection(db, 'products'));
      const allProducts = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(allProducts);
      
      if (collectionData) {
        setSelectedProducts(allProducts.filter(p => p.categoryId === collectionData.id).map(p => p.id));
      }
    };
    fetchData();
  }, [collectionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let collectionId = collectionData?.id;
      if (collectionData) {
        await updateDoc(doc(db, 'categories', collectionData.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        collectionId = docRef.id;
      }

      // Update products category association
      // This is a bit simplified, ideally we'd use a batch or more robust logic
      const productsToUpdate = products.filter(p => selectedProducts.includes(p.id) || p.categoryId === collectionId);
      for (const p of productsToUpdate) {
        const isSelected = selectedProducts.includes(p.id);
        await updateDoc(doc(db, 'products', p.id), {
          categoryId: isSelected ? collectionId : ''
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button>
          <h1 className="text-3xl font-bold tracking-tight text-black">{collectionData ? 'Edit Collection' : 'Add Collection'}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-full px-6">Cancel</Button>
          <Button onClick={handleSubmit} className="rounded-full px-8" isLoading={loading}>Save Collection</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Collection Details</h3>
            <Input 
              label="Collection Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
              required 
            />
            <Input label="Slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                className="w-full rounded-xl border border-gray-300 p-4 text-sm focus:ring-2 focus:ring-black min-h-[150px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Products in Collection</h3>
              <p className="text-sm text-gray-400">{selectedProducts.length} products selected</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all",
                    selectedProducts.includes(product.id) ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200"
                  )}
                  onClick={() => {
                    setSelectedProducts(prev => 
                      prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
                    );
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">{product.name}</p>
                    <p className="text-xs text-gray-400">{formatPrice(product.price)}</p>
                  </div>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedProducts.includes(product.id) ? "bg-black border-black" : "border-gray-200"
                  )}>
                    {selectedProducts.includes(product.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Featured Image</h3>
            <div 
              className="aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-all group"
              onClick={() => setShowMediaPicker(true)}
            >
              {formData.image ? (
                <div className="relative w-full h-full">
                  <img src={formData.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="sm" className="bg-white text-black">Change Image</Button>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400 uppercase">Select Image</p>
                </>
              )}
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker 
            onClose={() => setShowMediaPicker(false)}
            onSelect={(url) => {
              setFormData({ ...formData, image: url });
              setShowMediaPicker(false);
            }}
            selectedUrls={[formData.image]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Orders Management ---
const AdminOrders = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Orders</h1>
      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Customer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-black">#{order.id.slice(-8).toUpperCase()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.address.fullName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-black">{formatPrice(order.total)}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="font-bold">Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Customers Management ---
const AdminCustomers = () => {
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      setCustomers(snap.docs.map(doc => ({ ...doc.data() } as User)));
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Customers</h1>
      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Customer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Joined</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(customer => (
              <tr key={customer.uid} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                      {customer.displayName?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-bold text-black">{customer.displayName || 'Anonymous'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="font-bold">View Profile</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Appearance & CMS Settings ---
const AdminAppearance = () => {
  const [activeTab, setActiveTab] = React.useState<'header' | 'footer' | 'theme'>('header');
  const [settings, setSettings] = React.useState<any>(null);
  const [menus, setMenus] = React.useState<Menu[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showMediaPicker, setShowMediaPicker] = React.useState<{ tab: string, field: string } | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'settings', 'appearance');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setSettings({
          header: {
            logo: '',
            menuId: '',
            sticky: true,
            transparent: false,
            backgroundColor: '#ffffff',
            textColor: '#000000'
          },
          footer: {
            logo: '',
            backgroundColor: '#f9fafb',
            textColor: '#000000',
            copyright: '© 2026 Your Store. All rights reserved.',
            showNewsletter: true,
            menuId: ''
          },
          theme: {
            primaryColor: '#000000',
            borderRadius: '1.5rem',
            fontFamily: 'Inter'
          }
        });
      }

      const mSnap = await getDocs(collection(db, 'menus'));
      setMenus(mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Menu)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'appearance'), settings);
      // alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Appearance</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your store's look and feel.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} className="rounded-full px-6">
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-2">
          {[
            { id: 'header', label: 'Header', icon: LayoutTemplate },
            { id: 'footer', label: 'Footer', icon: LayoutTemplate },
            { id: 'theme', label: 'Theme Settings', icon: Palette },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-8">
          {activeTab === 'header' && (
            <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-8">
              <h3 className="text-xl font-bold">Header Configuration</h3>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logo</label>
                  <div 
                    className="h-24 w-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-all group"
                    onClick={() => setShowMediaPicker({ tab: 'header', field: 'logo' })}
                  >
                    {settings.header.logo ? (
                      <img src={settings.header.logo} alt="" className="h-full w-full object-contain p-4" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-300 mb-1" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Select Logo</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigation Menu</label>
                  <select 
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                    value={settings.header.menuId}
                    onChange={e => setSettings({...settings, header: {...settings.header, menuId: e.target.value}})}
                  >
                    <option value="">Select a menu</option>
                    {menus.map(menu => <option key={menu.id} value={menu.id}>{menu.title}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Background Color" 
                    type="color" 
                    value={settings.header.backgroundColor} 
                    onChange={e => setSettings({...settings, header: {...settings.header, backgroundColor: e.target.value}})} 
                  />
                  <Input 
                    label="Text Color" 
                    type="color" 
                    value={settings.header.textColor} 
                    onChange={e => setSettings({...settings, header: {...settings.header, textColor: e.target.value}})} 
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50">
                  <div>
                    <p className="text-sm font-bold">Sticky Header</p>
                    <p className="text-xs text-gray-400">Header stays at the top while scrolling</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, header: {...settings.header, sticky: !settings.header.sticky}})}
                    className={`h-6 w-11 rounded-full transition-colors relative ${settings.header.sticky ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${settings.header.sticky ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-8">
              <h3 className="text-xl font-bold">Footer Configuration</h3>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Footer Logo</label>
                  <div 
                    className="h-24 w-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100 transition-all group"
                    onClick={() => setShowMediaPicker({ tab: 'footer', field: 'logo' })}
                  >
                    {settings.footer.logo ? (
                      <img src={settings.footer.logo} alt="" className="h-full w-full object-contain p-4" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-300 mb-1" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Select Logo</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Footer Menu</label>
                  <select 
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                    value={settings.footer.menuId}
                    onChange={e => setSettings({...settings, footer: {...settings.footer, menuId: e.target.value}})}
                  >
                    <option value="">Select a menu</option>
                    {menus.map(menu => <option key={menu.id} value={menu.id}>{menu.title}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Background Color" 
                    type="color" 
                    value={settings.footer.backgroundColor} 
                    onChange={e => setSettings({...settings, footer: {...settings.footer, backgroundColor: e.target.value}})} 
                  />
                  <Input 
                    label="Text Color" 
                    type="color" 
                    value={settings.footer.textColor} 
                    onChange={e => setSettings({...settings, footer: {...settings.footer, textColor: e.target.value}})} 
                  />
                </div>

                <Input 
                  label="Copyright Text" 
                  value={settings.footer.copyright} 
                  onChange={e => setSettings({...settings, footer: {...settings.footer, copyright: e.target.value}})} 
                />

                <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50">
                  <div>
                    <p className="text-sm font-bold">Newsletter Signup</p>
                    <p className="text-xs text-gray-400">Show newsletter form in footer</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, footer: {...settings.footer, showNewsletter: !settings.footer.showNewsletter}})}
                    className={`h-6 w-11 rounded-full transition-colors relative ${settings.footer.showNewsletter ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${settings.footer.showNewsletter ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-8">
              <h3 className="text-xl font-bold">Theme Settings</h3>
              <div className="grid grid-cols-1 gap-8">
                <Input 
                  label="Primary Brand Color" 
                  type="color" 
                  value={settings.theme.primaryColor} 
                  onChange={e => setSettings({...settings, theme: {...settings.theme, primaryColor: e.target.value}})} 
                />
                
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Border Radius</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Sharp', value: '0px' },
                      { label: 'Small', value: '0.5rem' },
                      { label: 'Medium', value: '1rem' },
                      { label: 'Large', value: '1.5rem' }
                    ].map(radius => (
                      <button
                        key={radius.value}
                        onClick={() => setSettings({...settings, theme: {...settings.theme, borderRadius: radius.value}})}
                        className={cn(
                          "p-4 rounded-2xl border text-sm font-bold transition-all",
                          settings.theme.borderRadius === radius.value ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        {radius.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Font Family</label>
                  <select 
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
                    value={settings.theme.fontFamily}
                    onChange={e => setSettings({...settings, theme: {...settings.theme, fontFamily: e.target.value}})}
                  >
                    <option value="Inter">Inter (Modern Sans)</option>
                    <option value="Outfit">Outfit (Geometric Sans)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech Mono)</option>
                    <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker 
            onClose={() => setShowMediaPicker(null)}
            onSelect={(url) => {
              const { tab, field } = showMediaPicker;
              setSettings({
                ...settings,
                [tab]: { ...settings[tab], [field]: url }
              });
              setShowMediaPicker(null);
            }}
            selectedUrls={[]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Navigation Management ---
const AdminNavigation = () => {
  const [menus, setMenus] = React.useState<Menu[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<Menu | null>(null);

  const fetchMenus = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'menus'));
    setMenus(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Menu)));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchMenus();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menus', id));
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (isAdding || isEditing) {
    return (
      <MenuForm 
        menu={isEditing} 
        onCancel={() => { setIsAdding(false); setIsEditing(null); }} 
        onSuccess={() => { setIsAdding(false); setIsEditing(null); fetchMenus(); }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Navigation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store's menus and links.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menus.map(menu => (
          <div key={menu.id} className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-gray-50"><MenuIcon className="h-6 w-6 text-gray-400" /></div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Edit">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsEditing(menu)}><Edit className="h-4 w-4" /></Button>
                </Tooltip>
                <Tooltip content="Delete">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-600" onClick={() => handleDelete(menu.id)}><Trash2 className="h-4 w-4" /></Button>
                </Tooltip>
              </div>
            </div>
            <h3 className="font-bold text-xl text-black">{menu.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{menu.items.length} items</p>
            <div className="mt-8 space-y-2">
              {menu.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.url}</span>
                </div>
              ))}
              {menu.items.length > 3 && <p className="text-xs text-gray-400 pt-2">+ {menu.items.length - 3} more items</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MenuForm = ({ menu, onCancel, onSuccess }: { menu: Menu | null, onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: menu?.title || '',
    handle: menu?.handle || '',
    items: menu?.items || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (menu) {
        await updateDoc(doc(db, 'menus', menu.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'menus'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { label: '', url: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: 'label' | 'url', value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button>
          <h1 className="text-3xl font-bold tracking-tight text-black">{menu ? 'Edit Menu' : 'Add Menu'}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-full px-6">Cancel</Button>
          <Button onClick={handleSubmit} className="rounded-full px-8" isLoading={loading}>Save Menu</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Menu Settings</h3>
            <Input 
              label="Menu Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value, handle: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
              required 
              placeholder="e.g. Main Menu, Footer Links"
            />
            <Input label="Handle" value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} required />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Menu Items</h3>
              <Button variant="ghost" size="sm" onClick={addItem} className="text-xs font-bold"><Plus className="mr-2 h-3 w-3" /> Add Item</Button>
            </div>
            
            <div className="space-y-3">
              {formData.items.length === 0 ? (
                <div className="p-12 border-2 border-dashed rounded-3xl text-center bg-gray-50">
                  <p className="text-gray-400 text-sm">No items in this menu yet.</p>
                </div>
              ) : (
                formData.items.map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl border bg-gray-50/50 space-y-4 group">
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab p-1 text-gray-300"><GripVertical className="h-5 w-5" /></div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Label" value={item.label} onChange={e => updateItem(i, 'label', e.target.value)} placeholder="Home" />
                        <Input label="URL" value={item.url} onChange={e => updateItem(i, 'url', e.target.value)} placeholder="/" />
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-600 self-end mb-1" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Settings Management ---
const AdminSettings = () => {
  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-black">General Settings</h1>
      <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
        <Input label="Store Name" defaultValue="LuxeCommerce" />
        <Input label="Store Email" defaultValue="contact@luxe.com" />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Store Currency</label>
          <select className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black">
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </div>
        <Button className="w-full rounded-full h-12">Save Settings</Button>
      </div>
    </div>
  );
};

// --- Media Management ---
const AdminMedia = () => {
  const [media, setMedia] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'media'));
    setMedia(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  React.useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async () => {
    const url = window.prompt('Enter image URL to add to library:');
    if (url) {
      await addDoc(collection(db, 'media'), {
        url,
        name: url.split('/').pop() || 'Untitled',
        type: 'image',
        createdAt: new Date().toISOString()
      });
      fetchMedia();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this asset?')) {
      await deleteDoc(doc(db, 'media', id));
      setMedia(media.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage your store assets.</p>
        </div>
        <Button onClick={handleUpload} className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Upload Media
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.length === 0 ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square rounded-2xl border bg-white overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-md transition-all">
              <img src={`https://picsum.photos/seed/media${i}/400/400`} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          ))
        ) : (
          media.map(item => (
            <div key={item.id} className="aspect-square rounded-2xl border bg-white overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-md transition-all">
              <img src={item.url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-100" onClick={() => window.open(item.url, '_blank')}><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main Admin Layout ---
export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Layers, label: 'Collections', path: '/admin/collections' },
    { icon: FileText, label: 'Pages', path: '/admin/pages' },
    { icon: Palette, label: 'Header & Footer', path: '/admin/appearance' },
    { icon: Navigation, label: 'Navigation', path: '/admin/navigation' },
    { icon: ImageIcon, label: 'Media', path: '/admin/media' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-white hidden md:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-8">
          <Link to="/" className="text-3xl font-black tracking-tighter text-black">LUXE.</Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200",
                  isActive 
                    ? "bg-black text-white shadow-lg shadow-black/10 translate-x-1" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t mt-auto">
          <div className="p-4 rounded-2xl bg-gray-50 mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200 overflow-hidden">
              {user?.photoURL && <img src={user.photoURL} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full rounded-full bg-gray-100 border-none pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative h-11 w-11 bg-gray-50 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
            </Button>
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm" className="rounded-full font-bold">
                View Store <Eye className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto w-full">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="appearance" element={<AdminAppearance />} />
            <Route path="navigation" element={<AdminNavigation />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
