import React from "react";

export default function Modal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Order {order.id}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Placed on {new Date(order.date).toLocaleDateString()}
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
          <div className="space-y-4">
            {order.products.map((p, i) => (
              <div key={i} className="flex items-center">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="ml-4">
                  <h4 className="text-sm font-medium">{p.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {p.quantity}</p>
                  <p className="text-sm font-semibold">${p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Order Information
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Items</dt>
              <dd>{order.items}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="font-semibold">${order.total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tracking</dt>
              <dd>{order.tracking}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Est. Delivery</dt>
              <dd>{new Date(order.deliveryDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
