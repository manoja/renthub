export interface Comment {
  id: string;
  propertyId: string;
  userId: number;
  userName: string;
  content: string;
  parentCommentId?: string; // For replies
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentFormData {
  content: string;
  parentCommentId?: string;
}
