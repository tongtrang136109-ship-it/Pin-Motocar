import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PinBOM, PinMaterial, PinBomMaterial } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '../common/Icons';
import Pagination from '../common/Pagination';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const generateUniqueId = (prefix = 'BOM') => `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- BOM Modal ---
const BomModal: React.FC<{
    bom: PinBOM | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (bom: PinBOM) => void;
    materials: PinMaterial[];
}> = ({ bom, isOpen, onClose, onSave, materials }) => {
    const [formData, setFormData] = useState<Partial<PinBOM>>({});
    const [materialSearch, setMaterialSearch] = useState('');
    const [isMaterialListOpen, setIsMaterialListOpen] = useState(false);
    const materialInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(bom ? { ...bom } : { materials: [] });
        }
    }, [bom, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (materialInputRef.current && !materialInputRef.current.contains(event.target as Node)) {
                setIsMaterialListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredMaterials = useMemo(() => {
        if (!materialSearch) return [];
        const lowercasedTerm = materialSearch.toLowerCase();
        // Exclude materials already in the BOM
        const currentMaterialIds = formData.materials?.map(m => m.materialId) || [];
        return materials.filter(m => 
            !currentMaterialIds.includes(m.id) &&
            (m.name.toLowerCase().includes(lowercasedTerm) || m.sku.toLowerCase().includes(lowercasedTerm))
        ).slice(0, 10);
    }, [materials, materialSearch, formData.materials]);
    
    const handleAddMaterial = (material: PinMaterial) => {
        const newBomMaterial: PinBomMaterial = { materialId: material.id, quantity: 1 };
        setFormData(prev => ({ ...prev, materials: [...(prev.materials || []), newBomMaterial] }));
        setMaterialSearch('');
        setIsMaterialListOpen(false);
    };

    const handleUpdateMaterialQty = (materialId: string, quantity: number) => {
        setFormData(prev => ({
            ...prev,
            materials: (prev.materials || []).map(m => m.materialId === materialId ? { ...m, quantity } : m)
        }));
    };
    
    const handleRemoveMaterial = (materialId: string) => {
        setFormData(prev => ({
            ...prev,
            materials: (prev.materials || []).filter(m => m.materialId !== materialId)
        }));
    };

    const estimatedCost = useMemo(() => {
        return (formData.materials || []).reduce((sum, bomMaterial) => {
            const materialInfo = materials.find(m => m.id === bomMaterial.materialId);
            return sum + (materialInfo ? materialInfo.purchasePrice * bomMaterial.quantity : 0);
        }, 0);
    }, [formData.materials, materials]);

    const handleSave = () => {
        if (!formData.productName || !formData.materials || formData.materials.length === 0) {
            alert('Vui lòng nhập Tên sản phẩm và thêm ít nhất một nguyên vật liệu.');
            return;
        }
        const finalBom: PinBOM = {
            id: formData.id || generateUniqueId(),
            productName: formData.productName,
            productSku: formData.productSku || '',
            materials: formData.materials,
            notes: formData.notes,
        };
        onSave(finalBom);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{bom ? 'Chỉnh sửa Công thức' : 'Tạo Công thức mới'}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên thành phẩm (*)</label>
                            <input type="text" value={formData.productName || ''} onChange={e => setFormData(d => ({ ...d, productName: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" autoFocus />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mã SKU thành phẩm</label>
                            <input type="text" value={formData.productSku || ''} onChange={e => setFormData(d => ({ ...d, productSku: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                     <div ref={materialInputRef}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Thêm Nguyên vật liệu</label>
                        <div className="relative mt-1">
                            <input type="text" placeholder="Tìm kiếm nguyên vật liệu..." value={materialSearch}
                                onChange={e => { setMaterialSearch(e.target.value); setIsMaterialListOpen(true); }}
                                onFocus={() => setIsMaterialListOpen(true)}
                                className="w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                            />
                             {isMaterialListOpen && filteredMaterials.length > 0 && (
                                <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {filteredMaterials.map(m => (
                                        <div key={m.id} onClick={() => handleAddMaterial(m)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                                            <p className="font-semibold">{m.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{m.sku} - Tồn: {m.stock}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2 -mr-2">
                        {formData.materials?.map(bomMaterial => {
                            const materialInfo = materials.find(m => m.id === bomMaterial.materialId);
                            if (!materialInfo) return null;
                            return (
                                <div key={bomMaterial.materialId} className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{materialInfo.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(materialInfo.purchasePrice)} / {materialInfo.unit}</p>
                                    </div>
                                    <input type="number" step="0.01" value={bomMaterial.quantity} onChange={e => handleUpdateMaterialQty(bomMaterial.materialId, parseFloat(e.target.value))} className="w-20 p-1 border dark:border-slate-600 rounded-md text-right dark:bg-slate-700 dark:text-white" />
                                    <p className="w-24 text-right font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(materialInfo.purchasePrice * bomMaterial.quantity)}</p>
                                    <button onClick={() => handleRemoveMaterial(bomMaterial.materialId)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Giá vốn ước tính:</span>
                        <span className="text-xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(estimatedCost)}</span>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                        <button onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu Công thức</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface BomManagerProps {
    boms: PinBOM[];
    setBoms: React.Dispatch<React.SetStateAction<PinBOM[]>>;
    materials: PinMaterial[];
}

const ITEMS_PER_PAGE = 10;

const BomManager: React.FC<BomManagerProps> = ({ boms, setBoms, materials }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBom, setEditingBom] = useState<PinBOM | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const calculateBomCost = (bom: PinBOM): number => {
        return bom.materials.reduce((sum, bomMat) => {
            const matInfo = materials.find(m => m.id === bomMat.materialId);
            return sum + (matInfo ? matInfo.purchasePrice * bomMat.quantity : 0);
        }, 0);
    };

    const handleSaveBom = (bomData: PinBOM) => {
        setBoms(prev => {
            const exists = prev.some(b => b.id === bomData.id);
            return exists ? prev.map(b => b.id === bomData.id ? bomData : b) : [bomData, ...prev];
        });
    };
    
    const handleDeleteBom = (bomId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa công thức này?')) {
            setBoms(prev => prev.filter(b => b.id !== bomId));
        }
    };
    
     const filteredBoms = useMemo(() =>
        boms.filter(b =>
            b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.productSku.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [boms, searchTerm]
    );

    const paginatedBoms = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBoms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBoms, currentPage]);
    
    const totalPages = Math.ceil(filteredBoms.length / ITEMS_PER_PAGE);
    
    return (
        <div className="space-y-6">
            <BomModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingBom(null); }}
                onSave={handleSaveBom}
                bom={editingBom}
                materials={materials}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Công thức (BOM)</h1>
                <button onClick={() => { setEditingBom(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700">
                    <PlusIcon /> Thêm Công thức
                </button>
            </div>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc SKU thành phẩm..." 
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
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Số NVL</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá vốn ước tính</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBoms.map(bom => (
                            <tr key={bom.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{bom.productName}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{bom.productSku}</td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{bom.materials.length}</td>
                                <td className="p-3 text-right font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(calculateBomCost(bom))}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingBom(bom); setIsModalOpen(true); }} className="p-1 text-sky-600 dark:text-sky-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteBom(bom.id)} className="p-1 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredBoms.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có công thức nào được tạo.</div>}
            </div>
            
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredBoms.length}
                />
            )}
        </div>
    );
};

export default BomManager;
