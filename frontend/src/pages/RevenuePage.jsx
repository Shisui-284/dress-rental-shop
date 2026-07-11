import { useState, useEffect } from 'react';
import './RevenuePage.css';

export default function RevenuePage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly', 'yearly'
    const [detailsData, setDetailsData] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        fetchDetails();
        fetchYearly();
    }, [year, month]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/revenue/details?year=${year}&month=${month}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setDetailsData(data);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết:', error);
        }
    };

    const fetchYearly = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/revenue/yearly?year=${year}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setYearlyData(data);
        } catch (error) {
            console.error('Lỗi khi tải năm:', error);
        }
    };

    if (!detailsData) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="revenue-page">
            <div className="revenue-header">
                <h2>Quản Lý Doanh Thu</h2>
                <div className="date-selector">
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                        {[...Array(12).keys()].map(i => (
                            <option key={i+1} value={i+1}>Tháng {i+1}</option>
                        ))}
                    </select>
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                        <option value={year - 1}>{year - 1}</option>
                        <option value={year}>{year}</option>
                        <option value={year + 1}>{year + 1}</option>
                    </select>
                </div>
            </div>

            <div className="revenue-summary-card">
                <h3>Tổng Doanh Thu (Tháng {month}/{year})</h3>
                <p className="total-amount">{(detailsData.totalRevenue || 0).toLocaleString('vi-VN')} VND</p>
            </div>

            <div className="view-mode-buttons" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => { setViewMode('daily'); setCurrentPage(1); }} style={{ fontWeight: viewMode === 'daily' ? 'bold' : 'normal' }}>Theo Ngày</button>
                <button onClick={() => { setViewMode('weekly'); setCurrentPage(1); }} style={{ fontWeight: viewMode === 'weekly' ? 'bold' : 'normal' }}>Theo Tuần</button>
                <button onClick={() => { setViewMode('yearly'); setCurrentPage(1); }} style={{ fontWeight: viewMode === 'yearly' ? 'bold' : 'normal' }}>Cả Năm</button>
            </div>

            <div className="table-container">
                {viewMode === 'daily' && (() => {
                    const totalPages = Math.ceil(detailsData.daily.length / itemsPerPage);
                    const currentItems = detailsData.daily.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                    return (
                        <>
                            <table className="rentals-table">
                                <thead><tr><th>Ngày</th><th>Doanh thu</th></tr></thead>
                                <tbody>
                                    {currentItems.map(d => (
                                        <tr key={d.date}><td>Ngày {d.date}</td><td>{(d.revenue || 0).toLocaleString('vi-VN')} đ</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '10px' }}>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} style={{ padding: '5px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Trước</button>
                                    <span style={{ padding: '5px 10px', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} style={{ padding: '5px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Sau</button>
                                </div>
                            )}
                        </>
                    );
                })()}

                {viewMode === 'weekly' && (() => {
                    const totalPages = Math.ceil(detailsData.weekly.length / itemsPerPage);
                    const currentItems = detailsData.weekly.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                    return (
                        <>
                            <table className="rentals-table">
                                <thead><tr><th>Tuần</th><th>Doanh thu</th></tr></thead>
                                <tbody>
                                    {currentItems.map(w => (
                                        <tr key={w.week}><td>Tuần {w.week}</td><td>{(w.revenue || 0).toLocaleString('vi-VN')} đ</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '10px' }}>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} style={{ padding: '5px 15px' }}>Trước</button>
                                    <span style={{ padding: '5px 10px', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} style={{ padding: '5px 15px' }}>Sau</button>
                                </div>
                            )}
                        </>
                    );
                })()}

                {viewMode === 'yearly' && (() => {
                    const totalPages = Math.ceil(yearlyData.length / itemsPerPage);
                    const currentItems = yearlyData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                    return (
                        <>
                            <table className="rentals-table">
                                <thead><tr><th>Tháng</th><th>Doanh thu</th></tr></thead>
                                <tbody>
                                    {currentItems.map(m => (
                                        <tr key={m.month}><td>Tháng {m.month}</td><td>{(m.revenue || 0).toLocaleString('vi-VN')} đ</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '10px' }}>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} style={{ padding: '5px 15px' }}>Trước</button>
                                    <span style={{ padding: '5px 10px', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} style={{ padding: '5px 15px' }}>Sau</button>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}