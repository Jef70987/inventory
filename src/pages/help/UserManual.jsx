import { useState, useMemo } from "react";
import {
  BookOpen, Search, ChevronRight, Printer, Rocket, LayoutDashboard,
  Package, Warehouse, Truck, ShoppingBag, Users, ShoppingCart, FileText,
  BarChart3, UserCog, Settings, HelpCircle, KeyRound, RotateCcw, X
} from "lucide-react";

const sections = [
  {
    id: "intro",
    icon: BookOpen,
    title: "Introduction",
    body: `
This is a desktop point-of-sale and inventory management system. It runs entirely on your own computer. Internet is only required for setup, periodic license verification, and cloud backups.

Core modules:
- Point of Sale — fast checkout with barcode scanning
- Inventory — products, stock levels, adjustments, transfers
- Purchases — supplier orders and receiving
- Customers — records and purchase history
- Invoices — billing and payment tracking
- Reports — sales, profit, revenue, supplier analytics
- Multi-user — admin and cashier roles with fine-grained permissions
- Backups — automatic cloud backup during scheduled online windows
    `,
  },
  {
    id: "setup",
    icon: Rocket,
    title: "First-Time Setup",
    body: `
The setup wizard runs automatically on first launch. It has seven steps.

Step 1 — Access Verification
Enter the access code you received after purchase. Internet is required.

Step 2 — Generate License
Click "Generate License Key". The system contacts the license server and issues a key. Save it — you will need it on reinstall.

Step 3 — Plan
Shows the plan associated with your purchase: one-time, rent-to-own, or subscription. Review and continue.

Step 4 — Shop Details
Shop name, shop type, physical location, and owner name.

Step 5 — Contact Information
Phone number and email address. Used for support and renewal notices.

Step 6 — Admin Credentials
Username is fixed as "admin". A strong password is generated automatically. Save it now — it will not be shown again.

Step 7 — Done
The system verifies internet connectivity. Once connected, you are taken into the application.

Note: Do not close the setup window mid-process. Stay online during installation.
    `,
  },
  {
    id: "login",
    icon: KeyRound,
    title: "Logging In",
    body: `
Enter your username and password, then click Login.

Session duration is 7 days. You remain signed in across application restarts unless you explicitly log out.

Forgot password:
1. Click "Forgot password?" on the login screen.
2. Enter your username, phone number, or email.
3. Click "Send Reset Code".
4. A 6-digit code is generated (during setup phase it is shown on screen).
5. Enter the code with your new password.
6. Click "Set New Password".
    `,
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    body: `
The dashboard is your home screen. It summarises business performance at a glance.

KPI cards: Total Revenue, Total Sales, Total Products, Low Stock Items.

Revenue Trend
Monthly revenue comparison between the current year and the previous year.

Product Categories
Sales revenue split across product categories.

Weekly Sales Performance
Daily sales for the last seven days plotted against a weekly target.

Quick Stats
Today's revenue, number of orders today, average order value, and count of active customers.

Recent Orders
The six most recent transactions with customer, amount, status, and date.

Low Stock Alert
Products at or below their reorder level. Click Reorder to jump straight to the adjustment screen.

Actions:
- Export PDF produces a snapshot of the current KPIs and stats.
    `,
  },
  {
    id: "inventory",
    icon: Package,
    title: "Inventory",
    body: `
Lookups — Categories, Brands, Units
Set these up before adding products.
- Category describes what kind of product it is (Tools, Paint, Cement).
- Brand identifies the manufacturer (Bosch, Simba, Bamburi).
- Unit defines how the product is sold (Piece, Kilogram, Litre, Bag).

Products
Add a product with name, SKU (auto-generate or type), barcode, category, brand, unit, cost price, selling price, and reorder level. Optional: shelf location, weight, dimensions, description.
Edit or deactivate existing products from the list. Products with sales history cannot be deleted — mark them inactive.

Stock Adjustment
Use this for opening stock, damage, theft, expiry, or stock count corrections.
1. Search and select a product.
2. Choose the warehouse.
3. Choose Add or Remove.
4. Enter quantity.
5. Select a reason.
6. Optionally add notes.
7. Apply adjustment.
Every adjustment is logged in the audit trail.

Low Stock and Out of Stock
Low stock shows products with quantity greater than zero but at or below the reorder level.
Out of stock shows products with zero quantity.
Both pages provide a shortcut to the stock adjustment screen.
    `,
  },
  {
    id: "warehouses",
    icon: Warehouse,
    title: "Warehouses and Transfers",
    body: `
A single shop has one warehouse, created automatically and named after the shop. Rename it if desired, or add more locations.

Stock Transfers
Move stock between warehouses:
1. Click New Transfer.
2. Select the source and destination warehouses.
3. Add products, filtering by category or brand.
4. Enter quantities.
5. Create Transfer.

The transfer starts as pending. Stock is not moved until you click the complete action and confirm. Completed transfers are recorded in stock history.
    `,
  },
  {
    id: "suppliers",
    icon: Truck,
    title: "Suppliers",
    body: `
Path: Purchases → Suppliers

Adding a supplier requires a name. Other fields (contact person, phone, email, address, payment terms, rating) are optional but recommended.

Suppliers that have purchase orders cannot be deleted. Deactivate them instead.
    `,
  },
  {
    id: "purchases",
    icon: ShoppingBag,
    title: "Purchases and Receiving",
    body: `
Create Purchase Order
1. Select a supplier.
2. Set the expected delivery date.
3. Add products with quantity and unit cost.
4. Review the grand total.
5. Create Order.

Purchase order statuses:
- Pending — placed, awaiting delivery
- Shipped — dispatched by supplier
- Received — fully received into stock
- Cancelled — voided

Receive Stock
When goods arrive:
1. Select the purchase order.
2. Choose the receiving warehouse.
3. Enter received quantities per line (partial receipt is allowed).
4. Confirm Receipt.

Stock is added to the warehouse, a goods received note is created, and the purchase order status is updated.
    `,
  },
  {
    id: "customers",
    icon: Users,
    title: "Customers",
    body: `
Path: Customers → All Customers

Adding a customer requires name and phone. Optional: email, full address, country, status, and notes. Customers can be assigned to a group such as Wholesale, Retail, or VIP.

Click the eye icon on a customer to view their full purchase history — every receipt, date, amount, and status.
    `,
  },
  {
    id: "pos",
    icon: ShoppingCart,
    title: "Point of Sale",
    body: `
Path: Sales → Point of Sale

Making a sale:
1. Add products by searching by name or SKU, or by scanning a barcode.
2. Adjust quantities using the plus and minus controls.
3. Optionally select a customer. Walk-in is the default.
4. Click Charge.
5. Choose payment method:
   - Cash — enter amount received, the system calculates change.
   - M-Pesa — enter amount and M-Pesa reference.
   - Card — enter amount and reference.
   - Bank — enter amount and reference.
6. Confirm the sale.
7. A receipt is generated. Click New Sale to start the next transaction.

The next receipt number is displayed in the header so you always know what will be issued.
    `,
  },
  {
    id: "sales",
    icon: FileText,
    title: "Sales History and Returns",
    body: `
All Sales
Full transaction history with search and filters. Click the eye icon to view a sale's line items and payments.

Sales Returns
When a customer brings items back:
1. Click New Return.
2. Select the original sale.
3. Enter the return quantity for each line.
4. Enter the reason.
5. Select the refund method (Cash, M-Pesa, Card, Bank, Store Credit).
6. Select the stock condition:
   - Resellable — items are added back to inventory.
   - Damaged or Expired — items are written off and not restocked.
7. Create Return.

The return starts as pending. Approve to process the refund and update stock; reject to cancel. Approved returns are reflected in all reports — refunded sales are excluded from revenue and profit calculations.
    `,
  },
  {
    id: "invoices",
    icon: FileText,
    title: "Invoices",
    body: `
Path: Invoices → All Invoices

Create an invoice:
1. Select a customer.
2. Set issue and due dates.
3. Add products from the catalogue, or add custom lines.
4. Optionally apply a discount and add notes.
5. Create Invoice.

Invoice numbers follow the pattern INV-YYYY-NNNN.

Managing invoices:
- Click the eye icon to view items and payments.
- Click Pay to record a payment. Partial payments are supported.
- The invoice status automatically becomes paid once the full amount is settled.
- An invoice with recorded payments cannot be deleted.

Invoice Settings
Configure company name, address, phone, email, website, logo, currency, payment terms, and footer text. These details appear on every invoice you issue.
    `,
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Reports",
    body: `
Daily Sales
Pick a date to see total sales, revenue, average order value, unique customers, hourly sales, top products, and payment method breakdown.

Top Products
Pick a period to see best-selling products ranked by revenue, with quantity sold and margin percentage.

Sales Reports
Sales trend over time, sales by category, and category breakdown.

Period Reports
Weekly, monthly, and yearly views with year-over-year comparisons for revenue, orders, and customer counts.

Profit Margin
Per-product margin analysis, highest and lowest margins, and total profit for the period.

Revenue Tracking
Revenue vs expenses, monthly profit, revenue sources by payment method, and a financial summary including cost of goods sold and operating expenses.

Supplier Performance
On-time delivery percentage, received vs pending orders, total spend, average order value, and rating per supplier.

All reports support:
- Print PDF — generates a formatted PDF file that can be opened in any PDF viewer.
- Export CSV — generates a spreadsheet-ready file that opens in Excel, LibreOffice, or Google Sheets.
    `,
  },
  {
    id: "users",
    icon: UserCog,
    title: "Users, Groups, and Permissions",
    body: `
Users
Add User: full name, username, email, phone, password (generated or typed), and groups.
Edit User: update details, change group membership, reset the password.
Delete User: the last remaining admin cannot be deleted.

Groups
A group is a bundle of permissions. The admin creates groups such as Cashier, Storekeeper, Manager. Each group can be assigned any combination of permissions.

Permissions
Permissions are predefined. Tick or untick them per group.
The Admin group always has all permissions.
A user receives the union of all permissions from every group they belong to.
    `,
  },
  {
    id: "audit",
    icon: Settings,
    title: "Audit Trail",
    body: `
Path: Users → Audit Trail

Every action in the system is logged with:
- The user who performed it
- The action taken
- The module affected
- The target record
- The timestamp

Use this to investigate issues, verify changes, or meet compliance requirements.
    `,
  },
  {
    id: "backup",
    icon: RotateCcw,
    title: "Backup and License",
    body: `
The system must connect to the internet for one hour, twice a week. During these online windows:
- The license is verified against the server.
- The local database is backed up to cloud storage.
- Application updates are checked and applied.

If a scheduled window is missed, a short grace period applies before the application locks until the next successful check-in.

Your database is stored as a file on your computer. You own your data. Contact support to restore from cloud backup if your machine fails.
    `,
  },
  {
    id: "troubleshooting",
    icon: HelpCircle,
    title: "Troubleshooting",
    body: `
Cannot log in
- Verify username and password.
- Use "Forgot password" to reset.

Login screen appears frozen
- Restart the application.
- Confirm your system clock is set correctly.

A sale is not saving
- The payment amount must be equal to or greater than the total.
- M-Pesa requires a reference.
- Confirm stock is available for all items.

Low stock alerts not appearing
- Low stock shows only products with quantity greater than zero and less than or equal to the reorder level.
- Products at zero appear in Out of Stock instead.

Print or export not working
- A save location must be selected when the file dialog opens.
- Verify write permissions in the selected folder.

Any other issue
- Contact support with a screenshot and a short description of the steps that led to the problem.
    `,
  },
  {
    id: "glossary",
    icon: BookOpen,
    title: "Glossary",
    body: `
POS — Point of Sale. The checkout screen.
SKU — Stock Keeping Unit. A unique code assigned to each product.
Reorder Level — The minimum stock quantity before a product should be reordered.
GRN — Goods Received Note. Created when purchased stock arrives.
COGS — Cost of Goods Sold. Calculated as cost price multiplied by quantity sold.
Profit — Revenue minus cost of goods sold minus operating expenses.
Margin — Profit as a percentage of revenue.
Receipt — Proof of a point-of-sale transaction. Format: RCP-YYYY-NNNN.
Invoice — A bill issued to a customer for later payment. Format: INV-YYYY-NNNN.
Warehouse — A physical location where stock is held.
Transfer — Movement of stock between warehouses.
Return — A customer bringing back a purchased item. May restock or write off.
Write-off — Removing stock from inventory without returning it to sale.
Audit Trail — A chronological log of every action performed in the system.
Session — The period during which you remain signed in.
License — The key that activates and validates this installation.
    `,
  },
];

const UserManual = () => {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(sections[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
    );
  }, [query]);

  const active = sections.find((s) => s.id === activeId) || sections[0];
  const ActiveIcon = active.icon;

  const handleNavClick = (id) => {
    setActiveId(id);
    setMobileNavOpen(false);
  };

  const print = () => window.print();

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-blue-950/20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950 p-3 border-2 border-white/20">
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-950">User Manual</h1>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">
              Complete guide to running the system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-white border-2 border-blue-950/20 px-3 py-2 text-blue-950 font-bold text-xs"
          >
            <BookOpen size={14} /> Contents
          </button>
          <button
            onClick={print}
            className="flex items-center gap-2 bg-blue-950 text-white px-3 py-2 font-bold hover:bg-blue-900 border-2 border-blue-950 text-xs sm:text-sm"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar nav — desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white border-2 border-blue-950/10 shadow-sm sticky top-4">
            <div className="p-3 border-b-2 border-blue-950/10">
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-1.5">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-sm font-medium text-blue-950 outline-none"
                />
              </div>
            </div>
            <nav className="p-2 max-h-[70vh] overflow-y-auto">
              {filtered.map((s) => {
                const Icon = s.icon;
                const isActive = activeId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleNavClick(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors border-l-4 ${
                      isActive
                        ? "bg-blue-950/5 border-orange-500 text-blue-950 font-bold"
                        : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-blue-950"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-orange-500" : "text-gray-400"}
                    />
                    <span className="truncate">{s.title}</span>
                    {isActive && (
                      <ChevronRight size={14} className="ml-auto text-orange-500" />
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-xs text-gray-500 font-medium p-4 text-center">
                  No topics match your search.
                </p>
              )}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <section className="lg:col-span-3">
          <article className="bg-white border-2 border-blue-950/10 shadow-sm">
            <header className="flex items-start gap-3 p-4 sm:p-6 border-b-2 border-blue-950/10">
              <div className="bg-blue-950 p-3 border-2 border-white/20 flex-shrink-0">
                <ActiveIcon size={22} color="white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-blue-950">
                  {active.title}
                </h2>
                <p className="text-gray-500 font-medium text-xs mt-1">
                  Section {sections.findIndex((s) => s.id === active.id) + 1} of{" "}
                  {sections.length}
                </p>
              </div>
            </header>
            <div className="p-4 sm:p-6">
              <ManualBody body={active.body} />
            </div>

            {/* Prev / Next */}
            <footer className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t-2 border-blue-950/10">
              {(() => {
                const idx = sections.findIndex((s) => s.id === active.id);
                const prev = idx > 0 ? sections[idx - 1] : null;
                const next = idx < sections.length - 1 ? sections[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => handleNavClick(prev.id)}
                        className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold border-2 border-blue-950/20 text-blue-950 hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight size={14} className="rotate-180" />
                        {prev.title}
                      </button>
                    ) : (
                      <span />
                    )}
                    {next ? (
                      <button
                        onClick={() => handleNavClick(next.id)}
                        className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold border-2 border-blue-950 bg-blue-950 text-white hover:bg-blue-900 transition-colors ml-auto"
                      >
                        {next.title}
                        <ChevronRight size={14} />
                      </button>
                    ) : null}
                  </>
                );
              })()}
            </footer>
          </article>
        </section>
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r-2 border-blue-950/10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-blue-950/10">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-950" />
                <span className="font-bold text-blue-950">Contents</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="text-gray-500 hover:text-blue-950"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 border-b-2 border-blue-950/10">
              <div className="flex items-center border-2 border-blue-950/10 px-3 py-1.5">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-sm font-medium text-blue-950 outline-none"
                />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {filtered.map((s) => {
                const Icon = s.icon;
                const isActive = activeId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleNavClick(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium border-l-4 ${
                      isActive
                        ? "bg-blue-950/5 border-orange-500 text-blue-950 font-bold"
                        : "border-transparent text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-orange-500" : "text-gray-400"}
                    />
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

// Renders body text with headings (line ending with ":") bolded
const ManualBody = ({ body }) => {
  const lines = body.trim().split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Headings — lines ending with ":" that are short and capitalized
        if (
          trimmed.endsWith(":") &&
          trimmed.length < 60 &&
          !trimmed.startsWith("-") &&
          !/^\d+\./.test(trimmed)
        ) {
          return (
            <h3
              key={idx}
              className="text-sm font-bold text-blue-950 uppercase tracking-wider pt-3 first:pt-0"
            >
              {trimmed.slice(0, -1)}
            </h3>
          );
        }

        // Bullet lines
        if (trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <span className="text-sm text-gray-700 leading-relaxed flex-1">
                {trimmed.slice(2)}
              </span>
            </div>
          );
        }

        // Numbered lines
        if (/^\d+\./.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-sm font-bold text-blue-950 min-w-[20px]">
                {trimmed.match(/^\d+/)[0]}.
              </span>
              <span className="text-sm text-gray-700 leading-relaxed flex-1">
                {trimmed.replace(/^\d+\.\s*/, "")}
              </span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-sm text-gray-700 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

export default UserManual;
