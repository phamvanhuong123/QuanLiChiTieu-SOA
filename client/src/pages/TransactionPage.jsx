import { useEffect, useState, useContext } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns"; 
import { Plus, Pencil, Trash2, Search, Filter, X } from 'lucide-react';

// API Services
import { transactionApi, categoryApi } from '../apis/axiosClient';

// Shadcn UI Components (Bỏ Popover)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"; // Thêm Card để làm khung lọc
import { AuthContext } from '@/context/AuthContext';

// 1. SCHEMA VALIDATION
const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.coerce.number().min(1000, "Số tiền tối thiểu 1.000đ"),
  note: z.string().min(1, "Vui lòng nhập nội dung"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  date: z.string(), 
});

const TransactionPage = () => {
  const { user } = useContext(AuthContext);
  
  // State Data
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // --- THAY ĐỔI Ở ĐÂY: Dùng biến state để Bật/Tắt khung lọc ---
  const [showFilter, setShowFilter] = useState(false); 
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'ALL',
    startDate: '',
    endDate: ''
  });

  // Form Hook
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      note: "",
      categoryId: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchType = form.watch("type");

  // 2. FETCH DATA
  const fetchTransactions = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      let res;
      
      // Ưu tiên 1: Search Keyword
      if (filters.keyword) {
        res = await transactionApi.search(filters.keyword);
      } 
      // Ưu tiên 2: Filter nâng cao
      else if (filters.startDate || filters.endDate || filters.type !== 'ALL') {
        const filterParams = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            type: filters.type === 'ALL' ? undefined : filters.type
        };
        res = await transactionApi.filter(filterParams);
      } 
      // Mặc định: Lấy tất cả
      else {
        res = await transactionApi.getAll();
      }
      
      setTransactions(res.data);
    } catch (error) {
      console.error("Lỗi tải giao dịch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Categories
  useEffect(() => {
      const fetchCats = async () => {
          try {
              const res = await categoryApi.getAll();
              setCategories(res.data);
          } catch (error) {
              console.error("Lỗi tải danh mục:", error);
          }
      };
      if (user?.id) fetchCats();
  }, [user]);

  // Trigger fetch khi filters thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [user, filters]);

  // 3. HANDLERS
  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      type: "EXPENSE",
      amount: "",
      note: "",
      categoryId: "",
      date: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    form.reset({
      type: transaction.type,
      amount: transaction.amount,
      note: transaction.note,
      categoryId: transaction.categoryId.toString(),
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) return;
    try {
      await transactionApi.remove(id);
      fetchTransactions();
    } catch (error) {
      alert("Xóa thất bại: " + error.message);
    }
  };

  // Hàm reset bộ lọc
  const handleResetFilter = () => {
    setFilters({ keyword: '', type: 'ALL', startDate: '', endDate: '' });
  };

  // 4. SUBMIT FORM
  const onSubmit = async (values) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const payload = {
        ...values,
        userId: user.id,
        date: new Date(values.date), 
        categoryId: Number(values.categoryId) 
      };

      let response;
      if (editingId) {
        response = await transactionApi.update(editingId, payload);
        alert("Cập nhật thành công!");
      } else {
        response = await transactionApi.create(payload);
        if (response.data.warning) {
             alert(`⚠️ Giao dịch thành công NHƯNG: ${response.data.warning}`);
        } else {
             alert("Thêm mới thành công!");
        }
      }

      setIsDialogOpen(false);
      fetchTransactions(); 

    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id == catId);
    return cat ? cat.name : "Khác";
  };

  const formCategories = categories.filter(c => c.type === watchType);

  // 5. RENDER UI
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Giao Dịch</h1>
          <p className="text-gray-500">Xem và quản lý chi tiêu chi tiết</p>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Tìm kiếm..." 
                className="pl-8 w-[200px] bg-white" 
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>

          {/* --- NÚT BẬT/TẮT BỘ LỌC (ĐÃ SỬA: Dùng sự kiện onClick đơn giản) --- */}
          <Button 
            variant={showFilter ? "secondary" : "outline"} 
            className="bg-white border-dashed"
            onClick={() => setShowFilter(!showFilter)} // Toggle bật tắt state
          >
            <Filter className="mr-2 h-4 w-4" /> 
            Lọc
            {(filters.startDate || filters.type !== 'ALL') && (
                <Badge className="ml-2 h-2 w-2 rounded-full p-0 bg-red-500" />
            )}
          </Button>

          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm Mới
          </Button>
        </div>
      </div>

      {/* --- KHUNG BỘ LỌC (MỚI: Hiển thị khi showFilter = true) --- */}
      {showFilter && (
        <Card className="bg-gray-50 border-dashed animate-in slide-in-from-top-2 duration-200">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                    <span className="text-sm font-medium">Loại giao dịch</span>
                    <Select 
                        value={filters.type} 
                        onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            <SelectItem value="INCOME">Thu nhập</SelectItem>
                            <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <span className="text-sm font-medium">Từ ngày</span>
                    <Input 
                        type="date" 
                        className="bg-white"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-medium">Đến ngày</span>
                    <Input 
                        type="date" 
                        className="bg-white"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                </div>

                <Button 
                    variant="ghost" 
                    onClick={handleResetFilter}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <X className="mr-2 h-4 w-4" /> Xóa bộ lọc
                </Button>
            </CardContent>
        </Card>
      )}

      {/* BẢNG DỮ LIỆU */}
      <div className="border rounded-md shadow-sm bg-white mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500">Đang tải dữ liệu...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500">Chưa có giao dịch nào</TableCell></TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{format(new Date(t.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{t.note || "Không có ghi chú"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {getCategoryName(t.categoryId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.type === 'INCOME' ? "default" : "secondary"} className={t.type === 'INCOME' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {t.type === 'INCOME' ? '+' : '-'} {Number(t.amount).toLocaleString()} đ
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG FORM (Giữ nguyên) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa Giao dịch" : "Thêm Giao dịch Mới"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại GD</FormLabel>
                      <Select onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("categoryId", ""); 
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Chi Tiêu (-)</SelectItem>
                          <SelectItem value="INCOME">Thu Nhập (+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục ({watchType === 'INCOME' ? 'Thu' : 'Chi'})</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      disabled={isLoading || formCategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                             isLoading ? "Đang tải..." : 
                             formCategories.length === 0 ? "Không có danh mục phù hợp" : 
                             "Chọn danh mục"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {formCategories.map((cat) => (
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
                    <FormLabel>Số tiền (VNĐ)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Tiền nhà, Ăn sáng..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                   {editingId ? "Cập nhật" : "Lưu lại"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionPage;