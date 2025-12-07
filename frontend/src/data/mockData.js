export const dashboardData = {
  metrics: [
    { title: 'Total Sales', value: '$12,450', change: '+15%', isPositive: true },
    { title: 'Foot Traffic', value: '1,240', change: '+8%', isPositive: true },
    { title: 'Conversion Rate', value: '24.5%', change: '-2%', isPositive: false },
    { title: 'Avg. Transaction', value: '$68.20', change: '+5%', isPositive: true },
  ],
  salesTrend: [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 6000 },
    { name: 'Thu', sales: 8000 },
    { name: 'Fri', sales: 11000 },
    { name: 'Sat', sales: 15000 },
    { name: 'Sun', sales: 12000 },
  ],
  categoryPerformance: [
    { name: 'Electronics', value: 45 },
    { name: 'Clothing', value: 30 },
    { name: 'Home', value: 15 },
    { name: 'Other', value: 10 },
  ]
};

export const inventoryData = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', stock: 45, status: 'In Stock', price: '$129.99' },
  { id: 2, name: 'Smart Watch', category: 'Electronics', stock: 12, status: 'Low Stock', price: '$249.99' },
  { id: 3, name: 'Running Shoes', category: 'Clothing', stock: 89, status: 'In Stock', price: '$89.99' },
  { id: 4, name: 'Cotton T-Shirt', category: 'Clothing', stock: 120, status: 'In Stock', price: '$24.99' },
  { id: 5, name: 'Coffee Maker', category: 'Home', stock: 0, status: 'Out of Stock', price: '$79.99' },
];

export const performanceData = [
  { id: 1, name: 'Sarah Johnson', role: 'Sales Lead', sales: '$15,400', transactions: 145, rating: 4.8 },
  { id: 2, name: 'Mike Chen', role: 'Associate', sales: '$12,200', transactions: 120, rating: 4.6 },
  { id: 3, name: 'Jessica Davis', role: 'Associate', sales: '$9,800', transactions: 98, rating: 4.5 },
];
