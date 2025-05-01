import { ollamaService, OllamaMessage } from './services/ollamaService';

/**
 * 测试Ollama基本连接和可用模型
 */
async function testBasicConnection() {
  console.log('===== 测试Ollama基本连接 =====');
  
  try {
    console.log('1. 测试连接到Ollama...');
    const isConnected = await ollamaService.testConnection();
    console.log(`   连接测试: ${isConnected ? '成功' : '失败'}`);
    
    if (!isConnected) {
      throw new Error('无法连接到Ollama服务');
    }
    
    console.log('2. 获取可用模型...');
    const models = await ollamaService.getAvailableModels();
    console.log(`   可用模型: ${models.join(', ')}`);
    
    return models[0]; // 返回第一个可用模型
  } catch (error) {
    console.error('基本连接测试失败:', error);
    throw error;
  }
}

/**
 * 测试简单的单次聊天
 */
async function testSingleChatCompletion(modelName: string) {
  console.log('\n===== 测试单次聊天 =====');
  
  try {
    console.log(`使用模型 ${modelName} 进行测试...`);
    
    const messages: OllamaMessage[] = [
      { role: 'system', content: '你是一个友好的AI助手，请保持简洁的回答。' },
      { role: 'user', content: '简单介绍一下自己' }
    ];
    
    console.log('发送消息:', messages[1].content);
    const response = await ollamaService.generateChatResponse(messages, modelName);
    console.log('收到回复:', response);
    
    return response;
  } catch (error) {
    console.error('单次聊天测试失败:', error);
    throw error;
  }
}

/**
 * 测试完整对话功能
 */
async function testConversationFeature(modelName: string) {
  console.log('\n===== 测试对话功能 =====');
  
  try {
    // 1. 创建新对话
    const systemPrompt = "你是一个有用的AI助手，请尽量提供简洁友好的回答。";
    console.log('1. 创建新对话...');
    const conversationId = ollamaService.createConversation("测试对话", systemPrompt, modelName);
    console.log(`   对话ID: ${conversationId}`);
    
    // 2. 发送第一条消息
    console.log('2. 发送第一条消息...');
    console.log('   用户: 你好，你能做什么?');
    const response1 = await ollamaService.sendMessage(conversationId, "你好，你能做什么?");
    console.log(`   助手: ${response1}`);
    
    // 3. 发送第二条消息（测试上下文理解）
    console.log('3. 发送上下文相关问题...');
    console.log('   用户: 给我举三个例子');
    const response2 = await ollamaService.sendMessage(conversationId, "给我举三个例子");
    console.log(`   助手: ${response2}`);
    
    // 4. 测试流式响应
    console.log('4. 测试流式响应...');
    console.log('   用户: 写一个简短的故事，50字以内');
    
    process.stdout.write('   助手: ');
    const stream = ollamaService.streamMessage(conversationId, "写一个简短的故事，50字以内");
    
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log('\n');
    
    // 5. 查看对话历史
    const conversation = ollamaService.getConversation(conversationId);
    console.log('5. 对话历史摘要:');
    console.log(`   - 消息总数: ${conversation?.messages.length}`);
    console.log(`   - 系统提示: ${conversation?.messages[0].content.substring(0, 30)}...`);
    console.log(`   - 最后更新: ${conversation?.updatedAt}`);
    
    // 6. 清除并删除对话
    console.log('6. 清除对话历史...');
    ollamaService.clearConversation(conversationId);
    console.log(`   清除后消息数: ${ollamaService.getConversation(conversationId)?.messages.length}`);
    
    console.log('7. 删除对话...');
    const deleted = ollamaService.deleteConversation(conversationId);
    console.log(`   删除状态: ${deleted ? '成功' : '失败'}`);
    
    return true;
  } catch (error) {
    console.error('对话功能测试失败:', error);
    throw error;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始Ollama服务测试...\n');
  
  try {
    // 测试基本连接
    const modelName = await testBasicConnection();
    
    if (!modelName) {
      console.error('没有可用模型，测试终止');
      return;
    }
    
    // 测试单次聊天
    await testSingleChatCompletion(modelName);
    
    // 测试对话功能
    await testConversationFeature(modelName);
    
    console.log('\n所有测试完成!');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runAllTests(); 