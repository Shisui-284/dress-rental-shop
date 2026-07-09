import { useState, useEffect } from 'react';
import './ProductsPage.css';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    
    useEffect(() => {
        fetch('http://localhost:8080/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="products-page">
            <h2>Quản lý Váy (Sản Phẩm)</h2>
            <div className="product-grid">
                {products.length === 0 ? <p>Chưa có sản phẩm nào. Đang chờ API...</p> : null}
                {products.map(p => (
                    <div key={p.id} className="product-card">
                        <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt={p.productName} />
                        <h3>{p.productName} ({p.productCode})</h3>
                        <p>Size: {p.size} | Màu: {p.color}</p>
                        <p>Giá thuê: {p.pricePerDay} VND/Ngày</p>
                        <p>Trạng thái: <strong>{p.status}</strong></p>
                    </div>
                ))}
            </div>
        </div>
    );
}