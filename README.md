# 实时聊天应用

一个功能齐全的实时聊天应用，支持单聊、群聊和AI助手对话。

## 功能特点

### P0 (核心功能)
- ✅ 用户注册/登录系统
- ✅ 人 ↔ 人单聊 (WebSocket实时通信)
- ✅ AI机器人对话

### P1 (重要功能)
- ✅ 群聊/聊天室
- ✅ 人 + AI群聊 (AI监听群聊消息并回应)

### P2 (扩展功能)
- ⚠️ AI自定义人格 (基础支持)
- ⚠️ 权限管理 (基础支持)

## 技术栈

- **前端**: React, TypeScript, Zustand, TailwindCSS
- **后端**: Node.js, Express, WebSocket
- **AI**: 支持本地AI模型集成

## 系统架构

### 前端架构
- **组件**: React函数组件 + Hooks
- **状态管理**: Zustand状态管理库
- **样式**: TailwindCSS实现响应式设计
- **通讯**: WebSocket双向实时通信

### 后端架构
- **服务器**: Express构建REST API
- **实时通信**: WebSocket服务
- **会话管理**: 内存存储 (可扩展到数据库)
- **AI集成**: 基于关键词的简单AI回复 (可扩展到其他模型)

## 如何运行

1. 安装依赖：
```
npm install
```

2. 启动开发服务器：
```
npm run dev
```

这将同时启动前端开发服务器和WebSocket后端。

## API文档

### 用户API

#### 用户注册
```
POST /api/register
Body: { username, email, password }
```

#### 用户登录
```
POST /api/login
Body: { email, password }
```

### WebSocket事件

#### 客户端事件
- `login`: 用户登录
- `private_message`: 发送私聊消息
- `join_room`: 加入聊天室
- `leave_room`: 离开聊天室
- `room_message`: 发送群聊消息
- `create_room`: 创建新聊天室
- `get_rooms`: 获取聊天室列表

#### 服务器事件
- `userStatus`: 用户状态更新
- `private_message`: 接收私聊消息
- `room_message`: 接收群聊消息
- `system_notification`: 系统通知
- `room_created`: 聊天室创建成功
- `rooms_list`: 聊天室列表

## 项目文件结构

```
/
├── src/                   # 前端源码
│   ├── components/        # React组件
│   ├── services/          # 服务API封装
│   ├── store/             # Zustand状态管理
│   ├── App.tsx            # 应用主组件
│   └── main.tsx           # 应用入口
├── server.js              # WebSocket后端服务
├── package.json           # 项目依赖
└── README.md              # 项目文档
```

## 未来计划

- 添加消息持久化存储
- 增强AI能力，支持更复杂的对话
- 添加文件传输功能
- 增加端到端加密
- 完善权限管理系统

## 许可证

MIT

## Contact

For questions or feedback, please reach out to [your-contact-information] 