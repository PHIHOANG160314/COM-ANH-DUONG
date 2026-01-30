import React from 'react';

interface MenuItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
  onAddToCart?: (id: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  available,
  onAddToCart,
}) => {
  return (
    <div className="menu-item-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="menu-item-image h-48 bg-gray-200 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">HẾT HÀNG</span>
          </div>
        )}
      </div>

      <div className="menu-item-info p-4">
        <div className="category text-xs text-gray-500 uppercase mb-1">
          {category}
        </div>
        <h3 className="menu-item-name font-bold text-lg mb-2">{name}</h3>
        {description && (
          <p className="menu-item-description text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="menu-item-footer flex justify-between items-center">
          <span className="price text-xl font-bold text-green-600">
            {price.toLocaleString('vi-VN')}đ
          </span>
          {available && onAddToCart && (
            <button
              onClick={() => onAddToCart(id)}
              className="btn-add bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              + Thêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
