export interface Message {
  _id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: string;
  isTemporary?: boolean;
  taskId?: string;
}