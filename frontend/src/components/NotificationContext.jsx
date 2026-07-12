import { createContext, useContext, useState, useCallback } from 'react';
import './NotificationContext.css';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({ isOpen: false, message: '', type: 'info' });
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', confirmText: 'XÁC NHẬN', resolve: null });

    const showAlert = useCallback((message, type = 'info') => {
        setAlertState({ isOpen: true, message, type });
        // Auto close success toasts
        if (type === 'success') {
            setTimeout(() => {
                setAlertState(prev => prev.message === message ? { ...prev, isOpen: false } : prev);
            }, 3000);
        }
    }, []);

    const showConfirmAsync = useCallback((title, message, confirmText = 'XÁC NHẬN') => {
        return new Promise((resolve) => {
            setConfirmState({ isOpen: true, title, message, confirmText, resolve });
        });
    }, []);

    const handleConfirmClose = (result) => {
        if (confirmState.resolve) {
            confirmState.resolve(result);
        }
        setConfirmState({ isOpen: false, title: '', message: '', confirmText: 'XÁC NHẬN', resolve: null });
    };

    const closeAlert = () => setAlertState({ ...alertState, isOpen: false });

    return (
        <NotificationContext.Provider value={{ showAlert, showConfirmAsync }}>
            {children}
            
            {/* ALERT MODAL */}
            {alertState.isOpen && (
                <div className="notif-overlay" onClick={closeAlert}>
                    <div className="notif-box alert-box" onClick={e => e.stopPropagation()}>
                        <button className="notif-close-x" onClick={closeAlert}>✕</button>
                        <div className={`notif-icon ${alertState.type}`}>
                            {alertState.type === 'error' ? '⚠️' : alertState.type === 'success' ? '✅' : '🔔'}
                        </div>
                        <h3 className="notif-title">
                            {alertState.type === 'error' ? 'Lỗi' : alertState.type === 'success' ? 'Thành công' : 'Thông báo'}
                        </h3>
                        <p className="notif-message">{alertState.message}</p>
                        <button className="notif-ok-btn" onClick={closeAlert}>OK</button>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL */}
            {confirmState.isOpen && (
                <div className="notif-overlay" onClick={() => handleConfirmClose(false)}>
                    <div className="notif-box confirm-box" onClick={e => e.stopPropagation()}>
                        <button className="notif-close-x" onClick={() => handleConfirmClose(false)}>✕</button>
                        <h3 className="notif-title">{confirmState.title}</h3>
                        <p className="notif-message">{confirmState.message}</p>
                        <div className="notif-actions">
                            <button className="notif-cancel" onClick={() => handleConfirmClose(false)}>HỦY</button>
                            <button className="notif-confirm" onClick={() => handleConfirmClose(true)}>
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
