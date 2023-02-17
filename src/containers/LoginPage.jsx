import { useState } from 'react';
import { Layout, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const { Content } = Layout;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);


  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/login', values);

      if (response.data.success) {
        window.location.href = '/todolist';
        message.success("Can Login");

        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        message.error('Invalid email or password');
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
          Witty Data Testing System
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username' }]}
            >
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}

export default LoginPage;
