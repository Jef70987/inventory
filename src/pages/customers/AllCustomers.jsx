import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Calendar,
  CheckCircle,
  X,
  AlertCircle,
  Download,
  MessageCircle,
  MoreVertical
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AllCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@email.com",
      phone: "+1 234-567-8900",
      address: "123 Main St, City",
      totalPurchases: 245.00,
      orders: 12,
      status: "Active",
      joined: "2026-01-15",
      lastPurchase: "2026-08-05"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@email.com",
      phone: "+1 234-567-8901",
      address: "456 Oak Ave, Town",
      totalPurchases: 132.50,
      orders: 8,
      status: "Active",
      joined: "2026-02-20",
      lastPurchase: "2026-08-04"
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@email.com",
      phone: "+1 234-567-8902",
      address: "789 Pine Rd, Village",
      totalPurchases: 378.00,
      orders: 15,
      status: "Active",
      joined: "2025-11-10",
      lastPurchase: "2026-08-03"
    },
    {
      id: 4,
      name: "Mary Williams",
      email: "mary@email.com",
      phone: "+1 234-567-8903",
      address: "101 Elm St, Suburb",
      totalPurchases: 56.00,
      orders: 3,
      status: "Inactive",
      joined: "2026-03-05",
      lastPurchase: "2026-07-25"
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael@email.com",
      phone: "+1 234-567-8904",
      address: "202 Cedar Ln, District",
      totalPurchases: 92.50,
      orders: 6,
      status: "Active",
      joined: "2026-04-12",
      lastPurchase: "2026-08-02"
    },
    {
      id: 6,
      name: "Sarah Davis",
      email: "sarah@email.com",
      phone: "+1 234-567-8905",
      address: "303 Birch Blvd, County",
      totalPurchases: 189.00,
      orders: 10,
      status: "Active",
      joined: "2025-12-01",
      lastPurchase: "2026-08-01"
    },
    {
      id: 7,
      name: "David Wilson",
      email: "david@email.com",
      phone: "+1 234-567-8906",
      address: "404 Maple Dr, City",
      totalPurchases: 215.00,
      orders: 9,
      status: "Active",
      joined: "2026-01-25",
      lastPurchase: "2026-07-30"
    },
    {
      id: 8,
      name: "Lisa Taylor",
      email: "lisa@email.com",
      phone: "+1 234-567-8907",
      address: "505 Walnut St, Town",
      totalPurchases: 67.50,
      orders: 4,
      status: "Inactive",
      joined: "2026-02-28",
      lastPurchase: "2026-06-15"
    }
  ];

  // Chart Data
  const customerStatusData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [6, 2],
        backgroundColor: ['#166534', '#991b1b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const customerSpendingData = {
    labels: ['John Doe', 'Robert Johnson', 'David Wilson', 'Sarah Davis', 'Others'],
    datasets: [
      {
        label: 'Total Purchases ($)',
        data: [245, 378, 215, 189, 348],
        backgroundColor: '#1e3a5f',
        borderRadius: 0
      }
    ]
  };

  const monthlyCustomerData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'New Customers',
        data: [2, 3, 1, 2, 0, 1, 0, 1],
        backgroundColor: '#f97316',
        borderRadius: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 12 }
        }
      }
    },
    cutout: '60%'
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Inactive': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedCustomer(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedCustomer(null);
  };

  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);

  const handleView = (customer) => {
    showCustomModal(
      `Customer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Purchases: $${customer.totalPurchases.toFixed(2)}\nOrders: ${customer.orders}\nStatus: ${customer.status}\nJoined: ${customer.joined}`,
      "info",
      customer
    );
  };

  const handleDelete = (customer) => {
    showCustomModal(`Customer ${customer.name} has been deleted!`, "success", customer);
  };

  const handleSendMessage = (customer) => {
    showCustomModal(`Message sent to ${customer.name}!`, "success", customer);
  };

  const handleExport = () => {
    showCustomModal("Customers data exported successfully!", "success");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertCircle size={28} className="text-red-800" />}
                {modalType === "info" && <AlertCircle size={28} className="text-blue-950" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : modalType === "error" ? "Error" : "Information"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
              {selectedCustomer && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedCustomer.email}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedCustomer.totalPurchases.toFixed(2)}</p>
                </div>
              )}
            </div>
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">All Customers</h1>
          <p className="text-gray-600 font-medium text-sm">Manage your customer base and purchase history</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/customers/add">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Add Customer</span>
            </button>
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Customers</p>
              <p className="text-2xl font-bold text-blue-950">{totalCustomers}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Users size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-green-800">{activeCount}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-orange-600">{totalOrders}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <ShoppingCart size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-950">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Customer Status</h2>
          <div className="h-52">
            <Doughnut data={customerStatusData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Top Spending Customers</h2>
          <div className="h-52">
            <Bar data={customerSpendingData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">New Customers (Monthly)</h2>
          <div className="h-52">
            <Bar data={monthlyCustomerData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950">
            <Filter size={16} />
            Apply
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Address</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Purchases</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Orders</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Joined</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-bold text-blue-950">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.lastPurchase}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Mail size={12} /> {customer.email}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Phone size={12} /> {customer.phone}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm flex items-center gap-1">
                  <MapPin size={12} />
                  {customer.address}
                </td>
                <td className="py-3 px-4 font-bold text-blue-950">${customer.totalPurchases.toFixed(2)}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-950">{customer.orders}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">{customer.joined}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(customer)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <Link to={`/customers/${customer.id}`}>
                      <button className="text-orange-600 hover:text-orange-800 transition-colors">
                        <Edit size={16} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleSendMessage(customer)}
                      className="text-blue-950 hover:text-blue-700 transition-colors"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="text-red-800 hover:text-red-900 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllCustomers;