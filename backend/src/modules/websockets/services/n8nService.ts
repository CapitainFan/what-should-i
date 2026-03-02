import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

interface SendToN8nParams {
  message: string;
  chatId: string;
  userId: string;
  taskId: string;
  jwt: string;
  sessionId: string;
}

export async function sendToN8n(params: SendToN8nParams): Promise<string> {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL_PROD || '';

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.jwt}`,
      'X-Task-ID': params.taskId,
    },
    body: JSON.stringify({
      message: params.message,
      chatId: params.chatId,
      userId: params.userId,
      taskId: params.taskId,
      sessionId: params.sessionId,
    })
  });

  if (!response.ok) {
    throw new Error(`N8N request failed: ${response.statusText}`);
  }

  const aiResponse: string = JSON.parse(await response.text())?.output;
  return aiResponse;
}