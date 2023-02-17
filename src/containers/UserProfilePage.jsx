import React, { useState } from "react";
import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const UserProfilePage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const regex = /^[a-zA-Z0-9~!@#$^*_=\[\]{}\|;:,.\/?-]+$/;

    const onFinish = async (values) => {
        setLoading(true);

        const formData = new FormData();
        formData.append("avatar", values.avatar[0].originFileObj);

        try {
            const response = await axios.post("http://localhost:3001/api/upload-avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                message.success("Avatar uploaded successfully!");
            } else {
                message.error("Avatar upload failed!");
            }
        } catch (error) {
            message.error("Avatar upload failed!");
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
        const isLt1M = file.size / 1024 / 1024 < 1;

        if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG file!");
        }

        if (!isLt1M) {
            message.error("Image must be smaller than 1MB!");
        }

        return isJpgOrPng && isLt1M;
    };



    return (
        <div>
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="avatar">
                    <Upload beforeUpload={beforeUpload}>
                        <Button loading={loading} icon={<UploadOutlined />}>
                            Upload Avatar
                        </Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="username">
                    <Input disabled/>

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
                                } else if (!regex.test(value)) {
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
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserProfilePage;
