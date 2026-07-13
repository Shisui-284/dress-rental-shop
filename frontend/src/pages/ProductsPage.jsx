import { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationContext';
import './ProductsPage.css';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        productCode: '', productName: '', size: '',
        color: '', imageUrl: '', rentalPrice: '', depositAmount: ''
    });

    const { showAlert, showConfirmAsync } = useNotification();

    const getAuthHeaders = () => ({
        'Authorization': 'Basic ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
    });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch('http://localhost:8080/api/products', {
            headers: { 'Authorization': 'Basic ' + token }
        })
        .then(res => { if (!res.ok) throw new Error('API Error'); return res.json(); })
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(err => console.error('Lỗi khi tải sản phẩm:', err));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                headers: { 'Authorization': 'Basic ' + localStorage.getItem('authToken') },
                body: formData
            });
            const data = await res.json();
            setNewProduct({ ...newProduct, imageUrl: data.imageUrl });
            showAlert('Tải ảnh thành công!', 'success');
        } catch { showAlert('Lỗi tải ảnh!', 'error'); }
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        const payload = { ...newProduct, rentalPrice: Number(newProduct.rentalPrice) || 0, depositAmount: Number(newProduct.depositAmount) || 0 };
        fetch('http://localhost:8080/api/products', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) })
        .then(async res => { if (!res.ok) { const t = await res.text(); throw new Error(t); } return res.json(); })
        .then(() => {
            fetchProducts();
            setShowForm(false);
            setNewProduct({ productCode: '', productName: '', size: '', color: '', imageUrl: '', rentalPrice: '', depositAmount: '' });
            showAlert('Thêm mẫu váy thành công!', 'success');
        })
        .catch(err => showAlert('Lỗi: ' + err.message, 'error'));
    };

    const handleDeleteProduct = async (productId) => {
        const confirmed = await showConfirmAsync('Xác nhận xóa', 'Bạn có chắc muốn ẩn sản phẩm này khỏi hệ thống?', 'XÓA');
        if (!confirmed) return;
        try {
            const res = await fetch(`http://localhost:8080/api/products/${productId}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Không thể xóa');
            showAlert('Đã xóa sản phẩm thành công!', 'success');
            fetchProducts();
        } catch (err) { showAlert('Lỗi: ' + err.message, 'error'); }
    };

    const filteredProducts = products.filter(p =>
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const availableCount = products.filter(p => p.status === 'AVAILABLE').length;
    const rentedCount = products.filter(p => p.status === 'RENTED').length;

    // Marquee items (doubled for seamless loop)
    const marqueeItems = ['Váy cao cấp', 'Thuê nhanh — Đẹp chuẩn', 'Sự kiện nào cũng hoàn hảo', 'Hàng trăm mẫu mới', 'Giá hợp lý · Chất lượng đỉnh'];
    const allItems = [...marqueeItems, ...marqueeItems];

    return (
        <div className="products-page">

            {/* ANNOUNCE BAR */}
            <div className="announce-bar">
                🎉 Bộ sưu tập mới vừa cập bến — Đặt lịch trước để không bỏ lỡ!
            </div>

            {/* HERO */}
            <div className="hero-section">
                <div className="hero-watermark">VÁY</div>
                <div className="hero-inner">
                    {/* LEFT TEXT */}
                    <div className="hero-left">
                        <div className="hero-eyebrow">Bộ sưu tập 2025</div>
                        <h1>
                            VÁY ĐẸP<br />
                            CHO MỌI<br />
                            <span className="highlight">DỊP QUAN TRỌNG</span>
                        </h1>
                        <p>
                            Khám phá hàng trăm mẫu váy cao cấp — từ đầm dạ hội sang trọng đến
                            trang phục công sở thanh lịch. Thuê dễ, mặc đẹp, giá vừa túi.
                        </p>
                        <div className="hero-cta-row">
                            <button className="hero-btn-main" onClick={() => {
                                document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                Xem Bộ Sưu Tập
                            </button>
                            <button className="hero-btn-outline" onClick={() => {
                                setShowForm(true);
                                document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                + Thêm Mẫu Mới
                            </button>
                        </div>
                        <div className="hero-trust">
                            <div className="hero-trust-item">
                                <strong>{products.length}+</strong>
                                <span>Mẫu váy</span>
                            </div>
                            <div className="hero-trust-item">
                                <strong>{availableCount}</strong>
                                <span>Sẵn sàng</span>
                            </div>
                            <div className="hero-trust-item">
                                <strong>100%</strong>
                                <span>Hài lòng</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="hero-right">
                        <img
                            src="/src/assets/dress_hero_fashion.png"
                            alt="Váy thời trang"
                            className="hero-model-img"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=700&fit=crop'; }}
                        />
                        <div className="hero-tag-float">
                            <div className="hero-tag-label">Mới nhất hôm nay</div>
                            <div className="hero-tag-value">{products.filter(p => p.status === 'AVAILABLE').length} váy sẵn sàng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MARQUEE */}
            <div className="marquee-strip">
                <div className="marquee-track">
                    {allItems.map((item, i) => (
                        <span key={i} className="marquee-item">
                            {item} <span className="dot">★</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* COLLECTIONS */}
            <div id="collections" className="collections-section">
                {/* Header */}
                <div className="section-header-row">
                    <div className="section-title-block">
                        <h2>BỘ SƯU TẬP <span>VÁY THUÊ</span></h2>
                        <p>Quản lý và tìm kiếm toàn bộ kho hàng của cửa hàng</p>
                    </div>
                    <div className="stats-row">
                        <div className="stat-item">
                            <strong>{products.length}</strong>
                            <span>Tổng sản phẩm</span>
                        </div>
                        <div className="stat-item">
                            <strong>{availableCount}</strong>
                            <span>Đang rảnh</span>
                        </div>
                        <div className="stat-item">
                            <strong>{rentedCount}</strong>
                            <span>Đang thuê</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="product-toolbar">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc mã váy..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button className="new-product-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Đóng form' : '+ Thêm mẫu váy'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form className="elegant-form" onSubmit={handleAddProduct}>
                        <div className="form-grid">
                            <input type="text" placeholder="Mã váy (VD: V01)" required value={newProduct.productCode} onChange={e => setNewProduct({...newProduct, productCode: e.target.value})} />
                            <input type="text" placeholder="Tên váy" required value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} />
                            <input type="text" placeholder="Kích cỡ (S, M, L)" required value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} />
                            <input type="text" placeholder="Màu sắc" required value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} />
                            <input type="number" placeholder="Giá thuê (VNĐ)" required value={newProduct.rentalPrice} onChange={e => setNewProduct({...newProduct, rentalPrice: e.target.value})} />
                            <input type="number" placeholder="Tiền cọc (VNĐ)" required value={newProduct.depositAmount} onChange={e => setNewProduct({...newProduct, depositAmount: e.target.value})} />
                        </div>
                        <div className="file-upload-wrapper">
                            <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" className="file-input" />
                            <label htmlFor="file-upload" className="file-label">📸 Tải ảnh lên</label>
                            {newProduct.imageUrl && <img src={`http://localhost:8080${newProduct.imageUrl}`} alt="preview" className="image-preview" />}
                        </div>
                        <button type="submit" className="submit-product-btn">THÊM VÀO BỘ SƯU TẬP</button>
                    </form>
                )}

                {/* Grid */}
                <div className="product-grid">
                    {currentProducts.length === 0 && (
                        <p className="no-results">Không tìm thấy mẫu váy nào phù hợp.</p>
                    )}
                    {currentProducts.map(p => (
                        <div key={p.id} className="elegant-product-card">
                            <div className="card-image-wrapper">
                                <img
                                    src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : 'https://via.placeholder.com/400x600/f5f5f5/999?text=Chưa+có+ảnh'}
                                    alt={p.productName}
                                />
                                <div className="card-overlay">
                                    <button className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>
                                        🗑 Xóa sản phẩm
                                    </button>
                                </div>
                            </div>
                            <div className="card-details">
                                <h3>{p.productName}</h3>
                                <div className="card-meta">
                                    <span>#{p.productCode}</span>
                                    <span>{p.color} · {p.size}</span>
                                </div>
                                <div className="card-price-row">
                                    <span className="price-rent">{Number(p.rentalPrice || 0).toLocaleString('vi-VN')} ₫</span>
                                    <span className="price-deposit">Cọc: {Number(p.depositAmount || 0).toLocaleString('vi-VN')} ₫</span>
                                </div>
                                <div className={`status-indicator ${p.status === 'AVAILABLE' ? 'available' : 'rented'}`}>
                                    {p.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đang thuê'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>← Trước</button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Sau →</button>
                    </div>
                )}
            </div>
        </div>
    );
}