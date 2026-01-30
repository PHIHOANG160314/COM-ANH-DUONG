import React from 'react';

interface OrderCardProps {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  onStatusChange?: (newStatus: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  customerName,
  items,
  totalPrice,
  status,
  createdAt,
  onStatusChange,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-400';
      case 'preparing': return 'bg-blue-100 border-blue-400';
      case 'ready': return 'bg-green-100 border-green-400';
      case 'completed': return 'bg-gray-100 border-gray-400';
      default: return 'bg-white border-gray-300';
    }
  };

  return (
    <div className={`order-card border-2 rounded-lg p-4 mb-3 ${getStatusColor()}`}>
      <div className="order-header flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">#{orderId}</h3>
        <span className="text-sm text-gray-600">{createdAt}</span>
      </div>

      <div className="customer-info mb-3">
        <p className="font-semibold">👤 {customerName}</p>
      </div>

      <div className="order-items mb-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
          </div>
        ))}
      </div>

      <div className="order-total border-t pt-2 mb-3">
        <div className="flex justify-between font-bold">
          <span>Tổng cộng:</span>
          <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {onStatusChange && (
        <div className="order-actions">
          {status === 'pending' && (
            <button
              onClick={() => onStatusChange('preparing')}
              className="btn-primary w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              ✅ Bắt đầu nấu
            </button>
          )}
          {status === 'preparing' && (
            <button
              onClick={() => onStatusChange('ready')}
              className="btn-success w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              🍽️ Hoàn thành
            </button>
          )}
        </div>
      )}
    </div>
  );
};
