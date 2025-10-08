import React from 'react';
import { WrenchScrewdriverIcon, ArrowRightEndOnRectangleIcon, CpuChipIcon } from './common/Icons';
import type { User } from '../types';

interface AppCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ icon, title, description, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 w-full max-w-sm cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group"
    >
        <div className="flex flex-col items-center text-center">
            <div className="bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full mb-6 transition-colors group-hover:bg-sky-200 dark:group-hover:bg-sky-800">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
        </div>
    </div>
);

interface AppSelectorProps {
    onSelectApp: (app: 'motocare' | 'pincorp') => void;
    onLogout: () => void;
    currentUser: User;
}

const AppSelector: React.FC<AppSelectorProps> = ({ onSelectApp, onLogout, currentUser }) => {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
            <header className="absolute top-0 right-0 p-6">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        Xin chào, <span className="font-bold">{currentUser.name}</span>
                    </span>
                    <button 
                        onClick={onLogout} 
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Đăng xuất"
                    >
                        <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            <main className="flex flex-col items-center text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    Chọn ứng dụng
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-lg">
                    Chào mừng bạn trở lại! Vui lòng chọn một ứng dụng để bắt đầu công việc.
                </p>
                <div className="flex flex-col md:flex-row gap-8">
                    <AppCard
                        icon={<WrenchScrewdriverIcon className="w-10 h-10 text-sky-600 dark:text-sky-400" />}
                        title="Quản lý Cửa hàng Xe máy"
                        description="Vào ứng dụng MotoCare Pro để quản lý dịch vụ, kho hàng, khách hàng và xem báo cáo kinh doanh."
                        onClick={() => onSelectApp('motocare')}
                    />
                    <AppCard
                        icon={<CpuChipIcon className="w-10 h-10 text-sky-600 dark:text-sky-400" />}
                        title="Sản xuất & Kinh doanh PIN"
                        description="Truy cập hệ thống quản lý sản xuất, theo dõi đơn hàng và phân phối sản phẩm PIN."
                        onClick={() => onSelectApp('pincorp')}
                    />
                </div>
            </main>
        </div>
    );
};

export default AppSelector;
