USE DressRentalDB;
GO

-- 1. TẠO BẢNG QUẢN LÝ TÀI KHOẢN (USERS)
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    full_name NVARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,      
    is_active BIT DEFAULT 1         
);

-- 2. TẠO BẢNG QUẢN LÝ SẢN PHẨM VÁY (PRODUCTS) - Đã bỏ cột giá
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL, 
    product_name NVARCHAR(150) NOT NULL,
    size VARCHAR(10) NOT NULL,                
    color NVARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NULL,              
    status NVARCHAR(50) DEFAULT 'AVAILABLE',  
    is_deleted BIT DEFAULT 0                  
);

-- 3. TẠO BẢNG QUẢN LÝ LỊCH THUÊ VÀ DOANH THU (RENTAL_SCHEDULES)
CREATE TABLE RentalSchedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    receive_date DATE NOT NULL,               
    expected_return_date DATE NOT NULL,      
    actual_return_date DATE NULL,             
    total_amount DECIMAL(18, 2) NOT NULL,     -- Tiền thuê chốt từ bên ngoài, nhập tay vào đây
    created_by INT NOT NULL,                  
    
    CONSTRAINT FK_Rental_Product FOREIGN KEY (product_id) REFERENCES Products(id),
    CONSTRAINT FK_Rental_User FOREIGN KEY (created_by) REFERENCES Users(id)
);