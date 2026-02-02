-- Bazarsip E-commerce Database Schema
-- PostgreSQL version

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    images TEXT[], -- Array of image URLs
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carts table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(session_id)
);

-- Cart items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    shipping_address TEXT,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (price * quantity) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_users_email ON users(email);

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'),
('Fashion', 'fashion', 'Clothing and accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'),
('Home & Living', 'home-living', 'Home decoration and furniture', 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'),
('Books', 'books', 'Books and magazines', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800'),
('Sports', 'sports', 'Sports equipment and gear', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800');

-- Insert sample products
INSERT INTO products (name, slug, description, price, stock, image_url, images, category_id, is_active) VALUES
('Gaming Laptop Pro', 'gaming-laptop-pro', 'High-performance gaming laptop with RTX 4060 graphics card, 16GB RAM, 512GB SSD', 15000000.00, 25, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', ARRAY['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'], 1, true),
('Wireless Headphones', 'wireless-headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 2500000.00, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'], 1, true),
('Smartphone X Pro', 'smartphone-x-pro', 'Latest flagship smartphone with amazing camera and 5G connectivity', 12000000.00, 30, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'], 1, true),
('Mechanical Keyboard', 'mechanical-keyboard', 'RGB mechanical keyboard with Cherry MX switches', 1500000.00, 40, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'], 1, true),
('Casual T-Shirt', 'casual-t-shirt', 'Comfortable cotton t-shirt available in multiple colors', 150000.00, 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], 2, true),
('Denim Jeans', 'denim-jeans', 'Classic denim jeans with modern fit', 350000.00, 75, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'], 2, true),
('Coffee Table', 'coffee-table', 'Modern wooden coffee table for living room', 2000000.00, 15, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800', ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800'], 3, true),
('Table Lamp', 'table-lamp', 'Elegant table lamp with adjustable brightness', 500000.00, 35, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'], 3, true),
('Programming Book', 'programming-book', 'Complete guide to modern web development', 250000.00, 60, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800', ARRAY['https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800'], 4, true),
('Yoga Mat', 'yoga-mat', 'Non-slip yoga mat for comfortable exercise', 300000.00, 45, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'], 5, true);

-- Insert sample admin user (password: admin123)
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@bazarsip.com', '$2b$10$rKqVFvHvVZEPQNmqVxN0i.mxqJFvQJLqvCQXk7P8S3f5YGV9FqL8K', 'admin');

-- Insert sample customer user (password: customer123)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'customer@bazarsip.com', '$2b$10$t3vqR1IbGrP1mxVXJhQNAuqPh7GdXVLvL3k9qP7GdXVLvL3k9qP7G', 'customer');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Add indexes for better query performance

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);