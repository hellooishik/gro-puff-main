import React from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

const DeliveryTracker = ({ status, address, city }) => {
    const statuses = [
        { label: 'Pending', icon: Clock },
        { label: 'Packed', icon: Package },
        { label: 'Out for Delivery', icon: Truck },
        { label: 'Delivered', icon: CheckCircle },
    ];

    // Normalize status string matching the models standard: 'Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'
    let currentStep = 0;
    if (status === 'Packed') currentStep = 1;
    if (status === 'Out for Delivery' || status === 'Out_for_Delivery') currentStep = 2;
    if (status === 'Delivered') currentStep = 3;
    if (status === 'Cancelled') currentStep = -1;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
            <h3 className="font-bold text-lg mb-6 flex items-center">
                <MapPin className="mr-2 text-[#00ADEF]" size={20} />
                Live Delivery Tracking
            </h3>

            {status === 'Cancelled' ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                    <p className="text-red-600 font-bold text-lg">Order Cancelled</p>
                    <p className="text-red-500 text-sm mt-1">This order has been cancelled.</p>
                </div>
            ) : (
                <>
                    {/* Visual Progress Bar */}
                    <div className="relative mb-12 mt-4 px-4 sm:px-10">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div 
                                style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#00ADEF] transition-all duration-500 ease-out"
                            ></div>
                        </div>

                        <div className="flex justify-between absolute w-full top-[-14px] left-0 px-4 sm:px-10">
                            {statuses.map((s, index) => {
                                const Icon = s.icon;
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={s.label} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                                            isCompleted ? 'bg-[#00ADEF] border-blue-100 text-white shadow-md z-10' : 'bg-gray-200 border-white text-gray-400 z-10'
                                        } transition-colors duration-300`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className={`mt-2 text-xs font-semibold whitespace-nowrap absolute top-10 ${
                                            isCurrent ? 'text-[#00ADEF]' : (isCompleted ? 'text-gray-800' : 'text-gray-400')
                                        }`}>
                                            {s.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Simulated Map View */}
                    <div className="relative mt-16 rounded-xl overflow-hidden bg-[#e5e3df] h-48 border border-gray-200 flex items-center justify-center">
                        {/* A simple CSS map representation instead of heavy iframes */}
                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cpath d=\\"M0 0h20v20H0V0zm10 10l10-10H0l10 10zm0 0L0 20h20L10 10z\\" fill=\\"%239C92AC\\" fill-opacity=\\"0.2\\" fill-rule=\\"evenodd\\"/%3E%3C/svg%3E")' }}></div>
                        
                        {/* Store Pin */}
                        <div className="absolute left-[10%] bottom-[30%] flex flex-col items-center">
                            <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold mb-1 shadow">Store</div>
                            <MapPin className="text-gray-800" fill="currentColor" size={32} />
                        </div>

                        {/* Customer Pin */}
                        <div className="absolute right-[10%] top-[30%] flex flex-col items-center">
                            <div className="bg-[#00ADEF] text-white text-[10px] px-2 py-1 rounded font-bold mb-1 shadow whitespace-nowrap truncate max-w-[100px]">{address || 'Delivery'}</div>
                            <MapPin className="text-[#00ADEF]" fill="currentColor" size={32} />
                        </div>

                        {/* Animated Truck on a Route Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                            {/* Route Line */}
                            <path d="M 20% 65% Q 50% 100% 80% 35%" fill="transparent" stroke="#00ADEF" strokeWidth="4" strokeDasharray="8,8" className="opacity-50" />
                        </svg>

                        {/* Vehicle indicator based on status */}
                        {currentStep >= 1 && currentStep < 3 && (
                            <div 
                                className="absolute bg-white p-2 rounded-full shadow-lg border-2 border-[#00ADEF] animate-bounce"
                                style={{
                                    left: currentStep === 1 ? '30%' : '50%',
                                    top: currentStep === 1 ? '60%' : '50%',
                                    transition: 'all 1s ease-in-out'
                                }}
                            >
                                <Truck className="text-[#00ADEF]" size={20} />
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div className="absolute right-[10%] top-[30%] bg-white p-1 rounded-full shadow-lg border-2 border-green-500 z-10 -ml-3 -mt-3">
                                <CheckCircle className="text-green-500 bg-white rounded-full" size={20} />
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-3 text-sm text-gray-500 font-medium">
                        Destination: <span className="text-gray-800">{address}{city ? `, ${city}` : ''}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeliveryTracker;
