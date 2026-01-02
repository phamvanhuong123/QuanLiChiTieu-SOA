import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';

// Import API Client của bạn
import axiosClient from '../apis/axiosClient';

// Import các components Shadcn
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

const Register = () => {
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2. Setup Form
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: ''
        },
    });

    // 3. Xử lý Submit
    const onSubmit = async (values) => {
        setApiError('');
        setIsLoading(true);

        try {
          
            await axiosClient.post('/auth/register', values);
            
           
            alert("Đăng ký thành công! Hãy đăng nhập.");
            navigate('/login');
        } catch (err) {
            setApiError(err.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Tạo Tài Khoản</CardTitle>
                    <CardDescription>
                        Nhập thông tin cá nhân để bắt đầu sử dụng hệ thống
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {/* Hiển thị lỗi API nếu có */}
                    {apiError && (
                        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                           ⚠️ {apiError}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            {/* Input Full Name */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và Tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Input Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        
                            <Button 
                                type="submit" 
                                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="font-medium text-blue-600 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;