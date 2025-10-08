import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { PinMaterial, PinBOM, ProductionOrder, User, PinProduct, PinCartItem, PinSale, PinCustomer } from '../../types';
import PinSidebar from './PinSidebar';
import MaterialManager from './MaterialManager';
import { Bars3Icon } from '../common/Icons';
import BomManager from './BomManager';
import ProductionManager from './ProductionManager';
import PinProductManager from './PinProductManager';
import PinSalesManager from './PinSalesManager';
import PinReportManager from './PinReportManager';

interface PinCorpAppProps {
    currentUser: User;
    materials: PinMaterial[];
    setMaterials: React.Dispatch<React.SetStateAction<PinMaterial[]>>;
    boms: PinBOM[];
    setBoms: React.Dispatch<React.SetStateAction<PinBOM[]>>;
    productionOrders: ProductionOrder[];
    addProductionOrder: (order: ProductionOrder, bom: PinBOM) => void;
    updateProductionOrder: (orderId: string, newStatus: ProductionOrder['status']) => void;
    products: PinProduct[];
    updateProduct: (product: PinProduct) => void;
    cartItems: PinCartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<PinCartItem[]>>;
    sales: PinSale[];
    handleSale: (saleData: Omit<PinSale, 'id' | 'date' | 'userId' | 'userName'>) => void;
    onSwitchApp: () => void;
    pinCustomers: PinCustomer[];
    setPinCustomers: React.Dispatch<React.SetStateAction<PinCustomer[]>>;
}

const PinCorpApp: React.FC<PinCorpAppProps> = (props) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <HashRouter>
            <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
                <PinSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onSwitchApp={props.onSwitchApp} />
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" aria-hidden="true"></div>
                )}
                <div className="flex flex-col flex-1 w-full min-w-0">
                    <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                        <div className="flex items-center justify-between p-4 h-16">
                            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 -ml-2">
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Sản xuất PIN</h1>
                            <div className="w-6"></div> {/* Spacer */}
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Navigate to="/materials" replace />} />
                            <Route path="/materials" element={<MaterialManager materials={props.materials} setMaterials={props.setMaterials} />} />
                            <Route path="/boms" element={<BomManager boms={props.boms} setBoms={props.setBoms} materials={props.materials} />} />
                            <Route path="/production" element={<ProductionManager 
                                currentUser={props.currentUser}
                                orders={props.productionOrders} 
                                addOrder={props.addProductionOrder}
                                updateOrder={props.updateProductionOrder}
                                boms={props.boms}
                                materials={props.materials}
                             />} />
                            <Route path="/products" element={<PinProductManager products={props.products} updateProduct={props.updateProduct} />} />
                            <Route path="/sales" element={<PinSalesManager 
                                products={props.products}
                                cartItems={props.cartItems}
                                setCartItems={props.setCartItems}
                                handleSale={props.handleSale}
                                customers={props.pinCustomers}
                                setCustomers={props.setPinCustomers}
                            />} />
                             <Route path="/reports" element={<PinReportManager sales={props.sales} />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    );
};

export default PinCorpApp;