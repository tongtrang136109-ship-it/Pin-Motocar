import React, { useState, useMemo, useEffect } from 'react';
import type { PinMaterial } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '../common/Icons';
import Pagination from '../common/Pagination';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const generateUniqueId = (prefix = 'M') => `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- Material Modal ---
const MaterialModal: React.FC<{
    material: PinMaterial | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (material: PinMaterial) => void;
}> = ({ material, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<PinMaterial>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(material ? { ...material } : { unit: 'cái', stock: 0 });
        }
    }, [material, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.purchasePrice) {
            alert('Vui lòng nhập Tên và Giá nhập.');
            return;
        }
        const finalMaterial: PinMaterial = {
            id: formData.id || generateUniqueId(),
            name: formData.name,
            sku: formData.sku || '',
            unit: formData.unit || 'cái',
            purchasePrice: formData.purchasePrice,
            stock: formData.stock || 0,
            supplier: formData.supplier,
            description: formData.description,
        };
        onSave(finalMaterial);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{material ? 'Chỉnh sửa Nguyên vật liệu' : 'Thêm Nguyên vật liệu'}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên nguyên vật liệu (*)</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" autoFocus />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mã SKU</label>
                        <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đơn vị</label>
                            <select name="unit" value={formData.unit || 'cái'} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white">
                                <option value="cái">cái</option>
                                <option value="mét">mét</option>
                                <option value="kg">kg</option>
                                <option value="lít">lít</option>
                                <option value="cuộn">cuộn</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá nhập (*)</label>
                            <input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tồn kho</label>
                            <input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
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
interface MaterialManagerProps {
    materials: PinMaterial[];
    setMaterials: React.Dispatch<React.SetStateAction<PinMaterial[]>>;
}

const ITEMS_PER_PAGE = 10;

const MaterialManager: React.FC<MaterialManagerProps> = ({ materials, setMaterials }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<PinMaterial | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSaveMaterial = (material: PinMaterial) => {
        setMaterials(prev => {
            const exists = prev.some(m => m.id === material.id);
            return exists ? prev.map(m => m.id === material.id ? material : m) : [material, ...prev];
        });
    };

    const handleDeleteMaterial = (materialId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nguyên vật liệu này?')) {
            setMaterials(prev => prev.filter(m => m.id !== materialId));
        }
    };
    
    const filteredMaterials = useMemo(() =>
        materials.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [materials, searchTerm]
    );

    const paginatedMaterials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMaterials, currentPage]);
    
    const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <MaterialModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingMaterial(null); }}
                onSave={handleSaveMaterial}
                material={editingMaterial}
            />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Nguyên vật liệu</h1>
                <button onClick={() => { setEditingMaterial(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700">
                    <PlusIcon /> Thêm Nguyên vật liệu
                </button>
            </div>

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
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên Nguyên vật liệu</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SKU</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Đơn vị</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá nhập</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tồn kho</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMaterials.map(material => (
                            <tr key={material.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{material.name}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{material.sku}</td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{material.unit}</td>
                                <td className="p-3 text-right text-slate-800 dark:text-slate-200">{formatCurrency(material.purchasePrice)}</td>
                                <td className={`p-3 text-right font-bold ${material.stock <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>{material.stock}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingMaterial(material); setIsModalOpen(true); }} className="p-1 text-sky-600 dark:text-sky-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteMaterial(material.id)} className="p-1 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMaterials.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Không có nguyên vật liệu nào.</div>}
            </div>

            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredMaterials.length}
                />
            )}
        </div>
    );
};

export default MaterialManager;
