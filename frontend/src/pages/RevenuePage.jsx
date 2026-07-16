import { useState, useEffect } from 'react';
import './RevenuePage.css';

export default function RevenuePage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState('daily');
    const [detailsData, setDetailsData] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fullName = localStorage.getItem('fullName') || 'Quản trị viên';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const MONTH_NAMES = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];

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
            const res = await fetch(`https://dress-rental-backend.onrender.com/api/revenue/details?year=${year}&month=${month}`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (res.ok) {
                setDetailsData(data);
            } else {
                console.error("API error details:", data);
                setDetailsData({ totalRevenue: 0, daily: [], weekly: [] });
            }
        } catch (e) { console.error(e); }
    };

    const fetchYearly = async () => {
        try {
            const res = await fetch(`https://dress-rental-backend.onrender.com/api/revenue/yearly?year=${year}`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) {
                setYearlyData(data);
            } else {
                console.error("API error yearly:", data);
                setYearlyData([]);
            }
        } catch (e) { console.error(e); }
    };

    const totalMonthly = detailsData?.totalRevenue || 0;
    const totalYearly = yearlyData.reduce((s, m) => s + (m.revenue || 0), 0);
    const thisMonthEntry = yearlyData.find(m => m.month === month);
    const prevMonthEntry = yearlyData.find(m => m.month === month - 1);
    const monthChange = prevMonthEntry?.revenue
        ? (((thisMonthEntry?.revenue || 0) - prevMonthEntry.revenue) / prevMonthEntry.revenue * 100).toFixed(1)
        : null;
    const maxYearly = Math.max(...yearlyData.map(m => m.revenue || 0), 1);

    if (!detailsData) return (
        <div className="rv-loading">
            <div className="rv-spinner"></div>
            <p>Đang tải dữ liệu doanh thu...</p>
        </div>
    );

    const renderTable = (rows, keyField, labelField, labelPrefix = '') => {
        const totalPages = Math.ceil(rows.length / itemsPerPage);
        const items = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        const maxVal = Math.max(...rows.map(r => r.revenue || 0), 1);
        return (
            <>
                <table className="rv-table">
                    <thead>
                        <tr>
                            <th>{labelField}</th>
                            <th>Doanh thu</th>
                            <th style={{ width: '40%' }}>Tỷ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(row => (
                            <tr key={row[keyField]}>
                                <td className="rv-label-cell">{labelPrefix}{row[keyField]}</td>
                                <td className="rv-amount-cell">{(row.revenue || 0).toLocaleString('vi-VN')} ₫</td>
                                <td className="rv-bar-cell">
                                    <div className="rv-bar-bg">
                                        <div className="rv-bar-fill" style={{ width: `${((row.revenue || 0) / maxVal * 100).toFixed(1)}%` }}></div>
                                    </div>
                                    <span className="rv-bar-pct">{((row.revenue || 0) / maxVal * 100).toFixed(0)}%</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="rv-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>‹ Trước</button>
                        <span>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Sau ›</button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="revenue-page">

            {/* GREETING HEADER */}
            <div className="rv-greeting">
                <div>
                    <h1>{greeting}, {fullName} 👋</h1>
                    <p>Tổng quan doanh thu <strong>{MONTH_NAMES[month - 1]} {year}</strong></p>
                </div>
                <div className="rv-date-controls">
                    <select value={month} onChange={e => { setMonth(parseInt(e.target.value)); setCurrentPage(1); }}>
                        {[...Array(12).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>{MONTH_NAMES[i]}</option>
                        ))}
                    </select>
                    <select value={year} onChange={e => { setYear(parseInt(e.target.value)); setCurrentPage(1); }}>
                        <option value={year - 1}>{year - 1}</option>
                        <option value={year}>{year}</option>
                        <option value={year + 1}>{year + 1}</option>
                    </select>
                </div>
            </div>

            {/* TOP STATS ROW */}
            <div className="rv-stats-row">
                {/* Main big card with sparkline */}
                <div className="rv-main-card">
                    <p className="rv-card-label">Tổng doanh thu tháng</p>
                    <h2 className="rv-main-amount">{totalMonthly.toLocaleString('vi-VN')} ₫</h2>
                    {monthChange !== null && (
                        <p className={`rv-change ${parseFloat(monthChange) >= 0 ? 'up' : 'down'}`}>
                            {parseFloat(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(monthChange)}% so với tháng trước
                        </p>
                    )}
                    <div className="rv-sparkline">
                        {yearlyData.map(m => (
                            <div key={m.month} className="rv-spark-bar-wrap" title={`${MONTH_NAMES[m.month - 1]}: ${(m.revenue || 0).toLocaleString('vi-VN')}₫`}>
                                <div
                                    className={`rv-spark-bar ${m.month === month ? 'active' : ''}`}
                                    style={{ height: `${Math.max(4, (m.revenue || 0) / maxYearly * 60)}px` }}
                                ></div>
                                <span className="rv-spark-label">{MONTH_NAMES[m.month - 1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3 side stat cards */}
                <div className="rv-side-stats">
                    <div className="rv-side-card yellow">
                        <span className="rv-side-icon">📅</span>
                        <div>
                            <p className="rv-side-label">Tổng năm ({year})</p>
                            <p className="rv-side-amount">{totalYearly.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    </div>
                    <div className="rv-side-card blue">
                        <span className="rv-side-icon">📊</span>
                        <div>
                            <p className="rv-side-label">Trung bình tháng</p>
                            <p className="rv-side-amount">
                                {(yearlyData.filter(m => m.revenue > 0).length > 0
                                    ? Math.round(totalYearly / yearlyData.filter(m => m.revenue > 0).length)
                                    : 0
                                ).toLocaleString('vi-VN')} ₫
                            </p>
                        </div>
                    </div>
                    <div className="rv-side-card green">
                        <span className="rv-side-icon">💎</span>
                        <div>
                            <p className="rv-side-label">Tháng cao nhất</p>
                            <p className="rv-side-amount">
                                {yearlyData.length > 0
                                    ? MONTH_NAMES[yearlyData.reduce((a, b) => (a.revenue || 0) > (b.revenue || 0) ? a : b).month - 1]
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="rv-table-card">
                <div className="rv-table-header">
                    <h2>Chi tiết doanh thu</h2>
                    <div className="rv-tabs">
                        {[
                            { key: 'daily', label: '📆 Theo ngày' },
                            { key: 'weekly', label: '📅 Theo tuần' },
                            { key: 'yearly', label: '📈 Cả năm' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`rv-tab ${viewMode === tab.key ? 'active' : ''}`}
                                onClick={() => { setViewMode(tab.key); setCurrentPage(1); }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {viewMode === 'daily' && renderTable(detailsData.daily, 'date', 'Ngày', 'Ngày ')}
                {viewMode === 'weekly' && renderTable(detailsData.weekly, 'week', 'Tuần', 'Tuần ')}
                {viewMode === 'yearly' && renderTable(yearlyData, 'month', 'Tháng', 'Tháng ')}
            </div>
        </div>
    );
}