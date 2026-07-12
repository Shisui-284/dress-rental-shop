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
        productCode: '',
        productName: '',
        size: '',
        color: '',
        imageUrl: ''
    });

    const { showAlert, showConfirmAsync } = useNotification();
    
    // Lấy token từ localStorage
    const getAuthHeaders = () => {
        return {
            'Authorization': 'Basic ' + localStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Không tìm thấy token đăng nhập!');
            return;
        }

        fetch('http://localhost:8080/api/products', {
            headers: { 'Authorization': 'Basic ' + token }
        })
            .then(res => {
                if (!res.ok) throw new Error('API Error: ' + res.status);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            })
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
        } catch (err) {
            console.error('Lỗi khi tải ảnh:', err);
            showAlert('Lỗi tải ảnh!', 'error');
        }
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/api/products', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newProduct)
        })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Lỗi HTTP ' + res.status);
            }
            return res.json();
        })
        .then(() => {
            fetchProducts();
            setShowForm(false);
            setNewProduct({ productCode: '', productName: '', size: '', color: '', imageUrl: '' });
            showAlert('Lưu sản phẩm thành công!', 'success');
        })
        .catch(err => {
            console.error('Lưu thất bại:', err);
            showAlert('Lưu sản phẩm thất bại! Nguyên nhân: ' + err.message + '\n(Có thể do Mã Váy bị trùng hoặc thiếu dữ liệu)', 'error');
        });
    };

    const handleDeleteProduct = async (productId) => {
        const confirmed = await showConfirmAsync(
            'Xác nhận xóa',
            'CẢNH BÁO: Bạn có chắc chắn muốn xóa sản phẩm này? Sản phẩm sẽ bị ẩn khỏi hệ thống.',
            'XÓA'
        );
        if (!confirmed) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/products/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Không thể xóa sản phẩm');
            
            showAlert('Đã xóa sản phẩm thành công!', 'success');
            fetchProducts();
        } catch (error) {
            console.error(error);
            showAlert('Lỗi xóa sản phẩm: ' + error.message, 'error');
        }
    };

    // Logic Tìm kiếm & Phân trang
    const filteredProducts = products.filter(p => 
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="products-page">
            {/* Elegant Hero Section */}
            <div className="hero-section">
                <img src="/src/assets/products_hero_bg.png" alt="Elegant Hero" className="hero-bg" />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Where Shadows Dance</h1>
                    <p>Discover the art of the evening. Gowns and dresses crafted to capture the mystery and allure of the night.</p>
                    <button className="explore-btn" onClick={() => {
                        document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
                    }}>
                        Explore The Collections
                    </button>
                </div>
            </div>

            {/* Main Content Section */}
            <div id="collections" className="collections-section">
                <div className="section-title">
                    <h2>An Ode to the Night</h2>
                    <p>Curated selections for your most unforgettable moments</p>
                </div>

                {/* Toolbar */}
                <div className="product-toolbar">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by name or code..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button className="new-product-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Close Form' : '+ Add New Piece'}
                    </button>
                </div>

                {showForm && (
                    <form className="elegant-form" onSubmit={handleAddProduct}>
                        <div className="form-grid">
                            <input type="text" placeholder="Product Code (e.g. V01)" required value={newProduct.productCode} onChange={e => setNewProduct({...newProduct, productCode: e.target.value})} />
                            <input type="text" placeholder="Dress Name" required value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} />
                            <input type="text" placeholder="Size (S, M, L)" required value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} />
                            <input type="text" placeholder="Color" required value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} />
                        </div>
                        <div className="file-upload-wrapper">
                            <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" className="file-input" />
                            <label htmlFor="file-upload" className="file-label">
                                📸 Upload Image
                            </label>
                            {newProduct.imageUrl && <img src={`http://localhost:8080${newProduct.imageUrl}`} alt="preview" className="image-preview" />}
                        </div>
                        <button type="submit" className="submit-product-btn">Publish to Collection</button>
                    </form>
                )}

                <div className="product-grid">
                    {currentProducts.length === 0 ? <p className="no-results">No dresses found in the collection.</p> : null}
                    {currentProducts.map(p => (
                        <div key={p.id} className="elegant-product-card">
                            <div className="card-image-wrapper">
                                <img src={p.imageUrl ? `http://localhost:8080${p.imageUrl}` : 'https://via.placeholder.com/400x600?text=No+Image'} alt={p.productName} />
                                <div className="card-overlay">
                                    <button className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>
                                        Remove Piece
                                    </button>
                                </div>
                            </div>
                            <div className="card-details">
                                <h3>{p.productName}</h3>
                                <div className="card-meta">
                                    <span>Code: {p.productCode}</span>
                                    <span>{p.color} | {p.size}</span>
                                </div>
                                <div className={`status-indicator ${p.status === 'AVAILABLE' ? 'available' : 'rented'}`}>
                                    {p.status === 'AVAILABLE' ? 'Available for Rent' : 'Currently Rented'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}