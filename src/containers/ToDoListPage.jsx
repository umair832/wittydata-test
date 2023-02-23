import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, message, Checkbox, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import axios from 'axios';

const ToDoListPage = () => {
    const [todos, setTodos] = useState([]);
    const [userList, setUserList] = useState([]);
    const [currentUser, setCurrentUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [checkedUserList, setCheckedUserList] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [indeterminate, setIndeterminate] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        getTodos();
        getUsers();

        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
    }, []);

    /**
     * Get List of users
     */
    const getUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            setUserList(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Get list of todos
     */
    const getTodos = async () => {
        try {
            const assignData = await axios.get('http://localhost:3001/api/task/');

            setTodos(assignData.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Handle search todos task
     * @param {event} e 
     */
    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    /**
     * Handle creating new todo task
     */
    const handleCreateTodo = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    /**
     * Handle editing existing todo task
     * @param {Array} record 
     */
    const handleEditTodo = (record) => {
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    /**
     * Handle deleting existing todo task
     * @param {Int} id 
     */
    const handleDeleteTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/task/${id}`);
            message.success('Todo deleted successfully');
            getTodos();
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Handle todo sharing data in modal box
     * @param {Array} record 
     */
    const handleShareTodo = (record) => {
        // TODO: Implement share functionality
        form.setFieldsValue(record);
        const userIDs = userList.map((u) => { return u.id });

        if (record.isPublic) {
            setCheckedUserList(userIDs);
        }
        else {
            setCheckedUserList([]);
        }
        setIsShareModalVisible(true);
    };

    /**
     * Handle on change for single checkbox
     * @param {Array} list 
     */
    const onChangeCheck = (list) => {
        const userIDs = userList.map((u) => { return u.id });

        setCheckedUserList(list);
        setIndeterminate(!!list.length && list.length < userIDs.length);
        setCheckAll(list.length === userIDs.length);
    }

    /**
     * Handle on change for all checkbox
     * @param {event} e 
     */
    const onCheckAll = (e) => {
        const userIDs = userList.map((u) => { return u.id });

        setCheckedUserList(e.target.checked ? userIDs : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };

    /**
     * Submit data for todo task
     */
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);
            if (values.id) {
                await axios.put(`http://localhost:3001/api/task/${values.id}`, values);
                message.success('Todo updated successfully');
            } else {
                await axios.post('http://localhost:3001/api/task', values);
                message.success('Todo created successfully');
            }
            getTodos();
            setIsModalVisible(false);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Submit data for todo sharing
     */
    const handleShareOk = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);

            if (values.id) {
                await axios.put(`http://localhost:3001/api/assignment/${values.id}`, values);
                message.success('Todo sharing updated successfully');
            } else {
                await axios.post('http://localhost:3001/api/assignment', values);
                message.success('Todo sharing created successfully');
            }
            getTodos();
            setIsModalVisible(false);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Handle cancel todo data modal box
     */
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    /**
     * Handle cancel todo sharing modal box
     */
    const handleShareCancel = () => {
        setIsShareModalVisible(false);
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            sortDirections: ['ascend', 'descend'],
            render: (text, record) => (
                <a href="#" onClick={() => handleEditTodo(record)}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Button type="link" icon={<ShareAltOutlined />} onClick={() => handleShareTodo(record)}>
                        Share
                    </Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTodo(record)}>
                        Edit
                    </Button>
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteTodo(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    const filteredTodos = todos.filter(
        (todo) =>
            todo.title.toLowerCase().includes(searchText.toLowerCase()) ||
            todo.description.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <h1>Todos</h1>
            Hi {currentUser.username}
            <Button type="primary" onClick={handleLogout}>
                Logout
            </Button>
            <div style={{ marginBottom: 16 }}>
                <Input placeholder="Search todos" value={searchText} onChange={handleSearch} />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTodo}>
                    Add Todo
                </Button>
            </div>
            <Table columns={columns} dataSource={filteredTodos} loading={loading} rowKey="id" />
            <Modal title="Create/Edit Todo" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter the title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter the description' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="Share with others" open={isShareModalVisible} onOk={handleShareOk} onCancel={handleShareCancel}>
                <Form form={form}>
                    <Form.Item name="isPublic" label="Public" valuePropName="checked">
                        <Checkbox indeterminate={indeterminate} onChange={onCheckAll} checked={checkAll} />
                    </Form.Item>
                </Form>
                <Divider />
                Users:
                <Checkbox.Group style={{ display: 'inline-block', marginRight: 0 }} onChange={onChangeCheck} value={checkedUserList} >
                    {userList.map((user, index) => (
                        <Checkbox key={index} value={user.id}>
                            {user.username}
                        </Checkbox>
                    ))}
                </Checkbox.Group>
            </Modal>
        </div>
    );
};

export default ToDoListPage;