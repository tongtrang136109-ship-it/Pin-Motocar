// This is a new file: components/pincorp/ProductionManager.tsx
import React, { useState, useMemo, useEffect } from 'react';
import type { ProductionOrder, PinBOM, PinMaterial, AdditionalCost, User } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '../common/Icons';
import Pagination from '../common/Pagination';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const generateUniqueId = (prefix = 'PO') => `${prefix}${Date.now()}`;

// --- Production Order Modal ---
const ProductionOrderModal: React.FC<{
    order: ProductionOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: ProductionOrder, bom: PinBOM) => void;
    boms: PinBOM[];
    materials: PinMaterial[];
    currentUser: User;
}> = ({ order, isOpen, onClose, onSave, boms, materials, currentUser }) => {
    const [selectedBomId, setSelectedBomId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
    const [newCost, setNewCost] = useState({ description: '', amount: 0 });
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedBomId(order?.bomId || null);
            setQuantity(order?.quantityProduced || 1);
            setAdditionalCosts(order?.additionalCosts || []);
            setNotes(order?.notes || '');
        }
    }, [order, isOpen]);

    const selectedBom = useMemo(() => boms.find(b => b.id === selectedBomId), [selectedBomId, boms]);

    const requiredMaterials = useMemo(() => {
        if (!selectedBom) return [];
        return selectedBom.materials.map(bomMat => {
            const materialInfo = materials.find(m => m.id === bomMat.materialId);
            const required = bomMat.quantity * quantity;
            return {
                materialId: bomMat.materialId,
                name: materialInfo?.name || 'Không tìm thấy',
                required,
                stock: materialInfo?.stock || 0,
                isSufficient: materialInfo ? materialInfo.stock >= required : false,
                purchasePrice: materialInfo?.purchasePrice || 0,
            };
        });
    }, [selectedBom, quantity, materials]);
    
    const isStockSufficient = useMemo(() => requiredMaterials.every(m => m.isSufficient), [requiredMaterials]);
    const materialsCost = useMemo(() => requiredMaterials.reduce((sum, mat) => sum + (mat.purchasePrice * mat.required), 0), [requiredMaterials]);
    const additionalCostsTotal = useMemo(() => additionalCosts.reduce((sum, cost) => sum + cost.amount, 0), [additionalCosts]);
    const totalCost = materialsCost + additionalCostsTotal;

    const handleAddCost = () => {
        if (newCost.description.trim() && newCost.amount > 0) {
            setAdditionalCosts(prev => [...prev, newCost]);
            setNewCost({ description: '', amount: 0 });
        }
    };
    
    const handleRemoveCost = (index: number) => {
        setAdditionalCosts(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!selectedBom) {
            alert('Vui lòng chọn một công thức sản phẩm.');
            return;
        }
        const newOrder: ProductionOrder = {
            id: order?.id || generateUniqueId(),
            creationDate: order?.creationDate || new Date().toISOString().split('T')[0],
            bomId: selectedBomId!,
            productName: selectedBom.productName,
            quantityProduced: quantity,
            status: 'Đang chờ',
            materialsCost,
            additionalCosts,
            totalCost,
            notes,
            userName: currentUser.name,
        };
        onSave(newOrder, selectedBom);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{order ? 'Chỉnh sửa Lệnh sản xuất' : 'Tạo Lệnh sản xuất'}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Công thức (BOM) (*)</label>
                            <select value={selectedBomId || ''} onChange={e => setSelectedBomId(e.target.value)} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white">
                                <option value="">-- Chọn công thức --</option>
                                {boms.map(b => <option key={b.id} value={b.id}>{b.productName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng sản xuất (*)</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                    {selectedBom && (
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Kiểm tra Nguyên vật liệu:</h4>
                                {!isStockSufficient && <p className="text-sm text-red-500 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5"/> Một hoặc nhiều nguyên vật liệu không đủ trong kho.</p>}
                                <div className="max-h-48 overflow-y-auto mt-2 space-y-1 pr-2">
                                    {requiredMaterials.map(m => (
                                        <div key={m.materialId} className={`text-sm flex justify-between items-center p-2 rounded ${!m.isSufficient ? 'bg-red-100 dark:bg-red-900/50' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                                            <span className={`${!m.isSufficient ? 'text-red-600 dark:text-red-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>Cần: {m.required} / Tồn: {m.stock}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Chi phí phát sinh:</h4>
                                <div className="space-y-2 mt-2">
                                    {additionalCosts.map((cost, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <span className="flex-1 text-slate-700 dark:text-slate-200">{cost.description}</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(cost.amount)}</span>
                                            <button onClick={() => handleRemoveCost(index)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-700">
                                        <input type="text" placeholder="Diễn giải" value={newCost.description} onChange={e => setNewCost(c => ({...c, description: e.target.value}))} className="flex-1 p-1 border dark:border-slate-600 rounded-md text-sm dark:bg-slate-700 dark:text-white" />
                                        <input type="number" placeholder="Số tiền" value={newCost.amount || ''} onChange={e => setNewCost(c => ({...c, amount: Number(e.target.value)}))} className="w-28 p-1 border dark:border-slate-600 rounded-md text-sm dark:bg-slate-700 dark:text-white" />
                                        <button onClick={handleAddCost} className="bg-sky-600 text-white text-sm px-3 py-1 rounded">Thêm</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 mt-auto">
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Tiền NVL</p><p className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(materialsCost)}</p></div>
                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Chi phí khác</p><p className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(additionalCostsTotal)}</p></div>
                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Tổng giá vốn</p><p className="font-bold text-xl text-sky-600 dark:text-sky-400">{formatCurrency(totalCost)}</p></div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                        <button onClick={handleSave} disabled={!isStockSufficient || !selectedBom} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-sky-300 disabled:cursor-not-allowed">Lưu Lệnh</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface ProductionManagerProps {
    currentUser: User;
    orders: ProductionOrder[];
    addOrder: (order: ProductionOrder, bom: PinBOM) => void;
    updateOrder: (orderId: string, newStatus: ProductionOrder['status']) => void;
    boms: PinBOM[];
    materials: PinMaterial[];
}

const ITEMS_PER_PAGE = 10;

const ProductionManager: React.FC<ProductionManagerProps> = ({ currentUser, orders, addOrder, updateOrder, boms, materials }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const paginatedOrders = useMemo(() => {
        const sortedOrders = [...orders].sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [orders, currentPage]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    const getStatusChipClass = (status: ProductionOrder['status']) => {
        switch (status) {
            case 'Hoàn thành': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Đang sản xuất': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
            case 'Đang chờ': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
            case 'Đã hủy': return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };
    
    const handleCancelOrder = (order: ProductionOrder) => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy Lệnh sản xuất #${order.id} không? Nguyên vật liệu đã sử dụng sẽ được hoàn trả về kho.`)) {
            updateOrder(order.id, 'Đã hủy');
        }
    };

    return (
        <div className="space-y-6">
            <ProductionOrderModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingOrder(null); }}
                onSave={addOrder}
                order={editingOrder}
                boms={boms}
                materials={materials}
                currentUser={currentUser}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Sản xuất</h1>
                <button onClick={() => { setEditingOrder(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700">
                    <PlusIcon /> Tạo Lệnh sản xuất
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                 <table className="w-full text-left min-w-max">
                    <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Mã Lệnh</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày tạo</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên Thành phẩm</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Người tạo</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Số lượng</th>
                             <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Trạng thái</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tổng giá vốn</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className={`border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${order.status === 'Đã hủy' ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400' : ''}`}>
                                <td className={`p-3 font-medium ${order.status === 'Đã hủy' ? 'text-slate-500' : 'text-sky-600 dark:text-sky-400'}`}>{order.id}</td>
                                <td className={`p-3 text-slate-600 dark:text-slate-300 ${order.status === 'Đã hủy' && 'line-through'}`}>{order.creationDate}</td>
                                <td className={`p-3 font-medium ${order.status === 'Đã hủy' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{order.productName}</td>
                                <td className={`p-3 text-slate-600 dark:text-slate-300 ${order.status === 'Đã hủy' && 'line-through'}`}>{order.userName || 'N/A'}</td>
                                <td className={`p-3 text-center ${order.status === 'Đã hủy' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{order.quantityProduced}</td>
                                <td className="p-3">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateOrder(order.id, e.target.value as ProductionOrder['status'])}
                                        disabled={order.status === 'Đã hủy' || order.status === 'Hoàn thành'}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-0 focus:outline-none appearance-none ${getStatusChipClass(order.status)}`}
                                    >
                                        <option value="Đang chờ">Đang chờ</option>
                                        <option value="Đang sản xuất">Đang sản xuất</option>
                                        <option value="Hoàn thành">Hoàn thành</option>
                                        <option value="Đã hủy" disabled>Đã hủy</option>
                                    </select>
                                </td>
                                <td className={`p-3 text-right font-semibold ${order.status === 'Đã hủy' ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{formatCurrency(order.totalCost)}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleCancelOrder(order)}
                                            disabled={order.status === 'Đã hủy' || order.status === 'Hoàn thành'} 
                                            className="p-1 text-red-500 disabled:text-red-500/30 disabled:cursor-not-allowed" 
                                            title={order.status === 'Đã hủy' ? 'Lệnh đã được hủy' : 'Hủy lệnh sản xuất'}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                  {orders.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có lệnh sản xuất nào.</div>}
            </div>

            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={orders.length}
                />
            )}
        </div>
    );
};

export default ProductionManager;