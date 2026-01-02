import { useEffect, useState, useContext } from 'react';
import { useForm } from "react-hook-form";
// [UPDATED] Dùng API Service thay vì axios trực tiếp
import { categoryApi } from '../apis/axiosClient'; 
import { AuthContext } from '@/context/AuthContext';
import { Plus, Tag, Trash2, Pencil } from 'lucide-react'; // Thêm icon Pencil

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // [NEW] Thêm Tabs


const EMOJI_LIST = ["🍕", "🏠", "🚗", "🛍️", "💊", "📚", "✈️", "🎮", "💰", "🏦", "🎁", "🔧", "👶", "🐶", "💻", "🛒", "🎉"];

const CategoryPage = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const form = useForm({
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: "🍕" 
    }
  });

  const fetchCategories = async () => {
    if (!user?.id) return;
    try {
     
      const res = await categoryApi.getAll(); 
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  
  const handleAddNew = () => {
    setEditingId(null);
    form.reset({ name: "", type: "EXPENSE", icon: "🍕" });
    setIsDialogOpen(true);
  };


  const handleEdit = (cat) => {
    setEditingId(cat.id);
    form.reset({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || "🍕",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cat) => {
    const confirm = window.confirm(
      `CẢNH BÁO: Bạn sắp xóa danh mục "${cat.name}".\n\nTất cả GIAO DỊCH và HẠN MỨC thuộc danh mục này cũng sẽ bị xóa vĩnh viễn.\n\nBạn có chắc chắn muốn tiếp tục?`
    );

    if (!confirm) return;

    try {
      
      await categoryApi.remove(cat.id);
      
      alert("Đã xóa thành công!");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));

    } catch (error) {
      console.error(error);
      alert("Xóa thất bại: " + (error.response?.data?.error || error.message));
    }
  };

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, userId: user.id };

      if (editingId) {
         
         await categoryApi.update(editingId, payload);
         alert("Cập nhật thành công!");
      } else {
        
         await categoryApi.create(payload);
         alert("Tạo danh mục thành công!");
      }
      
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  // Helper render danh sách theo loại (Thu/Chi)
  const renderList = (type) => {
      const filtered = categories.filter(c => c.type === type);
      
      if (filtered.length === 0) return <p className="text-gray-500 text-center py-8 border border-dashed rounded">Chưa có danh mục nào</p>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cat) => (
            <Card key={cat.id} className="shadow-sm hover:shadow-md transition group">
                <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {/* Hiển thị Icon Emoji */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                        {cat.icon || <Tag className="h-5 w-5"/>}
                    </div>
                    <div>
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    {/* Badge hệ thống */}
                    {cat.userId === null && <Badge variant="secondary" className="text-[10px] mt-1">Mặc định</Badge>}
                    </div>
                </div>
                
                {/* Chỉ hiện nút thao tác nếu là danh mục của User (userId có giá trị) */}
                {cat.userId && (
                    <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-blue-500"
                            onClick={() => handleEdit(cat)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(cat)} 
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                </CardContent>
            </Card>
            ))}
        </div>
      );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Danh Mục</h1>
          <p className="text-gray-500">Tùy chỉnh các hạng mục thu chi của bạn</p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tạo Danh Mục
        </Button>
      </div>

      {/* TABS: Chia rõ Thu và Chi */}
      <Tabs defaultValue="EXPENSE" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="EXPENSE">Khoản Chi (Expense)</TabsTrigger>
          <TabsTrigger value="INCOME">Khoản Thu (Income)</TabsTrigger>
        </TabsList>
        <TabsContent value="EXPENSE">
            {renderList("EXPENSE")}
        </TabsContent>
        <TabsContent value="INCOME">
            {renderList("INCOME")}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Vui lòng nhập tên" }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Đám cưới, Du lịch..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Loại</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EXPENSE">Chi Tiêu</SelectItem>
                            <SelectItem value="INCOME">Thu Nhập</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
              </div>

              {/* Chọn Icon Emoji */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biểu tượng</FormLabel>
                    <div className="grid grid-cols-6 gap-2 border p-3 rounded-md max-h-[150px] overflow-y-auto">
                        {EMOJI_LIST.map((emoji) => (
                            <div 
                                key={emoji}
                                onClick={() => form.setValue("icon", emoji)}
                                className={`text-xl cursor-pointer hover:bg-gray-100 rounded p-2 text-center transition-all
                                    ${field.value === emoji ? "bg-blue-100 ring-2 ring-blue-500 scale-110" : ""}`}
                            >
                                {emoji}
                            </div>
                        ))}
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingId ? "Cập nhật" : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryPage;