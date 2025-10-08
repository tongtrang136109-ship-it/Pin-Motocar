import React, { useState, useMemo, useEffect } from 'react';
import type { PinProduct } from '../../types';
import { PencilSquareIcon, XMarkIcon } from '../common/Icons';
import Pagination from '../common/Pagination';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Edit Price Modal ---
const EditPriceModal: React.FC<{
    product: PinProduct | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: PinProduct) => void;
}> = ({ product, isOpen, onClose, onSave }) => {
    const [sellingPrice, setSellingPrice] = useState(0);

    useEffect(() => {
        if (isOpen && product) {
            setSellingPrice(product.sellingPrice);
        }
    }, [product, isOpen]);

    const handleSave = () => {
        if (product) {
            onSave({ ...product, sellingPrice });
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    const profit = sellingPrice - product.costPrice;
    const profitMargin = product.costPrice > 0 ? (profit / product.costPrice) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cập nhật Giá bán</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá vốn</label>
                        <input type="text" value={formatCurrency(product.costPrice)} disabled className="mt-1 w-full p-2 border rounded-md bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá bán mới (*)</label>
                        <input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white border-slate-300 dark:border-slate-600" autoFocus />
                    </div>
                    <div className="text-sm">
                        <p>Lợi nhuận dự kiến: <span className="font-semibold">{formatCurrency(profit)}</span></p>
                        <p>Tỷ suất lợi nhuận: <span className={`font-semibold ${profitMargin < 20 ? 'text-red-500' : 'text-green-500'}`}>{profitMargin.toFixed(1)}%</span></p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
interface PinProductManagerProps {
    products: PinProduct[];
    updateProduct: (product: PinProduct) => void;
}

const ITEMS_PER_PAGE = 10;

const PinProductManager: React.FC<PinProductManagerProps> = ({ products, updateProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<PinProduct | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);
    
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <EditPriceModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
                onSave={updateProduct}
                product={editingProduct}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Thành phẩm</h1>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc SKU..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100"
                />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên Thành phẩm</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SKU</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tồn kho</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá vốn</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá bán</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map(product => (
                            <tr key={product.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{product.name}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{product.sku}</td>
                                <td className={`p-3 text-right font-bold ${product.stock <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>{product.stock}</td>
                                <td className="p-3 text-right text-slate-800 dark:text-slate-200">{formatCurrency(product.costPrice)}</td>
                                <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.sellingPrice)}</td>
                                <td className="p-3">
                                    <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-1 text-sky-600 dark:text-sky-400" title="Chỉnh sửa giá bán">
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có thành phẩm nào.</div>}
            </div>
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredProducts.length}
                />
            )}
        </div>
    );
};

export default PinProductManager;