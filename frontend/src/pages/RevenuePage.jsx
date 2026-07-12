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

    const fullName = localStorage.getItem('fullName') || 'Admin';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
            const res = await fetch(`http://localhost:8080/api/revenue/details?year=${year}&month=${month}`, { headers: getAuthHeaders() });
            setDetailsData(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchYearly = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/revenue/yearly?year=${year}`, { headers: getAuthHeaders() });
            setYearlyData(await res.json());
        } catch (e) { console.error(e); }
    };

    const totalMonthly   = detailsData?.totalRevenue || 0;
    const totalYearly    = yearlyData.reduce((s, m) => s + (m.revenue || 0), 0);
    const thisMonthEntry = yearlyData.find(m => m.month === month);
    const prevMonthEntry = yearlyData.find(m => m.month === month - 1);
    const monthChange    = prevMonthEntry?.revenue
        ? (((thisMonthEntry?.revenue || 0) - prevMonthEntry.revenue) / prevMonthEntry.revenue * 100).toFixed(1)
        : null;
    const maxYearly = Math.max(...yearlyData.map(m => m.revenue || 0), 1);

    if (!detailsData) return (
        <div className="rv-loading">
            <div className="rv-spinner"></div>
            <p>Loading revenue data...</p>
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
                            <th>Revenue</th>
                            <th style={{ width: '40%' }}>Distribution</th>
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
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>‹ Prev</button>
                        <span>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next ›</button>
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
                    <p>Revenue overview for <strong>{MONTH_NAMES[month - 1]} {year}</strong></p>
                </div>
                <div className="rv-date-controls">
                    <select value={month} onChange={e => { setMonth(parseInt(e.target.value)); setCurrentPage(1); }}>
                        {[...Array(12).keys()].map(i => (
                            <option key={i+1} value={i+1}>{MONTH_NAMES[i]}</option>
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
                    <p className="rv-card-label">Total Monthly Revenue</p>
                    <h2 className="rv-main-amount">{totalMonthly.toLocaleString('vi-VN')} ₫</h2>
                    {monthChange !== null && (
                        <p className={`rv-change ${parseFloat(monthChange) >= 0 ? 'up' : 'down'}`}>
                            {parseFloat(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(monthChange)}% compared to last month
                        </p>
                    )}
                    <div className="rv-sparkline">
                        {yearlyData.map(m => (
                            <div key={m.month} className="rv-spark-bar-wrap" title={`${MONTH_NAMES[m.month-1]}: ${(m.revenue||0).toLocaleString('vi-VN')}₫`}>
                                <div
                                    className={`rv-spark-bar ${m.month === month ? 'active' : ''}`}
                                    style={{ height: `${Math.max(4, (m.revenue || 0) / maxYearly * 60)}px` }}
                                ></div>
                                <span className="rv-spark-label">{MONTH_NAMES[m.month-1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3 side stat cards */}
                <div className="rv-side-stats">
                    <div className="rv-side-card yellow">
                        <span className="rv-side-icon">📅</span>
                        <div>
                            <p className="rv-side-label">Yearly Total ({year})</p>
                            <p className="rv-side-amount">{totalYearly.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    </div>
                    <div className="rv-side-card blue">
                        <span className="rv-side-icon">📊</span>
                        <div>
                            <p className="rv-side-label">Monthly Average</p>
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
                            <p className="rv-side-label">Best Month</p>
                            <p className="rv-side-amount">
                                {yearlyData.length > 0
                                    ? MONTH_NAMES[yearlyData.reduce((a, b) => (a.revenue||0) > (b.revenue||0) ? a : b).month - 1]
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="rv-table-card">
                <div className="rv-table-header">
                    <h2>Revenue Breakdown</h2>
                    <div className="rv-tabs">
                        {[
                            { key: 'daily',  label: '📆 By Day' },
                            { key: 'weekly', label: '📅 By Week' },
                            { key: 'yearly', label: '📈 Full Year' },
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
                {viewMode === 'daily'  && renderTable(detailsData.daily,  'date',  'Day',   'Day ')}
                {viewMode === 'weekly' && renderTable(detailsData.weekly, 'week',  'Week',  'Week ')}
                {viewMode === 'yearly' && renderTable(yearlyData,          'month', 'Month', 'Month ')}
            </div>
        </div>
    );
}