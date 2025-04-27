# 聊天应用演示

这是一个使用 React、TypeScript 和 WebSocket 构建的实时聊天应用演示。

## 功能

- 实时消息传递
- 用户在线状态显示
- 响应式设计
- 暗/亮主题切换

## 安装

1. 克隆仓库：

```bash
git clone <repository-url>
cd chat-app-demo
```

2. 安装依赖：

```bash
npm install
```

## 运行应用

### 开发模式

同时启动前端和WebSocket服务器：

```bash
npm run dev
```

这将启动：
- WebSocket服务器在端口 3001
- 前端开发服务器在端口 5173

### 分别启动

如果想分别启动服务器和前端：

```bash
# 启动WebSocket服务器
npm run server

# 在另一个终端启动前端
npm run start
```

## 使用说明

1. 打开浏览器访问 `http://localhost:5173`
2. 使用任意用户名登录
3. 选择联系人开始聊天

## 技术栈

- 前端：React、TypeScript、Tailwind CSS、Zustand
- 后端：Node.js、Express、ws（WebSocket库） 