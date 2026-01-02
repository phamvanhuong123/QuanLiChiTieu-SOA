import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';


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

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        setApiError('');
        setIsLoading(true);
        
        try {
            
            await login(values.email, values.password);
            console.log("dang nhap thanh cong")
            navigate('/'); 
        } catch (err) {
           
            setApiError(err.response?.data?.error || "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Đăng nhập</CardTitle>
                    <CardDescription>
                        Nhập email và mật khẩu để truy cập hệ thống
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {/* Hiển thị lỗi API nếu có */}
                    {apiError && (
                        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                            {apiError}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Mật khẩu</FormLabel>
                                            <Link 
                                                to="/forgot-password" 
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nút Submit */}
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Chưa có tài khoản?{" "}
                        <Link to="/register" className="font-medium text-blue-600 hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;