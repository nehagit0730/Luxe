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
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { cn, formatPrice } from '../lib/utils';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, where, limit } from 'firebase/firestore';
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

  React.useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (isAdding) return <ProductForm onCancel={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); /* refresh */ }} />;

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
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
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
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-600" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
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

const ProductForm = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    images: [''],
    categoryId: '',
    isFeatured: false,
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      await addDoc(collection(db, 'products'), {
        ...formData,
        slug,
        createdAt: new Date().toISOString()
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full"><ArrowLeft className="h-6 w-6" /></Button>
        <h1 className="text-3xl font-bold tracking-tight text-black">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
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
              <Input label="Price ($)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
              <Input label="Stock Quantity" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
            </div>
            <Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
          </div>

          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="font-bold">Media</h3>
            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                  {img ? (
                    <>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        const newImgs = [...formData.images];
                        newImgs[i] = '';
                        setFormData({...formData, images: newImgs});
                      }}><XCircle className="h-4 w-4 text-red-600" /></button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Add Image</p>
                      <input 
                        type="text" 
                        placeholder="URL" 
                        className="mt-2 w-full text-[10px] border-none bg-transparent focus:ring-0 text-center"
                        onBlur={e => {
                          const newImgs = [...formData.images];
                          newImgs[i] = e.target.value;
                          setFormData({...formData, images: newImgs});
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button 
                type="button"
                className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => setFormData({...formData, images: [...formData.images, '']})}
              >
                <Plus className="h-6 w-6 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-3xl border bg-white shadow-sm space-y-6">
            <h3 className="font-bold">Status</h3>
            <select 
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-black"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
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
            <h3 className="font-bold">Organization</h3>
            <Input label="Collection / Category" placeholder="Select..." />
            <Input label="Tags" placeholder="Summer, New, Sale" />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1 rounded-full" isLoading={loading}>Save Product</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- CMS Pages Management ---
const AdminPages = () => {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPages = async () => {
      const snap = await getDocs(collection(db, 'pages'));
      setPages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page)));
      setLoading(false);
    };
    fetchPages();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage custom store pages.</p>
        </div>
        <Button className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(page => (
          <div key={page.id} className="p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-gray-50"><FileText className="h-6 w-6 text-gray-400" /></div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-600"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <h3 className="font-bold text-lg text-black">{page.title}</h3>
            <p className="text-xs text-gray-400 mt-1">/{page.slug}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">Published</span>
              <Button variant="ghost" size="sm" className="text-xs font-bold">Preview <Eye className="ml-2 h-3 w-3" /></Button>
            </div>
          </div>
        ))}
        
        {/* Empty State / Add New Card */}
        <button className="p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center group min-h-[200px]">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
            <Plus className="h-6 w-6" />
          </div>
          <p className="font-bold text-black">Create New Page</p>
          <p className="text-xs text-gray-400 mt-1">About, Contact, FAQ, etc.</p>
        </button>
      </div>
    </div>
  );
};

// --- Collections Management ---
const AdminCollections = () => {
  const [collections, setCollections] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCollections = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      setCollections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      setLoading(false);
    };
    fetchCollections();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Group your products into collections.</p>
        </div>
        <Button className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Add Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map(cat => (
          <div key={cat.id} className="p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all group">
            <div className="aspect-video rounded-2xl bg-gray-100 mb-4 overflow-hidden border">
              <img src={cat.image || `https://picsum.photos/seed/${cat.slug}/400/200`} alt="" className="h-full w-full object-cover" />
            </div>
            <h3 className="font-bold text-lg text-black">{cat.name}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">12 Products</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-600"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
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

  React.useEffect(() => {
    const fetchMedia = async () => {
      const snap = await getDocs(collection(db, 'media'));
      setMedia(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchMedia();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage your store assets.</p>
        </div>
        <Button className="rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Upload Media
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square rounded-2xl border bg-white overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-md transition-all">
            <img src={`https://picsum.photos/seed/media${i}/400/400`} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-100"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
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
            <Route path="appearance" element={<div className="p-12 text-center border-2 border-dashed rounded-3xl">Header & Footer Settings Coming Soon</div>} />
            <Route path="navigation" element={<div className="p-12 text-center border-2 border-dashed rounded-3xl">Navigation Menus Coming Soon</div>} />
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
