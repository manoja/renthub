import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private comments$ = new BehaviorSubject<Comment[]>([]);
  private nextCommentId = 1;
  private readonly storageKey = 'renthub_comments';
  private readonly idKey = 'renthub_commentId';

  constructor() {
    this.loadFromStorage();
  }

  getComments(): Observable<Comment[]> {
    return this.comments$.asObservable();
  }

  getPropertyComments(propertyId: string): Comment[] {
    return this.comments$.value.filter(c => c.propertyId === propertyId);
  }

  getCommentReplies(parentCommentId: string): Comment[] {
    return this.comments$.value.filter(c => c.parentCommentId === parentCommentId);
  }

  addComment(
    propertyId: string,
    userId: number,
    userName: string,
    content: string,
    parentCommentId?: string
  ): Comment {
    const comment: Comment = {
      id: `comment_${this.nextCommentId++}`,
      propertyId,
      userId,
      userName,
      content,
      parentCommentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.comments$.value;
    this.comments$.next([...current, comment]);
    this.saveToStorage();

    return comment;
  }

  deleteComment(id: string, userId: number): boolean {
    const comment = this.comments$.value.find(c => c.id === id);
    if (!comment || comment.userId !== userId) {
      return false; // Only author can delete
    }

    const current = this.comments$.value.filter(c => c.id !== id);
    this.comments$.next(current);
    this.saveToStorage();
    return true;
  }

  private saveToStorage(): void {
    const comments = this.comments$.value;
    localStorage.setItem(this.storageKey, JSON.stringify(comments));
    localStorage.setItem(this.idKey, this.nextCommentId.toString());
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    const storedId = localStorage.getItem(this.idKey);

    if (stored) {
      const comments = JSON.parse(stored).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      this.comments$.next(comments);
    }

    if (storedId) {
      this.nextCommentId = parseInt(storedId, 10);
    }
  }
}
