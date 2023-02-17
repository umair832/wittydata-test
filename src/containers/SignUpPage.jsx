import { useState } from 'react';
import { Layout, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const { Content } = Layout;

function SignupPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const regex = /^[a-zA-Z0-9~!@#$^*_=\[\]{}\|;:,.\/?-]+$/;

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/users', values);

            if (response.data.success) {
                message.success('Account created successfully!');
                window.location.href = '/login';
            } else {
                message.error(response.data.message);
                setLoading(false);
            }
        } catch (error) {
            message.error('An error occurred. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Content style={{ minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Form form={form} onFinish={onFinish}>
                        <Form.Item
                            name="username"
                            rules={[
                                () => ({
                                    validator(_, value) {
                                        if (value === '') {
                                            return Promise.reject(new Error('This field is required.'));
                                        } else if (value.length < 6) {
                                            return Promise.reject(new Error('This field must be at least 6 characters long.'));
                                        } else if (value.length > 30) {
                                            return Promise.reject(new Error('This field must be no more than 30 characters long.'));
                                        } else if (value.length !== value.trimStart().length) {
                                            return Promise.reject(new Error('This field cannot contain leading whitespaces.'));
                                        } else if (value.length !== value.trimEnd().length) {
                                            return Promise.reject(new Error('This field cannot contain trailing whitespaces.'));
                                        }
                                    },
                                })]}
                        >
                            <Input placeholder="Username" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                () => ({
                                    validator(_, value) {
                                        if (value === '') {
                                            return Promise.reject(new Error('This field is required.'));
                                        } else if (value.length < 8) {
                                            return Promise.reject(new Error('This field must be at least 8 characters long.'));
                                        } else if (value.length > 40) {
                                            return Promise.reject(new Error('This field must be no more than 40 characters long.'));
                                        } else if (!regex.test(value)){
                                            return Promise.reject(new Error('This field only accepts a-z, A-Z, 0-9, `~!@#$^*-_=[]{}|;:,./?`.'));
                                        }
                                    },
                                })]}
                        >
                            <Input.Password placeholder="Password" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        } else {
                                            return Promise.reject(new Error('The two passwords do not match'));
                                        }
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Sign up
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Content>
        </Layout>
    );
}

export default SignupPage;
