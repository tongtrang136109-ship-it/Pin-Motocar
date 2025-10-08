import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { PinProduct, PinCartItem, PinSale, PinCustomer } from '../../types';
import { ShoppingCartIcon, PlusIcon, MinusIcon, TrashIcon, BanknotesIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, XMarkIcon, CubeIcon } from '../common/Icons';
import PinReceiptModal from './PinReceiptModal';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const generateUniqueId = (prefix = 'PINCUST-') => `${prefix}${Date.now()}`;

// --- New Customer Modal ---
const NewPinCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: PinCustomer) => void;
    initialName?: string;
}> = ({ isOpen, onClose, onSave, initialName = '' }) => {
    const [formData, setFormData] = useState<Omit<PinCustomer, 'id'>>({ name: initialName, phone: '', address: '' });
    
    useEffect(() => {
        if(isOpen) {
            setFormData({ name: initialName, phone: '', address: '' });
        }
    }, [isOpen, initialName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCustomer: PinCustomer = {
            id: generateUniqueId(),
            ...formData,
        };
        onSave(finalCustomer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Thêm Khách hàng mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên khách hàng (*)</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại (*)</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Địa chỉ</label>
                                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                        <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Product Card Component ---
const PinProductCard: React.FC<{ product: PinProduct; onSelect: () => void; }> = ({ product, onSelect }) => (
    <div onClick={onSelect} className="border dark:border-slate-700 rounded-lg p-3 flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all bg-white dark:bg-slate-800">
        <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center mb-2">
            <CubeIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex-grow leading-tight">{product.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SKU: {product.sku}</p>
        <div className="flex justify-between items-center mt-2">
            <p className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(product.sellingPrice)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Kho: {product.stock}</p>
        </div>
    </div>
);

// --- Floating Cart Button for Mobile ---
const FloatingCartButton: React.FC<{ count: number; total: number; onClick: () => void; }> = ({ count, total, onClick }) => (
    <div className="lg:hidden fixed bottom-4 right-4 left-4 z-20">
        <button onClick={onClick} className="w-full bg-orange-500 text-white font-bold rounded-lg shadow-lg flex items-center py-3 px-5 hover:bg-orange-600 transition-transform hover:scale-105">
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3">{count}</span>
            <span className="mx-auto text-lg">{formatCurrency(total)}</span>
            <span>Tiếp tục &rarr;</span>
        </button>
    </div>
);


// --- Main Component ---
interface PinSalesManagerProps {
    products: PinProduct[];
    cartItems: PinCartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<PinCartItem[]>>;
    handleSale: (saleData: Omit<PinSale, 'id' | 'date' | 'userId' | 'userName'>) => void;
    customers: PinCustomer[];
    setCustomers: React.Dispatch<React.SetStateAction<PinCustomer[]>>;
}

const PinSalesManager: React.FC<PinSalesManagerProps> = ({ products, cartItems, setCartItems, handleSale, customers, setCustomers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | null>(null);
    const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
    const [printReceipt, setPrintReceipt] = useState(true);
    const [isReceiptVisible, setIsReceiptVisible] = useState(false);
    const [lastSaleData, setLastSaleData] = useState<PinSale | null>(null);

    // Customer state
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<PinCustomer | null>(null);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const customerInputRef = useRef<HTMLDivElement>(null);


    const availableProducts = useMemo(() => 
        products.filter(p => 
            p.stock > 0 && 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [products, searchTerm]);

    const addToCart = (product: PinProduct) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1,
                sellingPrice: product.sellingPrice,
                costPrice: product.costPrice,
                stock: product.stock
            }];
        });
    };
    
    const updateQuantity = (productId: string, quantity: number) => {
        setCartItems(prev => prev
            .map(item => item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item)
            .filter(item => item.quantity > 0)
        );
    };

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cartItems]);
    const total = subtotal - discount;
    const totalCartItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
            c.phone.includes(customerSearch)
        );
    }, [customers, customerSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectCustomer = (customer: PinCustomer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.name);
        setIsCustomerListOpen(false);
    };

    const handleSaveNewCustomer = (newCustomer: PinCustomer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        handleSelectCustomer(newCustomer);
        setIsNewCustomerModalOpen(false);
    };


    const finalizeSale = () => {
        if (cartItems.length === 0 || !paymentMethod) {
            alert('Vui lòng thêm sản phẩm vào giỏ và chọn phương thức thanh toán.');
            return;
        }

        const customerDetails = selectedCustomer ? 
            { id: selectedCustomer.id, name: selectedCustomer.name, phone: selectedCustomer.phone, address: selectedCustomer.address } :
            { name: customerSearch || 'Khách lẻ' };

        const saleData: Omit<PinSale, 'id' | 'date' | 'userId' | 'userName'> = {
            items: cartItems,
            subtotal,
            discount,
            total,
            customer: customerDetails,
            paymentMethod
        };
        handleSale(saleData);

        if (printReceipt) {
            setLastSaleData({
                ...saleData,
                id: `SALE-${Date.now()}`,
                date: new Date().toISOString(),
                userId: '', 
                userName: ''
            });
            setIsReceiptVisible(true);
        }

        // Reset form
        setCartItems([]);
        setDiscount(0);
        setCustomerSearch('');
        setSelectedCustomer(null);
        setPaymentMethod(null);
        setMobileView('products');
    };

    return (
        <>
            <NewPinCustomerModal
                isOpen={isNewCustomerModalOpen}
                onClose={() => setIsNewCustomerModalOpen(false)}
                onSave={handleSaveNewCustomer}
                initialName={customerSearch}
            />
            <PinReceiptModal 
                isOpen={isReceiptVisible}
                onClose={() => setIsReceiptVisible(false)}
                saleData={lastSaleData}
            />
            <div className="lg:grid lg:grid-cols-3 lg:gap-6 h-full">
                {/* Product List */}
                <div className={`${mobileView === 'products' ? 'flex' : 'hidden'} lg:flex flex-col bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700 h-full lg:col-span-2`}>
                    <input 
                        type="text" 
                        placeholder="Tìm sản phẩm..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full p-2 border rounded-md mb-4 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                        {availableProducts.map(product => (
                            <PinProductCard key={product.id} product={product} onSelect={() => addToCart(product)} />
                        ))}
                    </div>
                </div>

                {/* Cart & Checkout */}
                <div className={`${mobileView === 'cart' ? 'flex' : 'hidden'} lg:flex w-full lg:w-auto flex-col bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700 mt-6 lg:mt-0 h-full lg:col-span-1`}>
                    <div className="flex items-center mb-4">
                        <button onClick={() => setMobileView('products')} className="lg:hidden p-2 mr-2 -ml-2 text-slate-600 dark:text-slate-300">
                            <ArrowUturnLeftIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold flex items-center"><ShoppingCartIcon className="w-6 h-6 mr-2" /> Hóa đơn</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
                        {cartItems.length === 0 ? <p className="text-center text-slate-500 py-16">Giỏ hàng trống</p> : cartItems.map(item => (
                            <div key={item.productId} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(item.sellingPrice)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 border rounded-md dark:border-slate-600"><MinusIcon className="w-4 h-4"/></button>
                                    <input type="number" value={item.quantity} onChange={e => updateQuantity(item.productId, Number(e.target.value))} className="w-10 text-center border-slate-300 dark:bg-slate-700 dark:border-slate-500 rounded text-sm"/>
                                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 border rounded-md dark:border-slate-600"><PlusIcon className="w-4 h-4"/></button>
                                </div>
                                <button onClick={() => updateQuantity(item.productId, 0)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto pt-4 border-t dark:border-slate-700 space-y-3">
                        <div ref={customerInputRef}>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Khách hàng</label>
                            <div className="relative mt-1">
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        placeholder="Tìm hoặc thêm khách hàng..." 
                                        value={customerSearch} 
                                        onChange={e => {
                                            setCustomerSearch(e.target.value);
                                            setIsCustomerListOpen(true);
                                            setSelectedCustomer(null);
                                        }}
                                        onFocus={() => setIsCustomerListOpen(true)}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-l-md dark:bg-slate-700 dark:text-slate-100"
                                    />
                                    <button type="button" onClick={() => setIsNewCustomerModalOpen(true)} className="p-2 border-t border-b border-r rounded-r-md h-[42px] bg-slate-50 dark:bg-slate-600 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500" title="Thêm khách hàng mới">
                                        <PlusIcon />
                                    </button>
                                </div>
                                {isCustomerListOpen && (
                                    <div className="absolute bottom-full mb-1 z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                            <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                                                <p className="text-slate-500 dark:text-slate-400">{c.phone}</p>
                                            </div>
                                        )) : (
                                            <div className="p-2 text-sm text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                         </div>
                        <div className="flex justify-between items-center text-sm"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between items-center text-sm"><span>Giảm giá</span><input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} placeholder="0" className="w-24 p-1 border rounded-md text-right dark:bg-slate-700 dark:border-slate-600"/></div>
                        <div className="flex justify-between items-center font-bold text-xl"><span>Tổng cộng</span><span className="text-sky-600 dark:text-sky-400">{formatCurrency(total)}</span></div>
                        <div className="flex gap-2">
                            <button onClick={() => setPaymentMethod('cash')} className={`flex-1 flex items-center justify-center gap-2 p-2 border-2 rounded-lg ${paymentMethod === 'cash' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600'}`}><BanknotesIcon className="w-5 h-5 text-green-600" /> Tiền mặt</button>
                            <button onClick={() => setPaymentMethod('bank')} className={`flex-1 flex items-center justify-center gap-2 p-2 border-2 rounded-lg ${paymentMethod === 'bank' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600'}`}> Chuyển khoản</button>
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                                <input type="checkbox" checked={printReceipt} onChange={e => setPrintReceipt(e.target.checked)} className="mr-2 h-4 w-4 rounded text-sky-600 focus:ring-sky-500"/>
                                In hóa đơn sau khi thanh toán
                            </label>
                        </div>
                        <button onClick={finalizeSale} disabled={cartItems.length === 0 || !paymentMethod} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 disabled:bg-orange-300">Thanh toán</button>
                    </div>
                </div>
            </div>
            {cartItems.length > 0 && mobileView === 'products' && (
                <FloatingCartButton count={totalCartItems} total={total} onClick={() => setMobileView('cart')} />
            )}
        </>
    );
};

export default PinSalesManager;