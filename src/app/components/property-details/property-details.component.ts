import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Property } from '../../models/property';
import { Comment } from '../../models/comment';
import { DemoInquiry } from '../../models/inquiry';
import { PropertyService } from '../../services/property.service';
import { FavoriteService } from '../../services/favorite.service';
import { CommentService } from '../../services/comment.service';
import { DemoInquiryService } from '../../services/inquiry.service';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.scss'
})
export class PropertyDetailsComponent implements OnInit {
  @Input() propertyId!: string;
  @Input() currentUser: User | null = null;
  @Output() back = new EventEmitter<void>();

  property: Property | null = null;
  isFavorite: boolean = false;
  comments: Comment[] = [];
  propertyComments: Map<string, Comment[]> = new Map();
  demoInquiries: DemoInquiry[] = [];
  inquiryMessage: string = '';
  inquiryPhone: string = '';
  inquiryError: string = '';
  inquirySuccess: string = '';
  newCommentContent: string = '';
  newCommentError: string = '';
  currentPhotoIndex: number = 0;
  replyingToCommentId: string | null = null;
  replyContent: string = '';
  expandedCommentReplies: Set<string> = new Set();
  sanitizedImageCache: Map<string, SafeUrl> = new Map();

  constructor(
    private propertyService: PropertyService,
    private favoriteService: FavoriteService,
    private commentService: CommentService,
    private inquiryService: DemoInquiryService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProperty();
    this.loadFavoriteStatus();
    this.loadComments();
    this.loadInquiries();
  }

  loadProperty(): void {
    this.property = this.propertyService.getPropertyById(this.propertyId) || null;
  }

  loadFavoriteStatus(): void {
    if (this.currentUser && this.propertyId) {
      this.isFavorite = this.favoriteService.isFavorite(this.propertyId, this.currentUser.id);
    }
  }

  loadComments(): void {
    this.comments = this.commentService.getPropertyComments(this.propertyId);
    this.buildCommentTree();
  }

  loadInquiries(): void {
    this.demoInquiries = this.inquiryService.getPropertyInquiries(this.propertyId);
  }

  buildCommentTree(): void {
    this.propertyComments.clear();
    // Group comments by parentCommentId
    const rootComments = this.comments.filter(c => !c.parentCommentId);
    rootComments.forEach(comment => {
      const replies = this.comments.filter(c => c.parentCommentId === comment.id);
      this.propertyComments.set(comment.id, replies);
    });
  }

  toggleFavorite(): void {
    if (!this.currentUser) {
      alert('Please login to add favorites');
      return;
    }

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.propertyId, this.currentUser.id);
    } else {
      this.favoriteService.addFavorite(this.propertyId, this.currentUser.id);
    }

    this.isFavorite = !this.isFavorite;
  }

  nextPhoto(): void {
    if (this.property && this.currentPhotoIndex < this.property.photos.length - 1) {
      this.currentPhotoIndex++;
    }
  }

  prevPhoto(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    }
  }

  goToPhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  submitDemoInquiry(): void {
    this.inquiryError = '';
    this.inquirySuccess = '';

    if (!this.currentUser) {
      this.inquiryError = 'Please login to send demo inquiry';
      return;
    }

    if (!this.inquiryPhone.trim()) {
      this.inquiryError = 'Phone number is required';
      return;
    }

    if (!this.inquiryMessage.trim()) {
      this.inquiryError = 'Message is required';
      return;
    }

    this.inquiryService.createInquiry(
      this.propertyId,
      this.currentUser.id,
      this.currentUser.name,
      this.currentUser.email,
      this.inquiryPhone,
      this.inquiryMessage
    );

    this.inquirySuccess = 'Demo inquiry sent successfully!';
    this.inquiryPhone = '';
    this.inquiryMessage = '';
    this.loadInquiries();

    setTimeout(() => {
      this.inquirySuccess = '';
    }, 3000);
  }

  submitComment(): void {
    this.newCommentError = '';

    if (!this.currentUser) {
      this.newCommentError = 'Please login to add comments';
      return;
    }

    if (!this.newCommentContent.trim()) {
      this.newCommentError = 'Comment cannot be empty';
      return;
    }

    this.commentService.addComment(
      this.propertyId,
      this.currentUser.id,
      this.currentUser.name,
      this.newCommentContent
    );

    this.newCommentContent = '';
    this.loadComments();
  }

  submitReply(parentCommentId: string): void {
    if (!this.currentUser) {
      alert('Please login to reply');
      return;
    }

    if (!this.replyContent.trim()) {
      alert('Reply cannot be empty');
      return;
    }

    this.commentService.addComment(
      this.propertyId,
      this.currentUser.id,
      this.currentUser.name,
      this.replyContent,
      parentCommentId
    );

    this.replyContent = '';
    this.replyingToCommentId = null;
    this.loadComments();
  }

  toggleReplies(commentId: string): void {
    if (this.expandedCommentReplies.has(commentId)) {
      this.expandedCommentReplies.delete(commentId);
    } else {
      this.expandedCommentReplies.add(commentId);
    }
  }

  getReplies(commentId: string): Comment[] {
    return this.propertyComments.get(commentId) || [];
  }

  deleteComment(commentId: string): void {
    if (!this.currentUser) return;

    const comment = this.comments.find(c => c.id === commentId);
    if (comment && comment.userId === this.currentUser.id) {
      this.commentService.deleteComment(commentId, this.currentUser.id);
      this.loadComments();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onBack(): void {
    this.back.emit();
  }

  getSafeImageUrl(imageUrl: string): SafeUrl {
    // Check if URL is already cached
    if (this.sanitizedImageCache.has(imageUrl)) {
      return this.sanitizedImageCache.get(imageUrl)!;
    }

    // Sanitize and cache the URL
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    this.sanitizedImageCache.set(imageUrl, safeUrl);
    return safeUrl;
  }
}
