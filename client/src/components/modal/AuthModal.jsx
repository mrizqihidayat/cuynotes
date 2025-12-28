"use client"
import React, {useState, useEffect} from 'react';
import { Modal, Tabs, Form, Input, Button, message } from "antd"
import { useAuth } from "@/store/useAuth";

export const AuthModal = ({ open, onClose }) => {
    const { login, register, loading } = useAuth();

    const [tab, setTab] = useState('login');
    const formKey  = open ? 'open' : 'closed';

    useEffect(() => {
        if(!open) setTab('login')
    }, [open]);

    async function onFinishRegister(v){
        const payload = {
            username: v.username,
            email: v.email,
            password: v.password,
        }

        const {ok, error} = await register(payload);
        if(!ok) return message.error(error || "Register Gagal");
        message.success("Register Berhasil, Silahkan Login");

        setTab('login')
    }

    async function onFinishLogin(v){
        const { ok, error } = await login({ username: v.username, password: v.password });
        if(!ok) return message.error(error || "Login Gagal");
        message.success("Login Berhasil!")

        onClose?.()
    }

  return (
    <Modal 
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={560}
        title={<span className='text-xl font-semibold'>Wellcome to CuyNotes</span>}
    >
        <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
                {
                    key: 'login',
                    label: 'Login',
                    children: (
                        <Form
                            key={`login-${formKey}`}
                            layout='vertical'
                            onFinish={onFinishLogin}
                            preserve={false}
                        >
                            <Form.Item name="username" label="Username">
                                <Input placeholder='John' autoComplete='username'/>
                            </Form.Item>
                            <Form.Item name="password" label="Password">
                                <Input.Password placeholder='*******' autoComplete='current-password'/>
                            </Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                className='bg-(--secondary-color)'
                                block
                            >
                                Login
                            </Button>
                        </Form>
                    )
                },
                {
                    key: 'register',
                    label: 'Register',
                    children: (
                        <Form
                            key={`register-${formKey}`}
                            layout='vertical'
                            onFinish={onFinishRegister}
                            preserve={false}
                        >
                            <Form.Item name="username" label="Username">
                                <Input placeholder='John' autoComplete='username'/>
                            </Form.Item>
                            <Form.Item name="email" label="Email">
                                <Input placeholder='email@example.com' autoComplete='email'/>
                            </Form.Item>
                            <Form.Item name="password" label="Password">
                                <Input.Password placeholder='min 6 Char' autoComplete='new-password'/>
                            </Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                className='bg-(--secondary-color)'
                                block
                            >
                                Register
                            </Button>
                        </Form>
                    )
                },
            ]}
        >

        </Tabs>
    </Modal>
  )
}