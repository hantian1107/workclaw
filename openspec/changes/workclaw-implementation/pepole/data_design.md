# 工具调用指令JSON结构设计

## 基本结构
```json
{
  "tool_call": {
    "id": "unique-call-id",
    "name": "tool-name",
    "version": "1.0",
    "timestamp": "2026-03-11T12:00:00Z",
    "params": {
      "param1": "value1",
      "param2": "value2"
    },
    "context": {
      "conversation_id": "conv-123",
      "user_id": "user-456",
      "session_id": "session-789"
    },
    "metadata": {
      "priority": "normal",
      "timeout": 30,
      "retry_count": 0
    },
    "extensions": {
      "custom_field1": "custom_value1",
      "custom_field2": "custom_value2"
    }
  }
}
```

## 结构说明

1. **tool_call**：根对象，包含所有工具调用相关信息
   - **id**：唯一调用标识符，用于跟踪和关联调用结果
   - **name**：工具名称，用于识别要调用的具体工具
   - **version**：工具版本号，支持工具的版本管理
   - **timestamp**：调用时间戳，使用ISO 8601格式
   - **params**：工具参数对象，根据具体工具的需求动态定义
   - **context**：上下文信息，包含会话相关数据
   - **metadata**：元数据，包含调用相关的配置信息
   - **extensions**：扩展字段，用于未来功能扩展

2. **可扩展性设计**
   - **参数结构**：params对象可以根据不同工具的需求灵活定义
   - **扩展字段**：extensions对象预留了自定义字段的空间
   - **版本管理**：通过version字段支持工具的版本演进
   - **上下文传递**：context对象支持传递会话相关信息
   - **元数据配置**：metadata对象支持配置调用行为

3. **错误处理结构**
```json
{
  "tool_response": {
    "id": "unique-call-id",
    "status": "error",
    "error": {
      "code": "ERROR_CODE",
      "message": "Error message",
      "details": "Detailed error information"
    },
    "timestamp": "2026-03-11T12:00:05Z"
  }
}
```

4. **成功响应结构**
```json
{
  "tool_response": {
    "id": "unique-call-id",
    "status": "success",
    "result": {
      "data": "Tool execution result",
      "metrics": {
        "execution_time": 1.23,
        "resource_used": "10MB"
      }
    },
    "timestamp": "2026-03-11T12:00:05Z"
  }
}
```

## 设计优势

1. **标准化**：采用统一的JSON结构，便于系统处理和解析
2. **可扩展性**：预留了扩展字段，支持未来功能的添加
3. **完整性**：包含了调用所需的所有必要信息
4. **错误处理**：提供了详细的错误处理机制
5. **上下文感知**：支持传递会话和用户相关信息
6. **版本管理**：通过版本字段支持工具的演进