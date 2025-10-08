import React, { useState, useMemo } from 'react';
import type { PinSale } from '../../types';
import { BanknotesIcon, ChartBarIcon } from '../common/Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Main Component ---
interface PinReportManagerProps {
    sales: PinSale[];
}

const PinReportManager: React.FC<PinReportManagerProps> = ({ sales }) => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const reportData = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= start && saleDate <= end;
        });

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
        const totalCost = filteredSales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.costPrice * i.quantity, 0), 0);
        const totalProfit = totalRevenue - totalCost;

        const productPerformance: { [key: string]: { name: string, sku: string, quantity: number, revenue: number, profit: number } } = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productPerformance[item.productId]) {
                    productPerformance[item.productId] = { name: item.name, sku: item.sku, quantity: 0, revenue: 0, profit: 0 };
                }
                const itemRevenue = item.sellingPrice * item.quantity - (item.discount || 0); // Approx revenue for item
                const itemCost = item.costPrice * item.quantity;
                productPerformance[item.productId].quantity += item.quantity;
                productPerformance[item.productId].revenue += itemRevenue;
                productPerformance[item.productId].profit += (itemRevenue - itemCost);
            });
        });

        const dailyData: { [key: string]: { revenue: number, profit: number } } = {};
        filteredSales.forEach(sale => {
            const dayKey = new Date(sale.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (!dailyData[dayKey]) dailyData[dayKey] = { revenue: 0, profit: 0 };
            const saleCost = sale.items.reduce((sum, i) => sum + i.costPrice * i.quantity, 0);
            dailyData[dayKey].revenue += sale.total;
            dailyData[dayKey].profit += (sale.total - saleCost);
        });
        
        const trendData = Object.entries(dailyData).map(([label, data]) => ({ label, ...data }))
          .sort((a,b) => {
            const [dayA, monthA] = a.label.split('/');
            const [dayB, monthB] = b.label.split('/');
            return new Date(`${monthA}/${dayA}/2024`).getTime() - new Date(`${monthB}/${dayB}/2024`).getTime();
        });


        return {
            totalRevenue,
            totalCost,
            totalProfit,
            productPerformance: Object.values(productPerformance).sort((a,b) => b.revenue - a.revenue),
            trendData
        };
    }, [sales, startDate, endDate]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Báo cáo Doanh thu & Lợi nhuận</h1>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" /></div>
                <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-sky-50 dark:bg-sky-900/50 p-4 rounded-lg border border-sky-200 dark:border-sky-800"><p className="text-sm font-medium text-sky-800 dark:text-sky-300">Tổng Doanh thu</p><p className="text-2xl font-bold text-sky-800 dark:text-sky-200">{formatCurrency(reportData.totalRevenue)}</p></div>
                <div className="bg-amber-50 dark:bg-amber-900/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800"><p className="text-sm font-medium text-amber-800 dark:text-amber-300">Tổng Giá vốn</p><p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(reportData.totalCost)}</p></div>
                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800"><p className="text-sm font-medium text-green-800 dark:text-green-300">Lợi nhuận ròng</p><p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(reportData.totalProfit)}</p></div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 overflow-x-auto">
                <h3 className="p-4 text-lg font-semibold">Hiệu suất bán hàng theo sản phẩm</h3>
                 <table className="w-full text-left min-w-max">
                    <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Sản phẩm</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">SL Bán</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Doanh thu</th>
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.productPerformance.map(item => (
                            <tr key={item.sku} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                                <td className="p-3 text-center text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                <td className="p-3 text-right text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(item.revenue)}</td>
                                <td className="p-3 text-right text-green-600 dark:text-green-400 font-bold">{formatCurrency(item.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 {reportData.productPerformance.length === 0 && <div className="text-center p-8 text-slate-500">Không có dữ liệu.</div>}
            </div>
        </div>
    );
};

export default PinReportManager;