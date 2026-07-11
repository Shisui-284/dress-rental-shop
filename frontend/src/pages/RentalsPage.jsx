import { useState, useEffect } from 'react';
import './RentalsPage.css';

export default function RentalsPage() {
    const [products, setProducts] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [completedRentals, setCompletedRentals] = useState([]);
    const [deletedRentals, setDeletedRentals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const role = localStorage.getItem('userRole');
    
    // Pagination & Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [completedSearchQuery, setCompletedSearchQuery] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [completedPage, setCompletedPage] = useState(1);
    const [deletedPage, setDeletedPage] = useState(1);
    const itemsPerPage = 5;

    // Date logic for alerts
    const todayDate = new Date();
    const todayStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');
    
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.getFullYear() + '-' + String(tomorrowDate.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrowDate.getDate()).padStart(2, '0');

    const overdueRentals = rentals.filter(r => r.expectedReturnDate < todayStr);
    const dueSoonRentals = rentals.filter(r => r.expectedReturnDate === todayStr || r.expectedReturnDate === tomorrowStr);
    
    // Form state
    const [selectedProduct, setSelectedProduct] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        fetchProducts();
        fetchActiveRentals();
        fetchCompletedRentals();
        if (role === 'ADMIN') {
            fetchDeletedRentals();
        }
    }, [role]);

    const fetchProducts = () => {
        fetch('http://localhost:8080/api/products', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                // Chỉ lấy những sản phẩm đang không bị xóa và ở trạng thái AVAILABLE
                if (Array.isArray(data)) {
                    setProducts(data.filter(p => p.status === 'AVAILABLE'));
                }
            })
            .catch(err => console.error(err));
    };

    const fetchActiveRentals = () => {
        fetch('http://localhost:8080/api/rentals/active', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRentals(data);
            })
            .catch(err => console.error(err));
    };

    const fetchCompletedRentals = () => {
        fetch('http://localhost:8080/api/rentals/completed-recent', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCompletedRentals(data);
            })
            .catch(err => console.error(err));
    };

    const fetchDeletedRentals = () => {
        fetch('http://localhost:8080/api/rentals/deleted', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDeletedRentals(data);
            })
            .catch(err => console.error(err));
    };

    const handleCreateRental = async (e) => {
        e.preventDefault();
        
        // 1. Gọi API kiểm tra trùng lịch (Check Availability)
        try {
            const checkRes = await fetch(`http://localhost:8080/api/rentals/check-availability?productId=${selectedProduct}&startDate=${startDate}&endDate=${endDate}`, {
                headers: getAuthHeaders()
            });
            const isAvailable = await checkRes.json();
            
            if (!isAvailable) {
                alert('Rất tiếc! Váy này đã có người đặt trong khoảng thời gian trên. Vui lòng chọn ngày khác.');
                return;
            }

            // 2. Nếu trống lịch thì tiến hành tạo đơn
            const userId = 1; // Tạm thời hardcode admin ID, ở thực tế sẽ lấy từ token/localStorage
            
            const createRes = await fetch('http://localhost:8080/api/rentals', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    productId: parseInt(selectedProduct),
                    userId: userId,
                    startDate: startDate,
                    endDate: endDate,
                    totalAmount: totalAmount
                })
            });

            if (!createRes.ok) throw new Error('Không thể tạo lịch thuê');
            
            alert('Tạo lịch thuê thành công!');
            setShowForm(false);
            setStartDate('');
            setEndDate('');
            setTotalAmount('');
            setSelectedProduct('');
            fetchActiveRentals();
            fetchProducts(); // Cập nhật lại danh sách váy trống

        } catch (error) {
            console.error(error);
            alert('Lỗi tạo lịch thuê: ' + error.message);
        }
    };

    const handleReturnDress = async (rentalId) => {
        if (!window.confirm('Xác nhận khách đã trả váy này?')) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/rentals/${rentalId}/complete`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái trả váy');
            
            alert('Đã xác nhận trả váy thành công!');
            fetchActiveRentals();
            fetchCompletedRentals();
            fetchProducts(); // Váy quay lại trạng thái AVAILABLE
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const handleToggleDelivery = async (rentalId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/rentals/${rentalId}/toggle-delivery`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái giao hàng');
            
            fetchActiveRentals(); // Cập nhật lại UI ngay lập tức
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDeleteRental = async (rentalId) => {
        if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA đơn này? Đơn bị xóa sẽ không được tính vào doanh thu.')) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/rentals/${rentalId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể xóa đơn');
            
            alert('Đã xóa đơn thành công!');
            fetchActiveRentals();
            fetchProducts();
            if (role === 'ADMIN') fetchDeletedRentals();
        } catch (error) {
            console.error(error);
            alert('Lỗi xóa đơn: ' + error.message);
        }
    };

    // Pagination & Search logic
    const filteredActiveRentals = rentals.filter(r => 
        (r.product?.productCode || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.product?.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeTotalPages = Math.ceil(filteredActiveRentals.length / itemsPerPage);
    const activeStartIndex = (activePage - 1) * itemsPerPage;
    const currentActiveRentals = filteredActiveRentals.slice(activeStartIndex, activeStartIndex + itemsPerPage);

    const filteredCompletedRentals = completedRentals.filter(r => 
        (r.product?.productCode || '').toLowerCase().includes(completedSearchQuery.toLowerCase()) || 
        (r.product?.productName || '').toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
        (r.receiveDate || '').includes(completedSearchQuery)
    );

    const completedTotalPages = Math.ceil(filteredCompletedRentals.length / itemsPerPage);
    const completedStartIndex = (completedPage - 1) * itemsPerPage;
    const currentCompletedRentals = filteredCompletedRentals.slice(completedStartIndex, completedStartIndex + itemsPerPage);

    const deletedTotalPages = Math.ceil(deletedRentals.length / itemsPerPage);
    const deletedStartIndex = (deletedPage - 1) * itemsPerPage;
    const currentDeletedRentals = deletedRentals.slice(deletedStartIndex, deletedStartIndex + itemsPerPage);

    return (
        <div className="rentals-page">

            {/* ── PAGE HEADER ── */}
            <div className="rp-header">
                <div className="rp-header-left">
                    <h1>Rental Schedule</h1>
                    <p>Manage all active and past dress rentals in one place.</p>
                </div>
                <button className="rp-new-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Close' : '+ New Rental'}
                </button>
            </div>

            {/* ── STATS CARDS ── */}
            <div className="rp-stats-row">
                <div className="rp-stat-card active-card">
                    <span className="stat-icon">👗</span>
                    <div>
                        <div className="stat-value">{rentals.length}</div>
                        <div className="stat-label">Currently Rented</div>
                    </div>
                </div>
                <div className="rp-stat-card overdue-card">
                    <span className="stat-icon">⚠️</span>
                    <div>
                        <div className="stat-value">{overdueRentals.length}</div>
                        <div className="stat-label">Overdue</div>
                    </div>
                </div>
                <div className="rp-stat-card soon-card">
                    <span className="stat-icon">🔔</span>
                    <div>
                        <div className="stat-value">{dueSoonRentals.length}</div>
                        <div className="stat-label">Due Today / Tomorrow</div>
                    </div>
                </div>
                <div className="rp-stat-card done-card">
                    <span className="stat-icon">✅</span>
                    <div>
                        <div className="stat-value">{completedRentals.length}</div>
                        <div className="stat-label">Completed (30 days)</div>
                    </div>
                </div>
            </div>

            {/* ── ALERT BANNERS ── */}
            {overdueRentals.length > 0 && (
                <div className="alert-banner overdue-banner">
                    <div className="alert-title">⚠️ {overdueRentals.length} đơn đã quá hạn trả đồ!</div>
                    <div className="alert-list">
                        {overdueRentals.map(r => (
                            <div key={r.id} className="alert-item">
                                <span>Đơn <strong>#{r.id}</strong> – {r.product?.productName} ({r.product?.productCode}) – Hạn: {r.expectedReturnDate}</span>
                                <button className="alert-action-btn danger" onClick={() => handleReturnDress(r.id)}>Đã thu hồi</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dueSoonRentals.length > 0 && (
                <div className="alert-banner soon-banner">
                    <div className="alert-title">🔔 {dueSoonRentals.length} đơn sắp đến hạn trả hôm nay / ngày mai</div>
                    <div className="alert-list">
                        {dueSoonRentals.map(r => (
                            <div key={r.id} className="alert-item">
                                <span>Đơn <strong>#{r.id}</strong> – {r.product?.productName} ({r.product?.productCode}) – Hạn: {r.expectedReturnDate}</span>
                                <button className="alert-action-btn warning" onClick={() => handleReturnDress(r.id)}>Khách đã trả</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CREATE RENTAL FORM ── */}
            {showForm && (
                <div className="rp-form-card">
                    <h3>Create New Rental Order</h3>
                    <form className="rp-form-grid" onSubmit={handleCreateRental}>
                        <div className="rp-field">
                            <label>Select Dress (Available)</label>
                            <select required value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                                <option value="" disabled>-- Choose a dress --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.productCode} – {p.productName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="rp-field">
                            <label>Pickup Date</label>
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Expected Return Date</label>
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Total Amount (VND)</label>
                            <input type="number" required placeholder="Enter agreed price" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                        </div>
                        <button type="submit" className="rp-submit-btn">Confirm Booking</button>
                    </form>
                </div>
            )}

            {/* ── ACTIVE RENTALS TABLE ── */}
            <div className="rp-table-card">
                <div className="rp-table-header">
                    <h2>Active Rentals</h2>
                    <div className="rp-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by code or dress name..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setActivePage(1); }}
                        />
                    </div>
                </div>

                {currentActiveRentals.length === 0
                    ? <p className="rp-empty">No active rentals match your search.</p>
                    : (
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Code</th>
                                    <th>Dress Name</th>
                                    <th>Pickup</th>
                                    <th>Due Return</th>
                                    <th>Delivery</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentActiveRentals.map(r => {
                                    const isOverdue = r.expectedReturnDate < todayStr;
                                    return (
                                        <tr key={r.id} className={isOverdue ? 'row-overdue' : ''}>
                                            <td><span className="order-id">#{r.id}</span></td>
                                            <td><span className="code-badge">{r.product?.productCode}</span></td>
                                            <td>{r.product?.productName}</td>
                                            <td>{r.receiveDate}</td>
                                            <td>
                                                <span className={isOverdue ? 'due-date overdue' : 'due-date'}>
                                                    {r.expectedReturnDate}
                                                    {isOverdue && <span className="overdue-tag">Overdue</span>}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`delivery-toggle ${r.deliveryStatus === 'DELIVERED' ? 'delivered' : 'booked'}`}
                                                    onClick={() => handleToggleDelivery(r.id)}
                                                >
                                                    {r.deliveryStatus === 'DELIVERED' ? '📦 Delivered' : '⏳ Booked'}
                                                </button>
                                            </td>
                                            <td><span className="amount">{Number(r.totalAmount).toLocaleString('vi-VN')} ₫</span></td>
                                            <td className="action-cell">
                                                <button className="act-btn return" onClick={() => handleReturnDress(r.id)}>✓ Returned</button>
                                                <button className="act-btn cancel" onClick={() => handleDeleteRental(r.id)}>✕ Cancel</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )
                }

                {activeTotalPages > 1 && (
                    <div className="rp-pagination">
                        <button disabled={activePage === 1} onClick={() => setActivePage(c => c - 1)}>‹ Prev</button>
                        <span>{activePage} / {activeTotalPages}</span>
                        <button disabled={activePage === activeTotalPages} onClick={() => setActivePage(c => c + 1)}>Next ›</button>
                    </div>
                )}
            </div>

            {/* ── COMPLETED RENTALS TABLE ── */}
            <div className="rp-table-card completed-card-section">
                <div className="rp-table-header">
                    <h2>Completed Rentals <span className="subtitle-chip">Last 30 days</span></h2>
                    <div className="rp-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by code, name or date..."
                            value={completedSearchQuery}
                            onChange={(e) => { setCompletedSearchQuery(e.target.value); setCompletedPage(1); }}
                        />
                    </div>
                </div>

                {currentCompletedRentals.length === 0
                    ? <p className="rp-empty">No completed rentals match your search.</p>
                    : (
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Code</th>
                                    <th>Dress Name</th>
                                    <th>Pickup</th>
                                    <th>Actual Return</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCompletedRentals.map(r => (
                                    <tr key={r.id}>
                                        <td><span className="order-id">#{r.id}</span></td>
                                        <td><span className="code-badge">{r.product?.productCode}</span></td>
                                        <td>{r.product?.productName}</td>
                                        <td>{r.receiveDate}</td>
                                        <td>{r.actualReturnDate}</td>
                                        <td><span className="amount">{Number(r.totalAmount).toLocaleString('vi-VN')} ₫</span></td>
                                        <td><span className="status-chip done">✓ Returned</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }

                {completedTotalPages > 1 && (
                    <div className="rp-pagination">
                        <button disabled={completedPage === 1} onClick={() => setCompletedPage(c => c - 1)}>‹ Prev</button>
                        <span>{completedPage} / {completedTotalPages}</span>
                        <button disabled={completedPage === completedTotalPages} onClick={() => setCompletedPage(c => c + 1)}>Next ›</button>
                    </div>
                )}
            </div>

            {/* ── DELETED RENTALS (Admin only) ── */}
            {role === 'ADMIN' && deletedRentals.length > 0 && (
                <div className="rp-table-card deleted-card-section">
                    <div className="rp-table-header">
                        <h2>Deleted Orders <span className="subtitle-chip danger-chip">Admin View</span></h2>
                    </div>
                    <table className="rp-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Code</th>
                                <th>Dress Name</th>
                                <th>Pickup</th>
                                <th>Amount</th>
                                <th>Deleted By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentDeletedRentals.map(r => (
                                <tr key={r.id} className="row-deleted">
                                    <td><span className="order-id deleted">#{r.id}</span></td>
                                    <td>{r.product?.productCode}</td>
                                    <td>{r.product?.productName}</td>
                                    <td>{r.receiveDate}</td>
                                    <td><span className="amount">{Number(r.totalAmount).toLocaleString('vi-VN')} ₫</span></td>
                                    <td><span className="deleted-by">{r.createdBy?.username}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {deletedTotalPages > 1 && (
                        <div className="rp-pagination">
                            <button disabled={deletedPage === 1} onClick={() => setDeletedPage(c => c - 1)}>‹ Prev</button>
                            <span>{deletedPage} / {deletedTotalPages}</span>
                            <button disabled={deletedPage === deletedTotalPages} onClick={() => setDeletedPage(c => c + 1)}>Next ›</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}