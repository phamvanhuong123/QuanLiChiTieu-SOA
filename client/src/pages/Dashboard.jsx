import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { reportApi, transactionApi } from "../apis/axiosClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Settings,
  List,
  LogOut,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/context/AuthContext";

const Dashboard = () => {
  const [report, setReport] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [yearlyStats, setYearlyStats] = useState([]); // State cho biểu đồ năm
  const [isSyncing, setIsSyncing] = useState(false); // State loading cho nút Sync

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Hàm tải dữ liệu tổng hợp
  const fetchDashboardData = async () => {
    if (!user?.id) return;

    const currentYear = new Date().getFullYear();

    const results = await Promise.allSettled([
      reportApi.getDashboard(user.id),
      transactionApi.getRecent(),
      reportApi.getYearlyStats(user.id, currentYear),
    ]);

    const [reportRes, transRes, yearlyRes] = results;

    setReport(
      reportRes.status === "fulfilled"
        ? reportRes.value.data
        : { totalIncome: 0, totalExpense: 0, balance: 0 }
    );

    setRecentTransactions(
      transRes.status === "fulfilled" ? transRes.value.data : []
    );

    setYearlyStats(
      yearlyRes.status === "fulfilled" ? yearlyRes.value.data : null
    );
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    try {
      await fetchDashboardData(); // Tải lại dữ liệu sau khi sync xong
    } catch (error) {
      console.error("Sync thất bại", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  // Cấu hình biểu đồ tròn
  const pieData = [
    { name: "Thu Nhập", value: Number(report.totalIncome) },
    { name: "Chi Tiêu", value: Number(report.totalExpense) },
  ];
  const COLORS = ["#10B981", "#EF4444"];
  const hasData = report.totalIncome > 0 || report.totalExpense > 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tổng quan
            </h1>
            <p className="text-gray-500">
              Chào {user?.fullName}, ví của bạn hôm nay thế nào?
            </p>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/*  Nút Đồng bộ Dữ liệu  */}
            <Button
              variant="default"
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`mr-2 w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Đang đồng bộ..." : "Làm mới dữ liệu"}
            </Button>

            <div className="border-l pl-2 ml-2 hidden md:block h-8"></div>
            {/*Nút vào trang Profile */}
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="bg-white border-blue-200 hover:bg-blue-50 text-blue-700"
            >
              <User className="mr-2 w-4 h-4" /> Tài khoản
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/categories")}
              className="bg-white"
            >
              <List className="mr-2 w-4 h-4" /> Danh mục
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/budgets")}
              className="bg-white"
            >
              <Settings className="mr-2 w-4 h-4" /> Ngân sách
            </Button>

            <Button onClick={() => navigate("/transactions")}>
              Giao dịch <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="border-l pl-2 ml-2 hidden md:block h-8"></div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* SECTION 1: CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tổng Thu Nhập (Tháng)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Number(report.totalIncome).toLocaleString()} đ
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tổng Chi Tiêu (Tháng)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Number(report.totalExpense).toLocaleString()} đ
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Số Dư Hiện Tại
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {Number(report.balance).toLocaleString()} đ
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 2: CHARTS (Cập nhật mới) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biểu đồ Cột (Yearly Bar Chart) */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Biểu đồ Thu/Chi Năm Nay</CardTitle>
              <CardDescription>
                Theo dõi biến động tài chính qua các tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => `Thg ${value}`}
                  />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip
                    formatter={(value) => value.toLocaleString() + " đ"}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalIncome"
                    name="Thu nhập"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalExpense"
                    name="Chi tiêu"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Biểu đồ Tròn (Pie Chart) - Giữ nguyên (Chiếm 1 cột) */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Tỷ lệ tháng này</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => value.toLocaleString() + " đ"}
                    />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">Chưa có dữ liệu tháng này</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION 3: Recent List (Chuyển xuống dưới cùng, Full width) */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>
                5 giao dịch mới nhất được đồng bộ
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/transactions")}
            >
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Chưa có giao dịch nào
                </div>
              ) : (
                recentTransactions?.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Hiển thị Icon nếu có (Logic hiển thị icon sẽ cần thêm mapping, tạm thời hiển thị tên category) */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl"></div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {t.note || t.Category?.name}
                        </span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>
                            {new Date(t.date).toLocaleDateString("vi-VN")}
                          </span>
                          {t.Category && (
                            <span className="bg-gray-100 px-1 rounded">
                              {t.Category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={t.type === "INCOME" ? "default" : "secondary"}
                      className={
                        t.type === "INCOME"
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }
                    >
                      {t.type === "INCOME" ? "+" : "-"}{" "}
                      {Number(t.amount).toLocaleString()} đ
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
