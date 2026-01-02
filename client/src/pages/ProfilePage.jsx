import { useEffect, useState, useContext } from 'react';
import { useForm } from "react-hook-form";
import { User, Lock, Save, LogOut } from 'lucide-react';

// API & Context
import { authApi } from '../apis/axiosClient'; 
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  
  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "" // Email thường chỉ read-only
    }
  });


  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

 
  useEffect(() => {
    if (user) {
        profileForm.reset({ fullName: user.fullName, email: user.email });
    }
  }, [user]);

 
  const onUpdateProfile = async (values) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
  
      await authApi.updateProfile(user.id, { fullName: values.fullName });
      
      alert("Cập nhật thông tin thành công! Vui lòng đăng nhập lại để thấy thay đổi.");
     
      logout(); 
      navigate("/login");
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

 
  const onChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }
    
    if (!user?.id) return;
    setIsLoading(true);
    try {
    
      await authApi.changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      alert("Đổi mật khẩu thành công!");
      passwordForm.reset();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <Avatar className="h-20 w-20 border-2 border-blue-100">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} />
            <AvatarFallback>User</AvatarFallback>
         </Avatar>
         <div>
            <h1 className="text-2xl font-bold">{user?.fullName}</h1>
            <p className="text-gray-500">{user?.email}</p>
         </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ người dùng</CardTitle>
              <CardDescription>Cập nhật tên hiển thị của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-100" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nhập tên hiển thị" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MẬT KHẨU */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
              <CardDescription>Đổi mật khẩu định kỳ để bảo vệ tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu hiện tại</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder="••••••" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder="••••••" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder="••••••" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                        <Lock className="mr-2 h-4 w-4" /> Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Nút Logout to ở dưới cho mobile */}
      <div className="pt-4 border-t">
          <Button variant="destructive" className="w-full" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="mr-2 h-4 w-4"/> Đăng xuất khỏi thiết bị
          </Button>
      </div>
    </div>
  );
};

export default ProfilePage;