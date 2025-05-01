/**
 * Ollama API Service
 * Interface for local Ollama LLM integration
 */

// Default configuration for Ollama API
const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_ctx?: number;
    max_tokens?: number;
  };
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details?: any;
}

export interface OllamaProgressResponse {
  status: string;
  completed?: number;
  total?: number;
  digest?: string;
}

export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_ctx?: number;
  max_tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: OllamaMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  private conversations: Map<string, Conversation>;

  constructor(baseUrl = DEFAULT_OLLAMA_URL, defaultModel = DEFAULT_MODEL) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.conversations = new Map();
  }

  /**
   * Generate a chat completion response from Ollama
   */
  async generateChatResponse(
    messages: OllamaMessage[],
    model = this.defaultModel,
    options = {}
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options,
        } as OllamaRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as OllamaResponse;
      return data.message.content;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw error;
    }
  }

  /**
   * Stream a chat completion response from Ollama
   */
  async *streamChatResponse(
    messages: OllamaMessage[],
    model = this.defaultModel,
    options = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      // 模型名称处理 - 确保使用正确的格式
      const cleanModelName = this.normalizeModelName(model);
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: cleanModelName,
          messages,
          stream: true,
          options,
        } as OllamaRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaResponse;
            yield data.message.content;
          } catch (error) {
            console.error('Error parsing JSON from stream:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from Ollama API:', error);
      throw error;
    }
  }

  /**
   * Normalize model name to ensure correct format
   */
  private normalizeModelName(model: string): string {
    // 如果模型名称包含:latest，保持不变
    if (model.includes(':latest')) {
      return model;
    }
    
    // 如果模型名称包含:，但不是:latest，保持不变
    if (model.includes(':')) {
      return model;
    }
    
    // 没有标签的情况下添加:latest
    return `${model}:latest`;
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  }

  /**
   * Get detailed information about all models
   */
  async getModelDetails(): Promise<OllamaModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching model details:', error);
      return [];
    }
  }

  /**
   * Pull a model from Ollama library
   */
  async pullModel(modelName: string, onProgress?: (progress: OllamaProgressResponse) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let success = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const progressData = JSON.parse(line) as OllamaProgressResponse;
            
            if (onProgress) {
              onProgress(progressData);
            }
            
            if (progressData.status === 'success') {
              success = true;
            }
          } catch (error) {
            console.error('Error parsing pull progress:', error);
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  }

  /**
   * Delete a model from Ollama
   */
  async deleteModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting model:', error);
      return false;
    }
  }

  /**
   * Test connection to Ollama
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  /**
   * Create a new conversation
   */
  createConversation(
    title = 'New Conversation',
    systemPrompt?: string,
    model = this.defaultModel
  ): string {
    const id = Date.now().toString();
    const messages: OllamaMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    const conversation: Conversation = {
      id,
      title,
      messages,
      model: this.normalizeModelName(model),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.set(id, conversation);
    return id;
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  /**
   * Add a user message to a conversation and get a response
   */
  async sendMessage(
    conversationId: string, 
    content: string,
    options: ChatOptions = {}
  ): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Add user message to conversation
    const userMessage: OllamaMessage = {
      role: 'user',
      content
    };
    conversation.messages.push(userMessage);
    
    // Get response from LLM
    const response = await this.generateChatResponse(
      conversation.messages,
      conversation.model,
      options
    );
    
    // Add assistant response to conversation
    const assistantMessage: OllamaMessage = {
      role: 'assistant',
      content: response
    };
    conversation.messages.push(assistantMessage);
    
    // Update conversation
    conversation.updatedAt = new Date();
    this.conversations.set(conversationId, conversation);
    
    return response;
  }

  /**
   * Stream a response to a user message
   */
  async *streamMessage(
    conversationId: string,
    content: string,
    options: ChatOptions = {}
  ): AsyncGenerator<string, string, unknown> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Add user message to conversation
    const userMessage: OllamaMessage = {
      role: 'user',
      content
    };
    conversation.messages.push(userMessage);
    
    // Stream response from LLM
    let fullResponse = '';
    const messageStream = this.streamChatResponse(
      conversation.messages,
      conversation.model,
      options
    );
    
    for await (const chunk of messageStream) {
      fullResponse += chunk;
      yield chunk;
    }
    
    // Add assistant response to conversation
    const assistantMessage: OllamaMessage = {
      role: 'assistant',
      content: fullResponse
    };
    conversation.messages.push(assistantMessage);
    
    // Update conversation
    conversation.updatedAt = new Date();
    this.conversations.set(conversationId, conversation);
    
    return fullResponse;
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string, keepSystemPrompt = true): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return false;
    }
    
    if (keepSystemPrompt && conversation.messages.length > 0 && 
        conversation.messages[0].role === 'system') {
      conversation.messages = [conversation.messages[0]];
    } else {
      conversation.messages = [];
    }
    
    conversation.updatedAt = new Date();
    this.conversations.set(conversationId, conversation);
    return true;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();
export default ollamaService; 