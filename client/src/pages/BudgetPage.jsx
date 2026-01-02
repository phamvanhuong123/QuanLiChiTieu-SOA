import { useEffect, useState, useContext } from 'react';
import { useForm } from "react-hook-form";
import { 
  Plus, Trash2, AlertTriangle, CheckCircle, TrendingUp 
} from 'lucide-react';


import { budgetApi, categoryApi, transactionApi } from '../apis/axiosClient'; 
import { AuthContext } from '@/context/AuthContext';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const BudgetPage = () => {
  const { user } = useContext(AuthContext);
  
  // State
  const [budgets, setBudgets] = useState([]); // List hạn mức
  const [categories, setCategories] = useState([]); // List danh mục (để chọn)
  const [transactions, setTransactions] = useState([]); // List giao dịch (để tính tiền đã tiêu)
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form
  const form = useForm({
    defaultValues: {
      categoryId: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }
  });


  const fetchData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Gọi 3 API cùng lúc: Hạn mức, Danh mục, Giao dịch tháng này
      const [budgetRes, catRes, transRes] = await Promise.all([
        budgetApi.getAll({ userId: user.id, month: currentMonth, year: currentYear }),
        categoryApi.getAll(),
        // Lấy giao dịch tháng này để tính xem đã tiêu bao nhiêu
        transactionApi.filter({ 
            userId: user.id, 
            startDate: `${currentYear}-${currentMonth}-01`, 
            endDate: `${currentYear}-${currentMonth}-31`, // Lấy dư ngày cũng ko sao
            type: 'EXPENSE' 
        })
      ]);

      setBudgets(budgetRes.data);
      setCategories(catRes.data);
      setTransactions(transRes.data);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 2. HANDLERS
  const handleAddBudget = () => {
    form.reset({
      categoryId: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa hạn mức này?")) return;
    try {
      await budgetApi.remove(id);
      fetchData(); 
    } catch (error) {
      alert("Lỗi xóa: " + error.message);
    }
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        userId: user.id,
        amount: Number(values.amount),
        categoryId: Number(values.categoryId)
      };

      await budgetApi.upsert(payload);
      alert("Đặt hạn mức thành công!");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  // 3. HELPER: TÍNH TOÁN TIẾN ĐỘ
  const calculateProgress = (categoryId, budgetAmount) => {
    // Lọc các giao dịch thuộc danh mục này
    const spent = transactions
      .filter(t => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const percent = Math.min((spent / budgetAmount) * 100, 100);
    
    // Màu sắc dựa trên %
    let color = "bg-green-500";
    if (percent >= 80) color = "bg-yellow-500";
    if (percent >= 100) color = "bg-red-500";

    return { spent, percent, color };
  };

  // Lọc chỉ lấy danh mục Chi tiêu để hiển thị trong Dropdown (Không ai đặt hạn mức cho Thu nhập cả)
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Quản lý Ngân Sách
          </h1>
          <p className="text-gray-500">Đặt giới hạn chi tiêu cho tháng này ({new Date().getMonth() + 1}/{new Date().getFullYear()})</p>
        </div>
        <Button onClick={handleAddBudget} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Đặt Hạn Mức
        </Button>
      </div>

      {/* DANH SÁCH BUDGET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
            <p className="text-gray-500">Đang tải...</p>
        ) : budgets.length === 0 ? (
            <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-gray-50 text-gray-500">
                Bạn chưa đặt hạn mức nào cho tháng này.
            </div>
        ) : (
            budgets.map((budget) => {
                const { spent, percent, color } = calculateProgress(budget.categoryId, budget.amount);
                const remaining = Number(budget.amount) - spent;
                const isOver = remaining < 0;

                return (
                    <Card key={budget.id} className="shadow-sm hover:shadow-md transition">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                                    {budget.Category?.icon || "💸"}
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">{budget.Category?.name}</CardTitle>
                                    <p className="text-xs text-gray-500">Tháng {budget.month}/{budget.year}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </Button>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Đã chi: <strong>{spent.toLocaleString()} đ</strong></span>
                                    <span className="text-gray-600">Hạn mức: <strong>{Number(budget.amount).toLocaleString()} đ</strong></span>
                                </div>
                                
                                {/* THANH PROGRESS BAR */}
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${color} transition-all duration-500`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center gap-2 text-sm pt-1">
                                    {isOver ? (
                                        <>
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-red-600 font-medium">Đã vượt quá {Math.abs(remaining).toLocaleString()} đ!</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-600">Còn lại khả dụng: {remaining.toLocaleString()} đ</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })
        )}
      </div>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Đặt Hạn Mức Mới</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn Danh Mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn danh mục --" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền giới hạn (VNĐ)</FormLabel>
                    <Input type="number" placeholder="VD: 5000000" {...field} />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Lưu lại</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetPage;