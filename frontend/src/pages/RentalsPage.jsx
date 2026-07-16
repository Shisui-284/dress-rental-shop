import { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationContext';
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
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedRentalDetails, setSelectedRentalDetails] = useState(null);

    const { showAlert, showConfirmAsync } = useNotification();

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json; charset=utf-8'
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
        fetch('https://dress-rental-backend.onrender.com/api/products', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                // Cho phép lấy cả váy AVAILABLE và RENTED để nhận đặt hàng trước (Pre-order)
                if (Array.isArray(data)) {
                    setProducts(data.filter(p => p.status === 'AVAILABLE' || p.status === 'RENTED'));
                }
            })
            .catch(err => console.error(err));
    };

    const fetchActiveRentals = () => {
        fetch('https://dress-rental-backend.onrender.com/api/rentals/active', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRentals(data);
            })
            .catch(err => console.error(err));
    };

    const fetchCompletedRentals = () => {
        fetch('https://dress-rental-backend.onrender.com/api/rentals/completed-recent', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCompletedRentals(data);
            })
            .catch(err => console.error(err));
    };

    const fetchDeletedRentals = () => {
        fetch('https://dress-rental-backend.onrender.com/api/rentals/deleted', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDeletedRentals(data);
            })
            .catch(err => console.error(err));
    };

    const handleCreateRental = async (e) => {
        e.preventDefault();

        if (new Date(startDate) > new Date(endDate)) {
            showAlert('Ngày nhận không được lớn hơn ngày trả!', 'error');
            return;
        }

        // 1. Gọi API kiểm tra trùng lịch (Check Availability)
        try {
            const checkRes = await fetch(`https://dress-rental-backend.onrender.com/api/rentals/check-availability?productId=${selectedProduct}&startDate=${startDate}&endDate=${endDate}`, {
                headers: getAuthHeaders()
            });
            const isAvailable = await checkRes.json();

            if (!isAvailable) {
                showAlert('Rất tiếc! Váy này đã có người đặt trong khoảng thời gian trên. Vui lòng chọn ngày khác.', 'error');
                return;
            }

            // 2. Nếu trống lịch thì tiến hành tạo đơn
            const userId = 1; // Tạm thời hardcode admin ID, ở thực tế sẽ lấy từ token/localStorage

            const createRes = await fetch('https://dress-rental-backend.onrender.com/api/rentals', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    productId: parseInt(selectedProduct),
                    userId: userId,
                    startDate: startDate,
                    endDate: endDate,
                    totalAmount: totalAmount,
                    customerName: customerName,
                    notes: notes
                })
            });

            if (!createRes.ok) throw new Error('Không thể tạo lịch thuê');

            showAlert('Tạo lịch thuê thành công!', 'success');
            setShowForm(false);
            setStartDate('');
            setEndDate('');
            setTotalAmount('');
            setSelectedProduct('');
            setCustomerName('');
            setNotes('');
            fetchActiveRentals();
            fetchProducts(); // Cập nhật lại danh sách váy trống

        } catch (error) {
            console.error(error);
            showAlert('Lỗi tạo lịch thuê: ' + error.message, 'error');
        }
    };

    const handleReturnDress = async (rentalId) => {
        const isConfirmed = await showConfirmAsync('Xác nhận', 'Xác nhận khách đã trả váy này?', 'Xác nhận');
        if (!isConfirmed) return;

        try {
            const res = await fetch(`https://dress-rental-backend.onrender.com/api/rentals/${rentalId}/complete`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái trả váy');

            showAlert('Đã xác nhận trả váy thành công!', 'success');
            fetchActiveRentals();
            fetchCompletedRentals();
            fetchProducts(); // Váy quay lại trạng thái AVAILABLE
        } catch (error) {
            console.error(error);
            showAlert('Lỗi: ' + error.message, 'error');
        }
    };

    const handleToggleDelivery = async (rentalId) => {
        try {
            const res = await fetch(`https://dress-rental-backend.onrender.com/api/rentals/${rentalId}/toggle-delivery`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái giao hàng');

            fetchActiveRentals(); // Cập nhật lại UI ngay lập tức
        } catch (error) {
            console.error(error);
            showAlert('Lỗi: ' + error.message, 'error');
        }
    };

    const handleDeleteRental = async (rentalId) => {
        const isConfirmed = await showConfirmAsync('Cảnh báo', 'Bạn có chắc chắn muốn XÓA đơn này? Đơn bị xóa sẽ không được tính vào doanh thu.', 'Xóa đơn');
        if (!isConfirmed) return;

        try {
            const res = await fetch(`https://dress-rental-backend.onrender.com/api/rentals/${rentalId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể xóa đơn');

            showAlert('Đã xóa đơn thành công!', 'success');
            fetchActiveRentals();
            fetchProducts();
            if (role === 'ADMIN') fetchDeletedRentals();
        } catch (error) {
            console.error(error);
            showAlert('Lỗi xóa đơn: ' + error.message, 'error');
        }
    };

    // Pagination & Search logic
    const removeAccents = (str) => {
        return str ? str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    };

    const searchKeyword = removeAccents(searchQuery);

    const filteredActiveRentals = rentals.filter(r =>
        removeAccents(r.product?.productCode).includes(searchKeyword) ||
        removeAccents(r.product?.productName).includes(searchKeyword) ||
        removeAccents(r.customerName).includes(searchKeyword)
    );

    const activeTotalPages = Math.ceil(filteredActiveRentals.length / itemsPerPage);
    const activeStartIndex = (activePage - 1) * itemsPerPage;
    const currentActiveRentals = filteredActiveRentals.slice(activeStartIndex, activeStartIndex + itemsPerPage);

    const completedSearchKeyword = removeAccents(completedSearchQuery);

    const filteredCompletedRentals = completedRentals.filter(r =>
        removeAccents(r.product?.productCode).includes(completedSearchKeyword) ||
        removeAccents(r.product?.productName).includes(completedSearchKeyword) ||
        removeAccents(r.customerName).includes(completedSearchKeyword) ||
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
                    <h1>Lịch Thuê Váy</h1>
                    <p>Quản lý tất cả đơn thuê váy hiện tại và quá khứ.</p>
                </div>
                <button className="rp-new-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Đóng' : '+ Tạo đơn mới'}
                </button>
            </div>

            {/* ── STATS CARDS ── */}
            <div className="rp-stats-row">
                <div className="rp-stat-card active-card">
                    <span className="stat-icon">👗</span>
                    <div>
                        <div className="stat-value">{rentals.length}</div>
                        <div className="stat-label">Đang cho thuê</div>
                    </div>
                </div>
                <div className="rp-stat-card overdue-card">
                    <span className="stat-icon">⚠️</span>
                    <div>
                        <div className="stat-value">{overdueRentals.length}</div>
                        <div className="stat-label">Quá hạn</div>
                    </div>
                </div>
                <div className="rp-stat-card soon-card">
                    <span className="stat-icon">🔔</span>
                    <div>
                        <div className="stat-value">{dueSoonRentals.length}</div>
                        <div className="stat-label">Đến hạn hôm nay/ngày mai</div>
                    </div>
                </div>
                <div className="rp-stat-card done-card">
                    <span className="stat-icon">✅</span>
                    <div>
                        <div className="stat-value">{completedRentals.length}</div>
                        <div className="stat-label">Đã hoàn thành (30 ngày)</div>
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
                    <h3>Tạo Đơn Thuê Mới</h3>
                    <form className="rp-form-grid" onSubmit={handleCreateRental}>
                        <div className="rp-field">
                            <label>Chọn Váy (Cho phép đặt trước)</label>
                            <select required value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                                <option value="" disabled>-- Chọn một mẫu váy --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.productCode} – {p.productName} {p.status === 'RENTED' ? '(Đang có khách thuê)' : ''}
                                    </option>
                                ))}
                            </select>
                            {selectedProduct && products.find(p => p.id === parseInt(selectedProduct)) && (
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#5b21b6', fontWeight: '500' }}>
                                    Tiền cọc yêu cầu: {Number(products.find(p => p.id === parseInt(selectedProduct)).depositAmount || 0).toLocaleString('vi-VN')} ₫
                                </div>
                            )}
                        </div>
                        <div className="rp-field">
                            <label>Ngày nhận váy</label>
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Ngày dự kiến trả</label>
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Tổng tiền (VNĐ)</label>
                            <input type="number" required placeholder="Nhập giá thỏa thuận" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Tên khách hàng</label>
                            <input type="text" placeholder="Nhập tên khách hàng" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        </div>
                        <div className="rp-field">
                            <label>Ghi chú</label>
                            <input type="text" placeholder="SĐT, địa chỉ, lưu ý..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <button type="submit" className="rp-submit-btn" style={{ gridColumn: '1 / -1' }}>Xác nhận Đặt</button>
                    </form>
                </div>
            )}

            {/* ── ACTIVE RENTALS TABLE ── */}
            <div className="rp-table-card">
                <div className="rp-table-header">
                    <h2>Đơn đang thuê</h2>
                    <div className="rp-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã, tên váy, tên khách..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setActivePage(1); }}
                        />
                    </div>
                </div>

                {currentActiveRentals.length === 0
                    ? <p className="rp-empty">Không có đơn nào khớp với tìm kiếm.</p>
                    : (
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Mã váy</th>
                                    <th>Tên váy</th>
                                    <th>Tên khách</th>
                                    <th>Ngày nhận</th>
                                    <th>Hạn trả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentActiveRentals.map(r => {
                                    const isOverdue = r.expectedReturnDate < todayStr;
                                    return (
                                        <tr key={r.id} className={`${isOverdue ? 'row-overdue' : ''} clickable-row`} onClick={() => setSelectedRentalDetails(r)}>
                                            <td><span className="order-id">#{r.id}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {r.product?.imageUrl ? <img src={`https://dress-rental-backend.onrender.com${r.product.imageUrl}`} alt="Dress" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} /> : <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }} />}
                                                    <span className="code-badge">{r.product?.productCode}</span>
                                                </div>
                                            </td>
                                            <td>{r.product?.productName}</td>
                                            <td><strong style={{ color: '#1e293b' }}>{r.customerName || '—'}</strong></td>
                                            <td>{r.receiveDate}</td>
                                            <td>
                                                <span className={isOverdue ? 'due-date overdue' : 'due-date'}>
                                                    {r.expectedReturnDate}
                                                    {isOverdue && <span className="overdue-tag">Quá hạn</span>}
                                                </span>
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
                        <button disabled={activePage === 1} onClick={() => setActivePage(c => c - 1)}>‹ Trước</button>
                        <span>{activePage} / {activeTotalPages}</span>
                        <button disabled={activePage === activeTotalPages} onClick={() => setActivePage(c => c + 1)}>Sau ›</button>
                    </div>
                )}
            </div>

            {/* ── COMPLETED RENTALS TABLE ── */}
            <div className="rp-table-card completed-card-section">
                <div className="rp-table-header">
                    <h2>Đơn đã hoàn thành <span className="subtitle-chip">30 ngày qua</span></h2>
                    <div className="rp-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã, tên váy, khách hoặc ngày..."
                            value={completedSearchQuery}
                            onChange={(e) => { setCompletedSearchQuery(e.target.value); setCompletedPage(1); }}
                        />
                    </div>
                </div>

                {currentCompletedRentals.length === 0
                    ? <p className="rp-empty">Không có đơn hoàn thành nào khớp với tìm kiếm.</p>
                    : (
                        <table className="rp-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Mã váy</th>
                                    <th>Tên váy</th>
                                    <th>Tên khách</th>
                                    <th>Ngày nhận</th>
                                    <th>Ngày trả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCompletedRentals.map(r => (
                                    <tr key={r.id} className="clickable-row" onClick={() => setSelectedRentalDetails(r)}>
                                        <td><span className="order-id">#{r.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {r.product?.imageUrl ? <img src={`https://dress-rental-backend.onrender.com${r.product.imageUrl}`} alt="Dress" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} /> : <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }} />}
                                                <span className="code-badge">{r.product?.productCode}</span>
                                            </div>
                                        </td>
                                        <td>{r.product?.productName}</td>
                                        <td><strong style={{ color: '#1e293b' }}>{r.customerName || '—'}</strong></td>
                                        <td>{r.receiveDate}</td>
                                        <td>{r.actualReturnDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }

                {completedTotalPages > 1 && (
                    <div className="rp-pagination">
                        <button disabled={completedPage === 1} onClick={() => setCompletedPage(c => c - 1)}>‹ Trước</button>
                        <span>{completedPage} / {completedTotalPages}</span>
                        <button disabled={completedPage === completedTotalPages} onClick={() => setCompletedPage(c => c + 1)}>Sau ›</button>
                    </div>
                )}
            </div>

            {/* ── DELETED RENTALS (Admin only) ── */}
            {role === 'ADMIN' && deletedRentals.length > 0 && (
                <div className="rp-table-card deleted-card-section">
                    <div className="rp-table-header">
                        <h2>Đơn Đã Xóa <span className="subtitle-chip danger-chip">Góc nhìn Admin</span></h2>
                    </div>
                    <table className="rp-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Mã váy</th>
                                <th>Tên váy</th>
                                <th>Ngày nhận</th>
                                <th>Tiền</th>
                                <th>Người xóa</th>
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
                            <button disabled={deletedPage === 1} onClick={() => setDeletedPage(c => c - 1)}>‹ Trước</button>
                            <span>{deletedPage} / {deletedTotalPages}</span>
                            <button disabled={deletedPage === deletedTotalPages} onClick={() => setDeletedPage(c => c + 1)}>Sau ›</button>
                        </div>
                    )}
                </div>
            )}

            {/* ── RENTAL DETAILS MODAL ── */}
            {selectedRentalDetails && (
                <div className="modal-overlay" onClick={() => setSelectedRentalDetails(null)}>
                    <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                Chi Tiết Đơn Hàng #{selectedRentalDetails.id}
                                {selectedRentalDetails.actualReturnDate && <span className="status-chip done" style={{ marginLeft: '10px', fontSize: '11px' }}>✓ Đã hoàn thành</span>}
                            </h2>
                            <button className="close-btn" onClick={() => setSelectedRentalDetails(null)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                                {selectedRentalDetails.product?.imageUrl ? <img src={`https://dress-rental-backend.onrender.com${selectedRentalDetails.product.imageUrl}`} alt="Dress" style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '70px', height: '70px', backgroundColor: '#e2e8f0', borderRadius: '8px' }} />}
                                <div>
                                    <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>{selectedRentalDetails.product?.productName}</strong>
                                    <span className="code-badge">{selectedRentalDetails.product?.productCode}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>👤 Khách hàng</span>
                                    <strong style={{ fontSize: '15px' }}>{selectedRentalDetails.customerName || 'Không có'}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>📝 Ghi chú</span>
                                    <span style={{ fontSize: '14px' }}>{selectedRentalDetails.notes || 'Không có'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>📅 Lịch trình</span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Nhận: {selectedRentalDetails.receiveDate}<br />
                                        Trả: {selectedRentalDetails.actualReturnDate ? selectedRentalDetails.actualReturnDate : selectedRentalDetails.expectedReturnDate}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>💰 Tài chính</span>
                                    <strong style={{ fontSize: '15px', color: '#059669', display: 'block' }}>Tổng tiền: {Number(selectedRentalDetails.totalAmount || 0).toLocaleString('vi-VN')} ₫</strong>
                                    <span style={{ fontSize: '13px', color: '#5b21b6' }}>Cọc yêu cầu: {Number(selectedRentalDetails.product?.depositAmount || 0).toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </div>

                            {!selectedRentalDetails.actualReturnDate && (
                                <div style={{ marginTop: '5px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>📦 Trạng thái giao hàng</span>
                                    <button
                                        className={`delivery-toggle ${selectedRentalDetails.deliveryStatus === 'DELIVERED' ? 'delivered' : 'booked'}`}
                                        onClick={() => { handleToggleDelivery(selectedRentalDetails.id); setSelectedRentalDetails({ ...selectedRentalDetails, deliveryStatus: selectedRentalDetails.deliveryStatus === 'DELIVERED' ? 'BOOKED' : 'DELIVERED' }); }}
                                        style={{ width: '100%', padding: '10px' }}
                                    >
                                        {selectedRentalDetails.deliveryStatus === 'DELIVERED' ? '📦 Đã giao hàng' : '⏳ Đang chờ lấy / Đã đặt'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                            {!selectedRentalDetails.actualReturnDate && (
                                <button className="act-btn return" style={{ flex: 1, padding: '12px' }} onClick={() => { handleReturnDress(selectedRentalDetails.id); setSelectedRentalDetails(null); }}>✓ Khách Đã Trả (Hoàn thành)</button>
                            )}
                            <button className="act-btn cancel" style={{ flex: 1, padding: '12px' }} onClick={() => { handleDeleteRental(selectedRentalDetails.id); setSelectedRentalDetails(null); }}>✕ Hủy Đơn Hàng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}