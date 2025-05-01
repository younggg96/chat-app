import { ollamaService } from './services/ollamaService';

async function testConversation() {
  try {
    console.log('Testing Ollama conversation...');
    
    // 确保连接正常
    const isConnected = await ollamaService.testConnection();
    if (!isConnected) {
      console.error('Error: Ollama is not connected');
      return;
    }
    
    // 获取可用模型
    const models = await ollamaService.getAvailableModels();
    const modelToUse = models.includes('llama3') ? 'llama3' : models[0];
    
    if (!modelToUse) {
      console.error('Error: No models available');
      return;
    }
    
    // 创建新对话
    const systemPrompt = "You are a helpful AI assistant. Keep your answers concise and friendly.";
    const conversationId = ollamaService.createConversation(
      "Test Conversation", 
      systemPrompt, 
      modelToUse
    );
    console.log(`Created conversation with ID: ${conversationId}`);
    
    // 发送第一条消息
    console.log('\nSending first message: "Hello, what can you do?"');
    const response1 = await ollamaService.sendMessage(
      conversationId, 
      "Hello, what can you do?"
    );
    console.log(`Assistant: ${response1}`);
    
    // 发送第二条消息，应该能够保持上下文
    console.log('\nSending follow-up message: "Give me 3 examples."');
    const response2 = await ollamaService.sendMessage(
      conversationId, 
      "Give me 3 examples."
    );
    console.log(`Assistant: ${response2}`);
    
    // 获取并打印整个对话历史
    const conversation = ollamaService.getConversation(conversationId);
    console.log('\nFull conversation history:');
    console.log(JSON.stringify(conversation, null, 2));
    
    // 测试流式响应
    console.log('\nTesting streaming response...');
    console.log('Sending message: "Tell me a short story about a robot."');
    
    process.stdout.write('Assistant: ');
    let storyResponse = '';
    
    const stream = ollamaService.streamMessage(
      conversationId,
      "Tell me a short story about a robot."
    );
    
    for await (const chunk of stream) {
      process.stdout.write(chunk);
      storyResponse += chunk;
    }
    
    console.log('\n\nStreaming complete!');
    
    // 清除对话历史
    console.log('\nClearing conversation history (keeping system prompt)...');
    ollamaService.clearConversation(conversationId);
    
    // 验证历史已清除
    const clearedConversation = ollamaService.getConversation(conversationId);
    console.log('Messages after clearing:', clearedConversation?.messages.length);
    
    // 删除对话
    console.log('\nDeleting conversation...');
    const deleted = ollamaService.deleteConversation(conversationId);
    console.log(`Conversation deleted: ${deleted}`);
    
  } catch (error) {
    console.error('Error in conversation test:', error);
  }
}

testConversation(); 