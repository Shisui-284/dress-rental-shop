USE DressRentalDB;
GO

-- ==========================================
-- XÓA BẢNG NẾU ĐÃ TỒN TẠI (Theo thứ tự khóa ngoại)
-- ==========================================
IF OBJECT_ID('dbo.RentalSchedules', 'U') IS NOT NULL 
    DROP TABLE dbo.RentalSchedules;
GO

IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL 
    DROP TABLE dbo.Products;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL 
    DROP TABLE dbo.Users;
GO

-- ==========================================
-- TẠO BẢNG MỚI
-- ==========================================

-- 1. TẠO BẢNG QUẢN LÝ TÀI KHOẢN (USERS)
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    full_name NVARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,      
    is_active BIT DEFAULT 1         
);
GO

-- 2. TẠO BẢNG QUẢN LÝ SẢN PHẨM VÁY (PRODUCTS)
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL, 
    product_name NVARCHAR(150) NOT NULL,
    size VARCHAR(10) NOT NULL,                
    color NVARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NULL,              
    status NVARCHAR(50) DEFAULT 'AVAILABLE',  
    is_deleted BIT DEFAULT 0,
    rental_price FLOAT DEFAULT 0.0,
    deposit_amount FLOAT DEFAULT 0.0
);
GO

-- 3. TẠO BẢNG QUẢN LÝ LỊCH THUÊ VÀ DOANH THU (RENTALSCHEDULES)
CREATE TABLE RentalSchedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    receive_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    total_amount DECIMAL(18,2) NOT NULL,
    created_by INT NOT NULL,
    customer_name NVARCHAR(255),
    notes NVARCHAR(1000),
    delivery_status VARCHAR(50) DEFAULT 'BOOKED',
    is_deleted BIT DEFAULT 0,
    deleted_at DATE,
    
    CONSTRAINT FK_Rental_Product FOREIGN KEY (product_id) REFERENCES Products(id),
    CONSTRAINT FK_Rental_User FOREIGN KEY (created_by) REFERENCES Users(id)
);
GO