import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Note } from '../../models/interfaces';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notes</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Capture your thoughts and ideas</p>
          </div>
          <button
            (click)="showAddModal.set(true)"
            class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Note
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[200px] relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" [(ngModel)]="searchQuery" (input)="loadNotes()" placeholder="Search notes..." class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" />
          </div>
          <button
            (click)="showFavoritesOnly.set(!showFavoritesOnly()); loadNotes()"
            [class]="showFavoritesOnly() ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'"
            class="px-4 py-3 rounded-lg border font-medium hover:opacity-80 transition-all flex items-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            {{ showFavoritesOnly() ? 'Show All' : 'Favorites' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
        </div>
      } @else if (notes().length === 0) {
        <div class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <p class="text-gray-900 dark:text-white text-lg font-medium">No notes found</p>
          <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6">Start capturing your ideas and thoughts</p>
          <button (click)="showAddModal.set(true)" class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Create your first note</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (note of notes(); track note._id) {
            <div class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden" [style.background-color]="note.color || undefined">
              <div class="absolute top-0 left-0 w-1 h-full" [class]="getNoteAccentColor(note.color)"></div>
              
              <button (click)="toggleFavorite(note)" class="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-all" [class.text-amber-500]="note.isFavorite" [class.text-gray-400]="!note.isFavorite">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </button>

              <div class="pr-12">
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{{ note.title }}</h3>
                @if (note.subject) {
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    {{ note.subject }}
                  </p>
                }
                @if (note.content) {
                  <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-4 mb-4">{{ note.content }}</p>
                }
                
                @if (note.tags && note.tags.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (tag of note.tags; track tag) {
                      <span class="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">{{ tag }}</span>
                    }
                  </div>
                }

                @if (note.attachments && note.attachments.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (att of note.attachments; track att.filename) {
                      <a [href]="'http://localhost:3002/uploads/' + att.filename" target="_blank"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        {{ att.originalName }}
                      </a>
                    }
                  </div>
                }

                <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {{ formatDate(note.updatedAt) }}
                  </span>
                  <div class="flex gap-1">
                    <button (click)="editNote(note)" class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button (click)="deleteNote(note._id!)" class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ showEditModal() ? 'Edit Note' : 'New Note' }}</h2>
            </div>
            <form (ngSubmit)="saveNote()" class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input type="text" [(ngModel)]="formData.title" name="title" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Note title" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input type="text" [(ngModel)]="formData.subject" name="subject" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div class="flex gap-2 flex-wrap">
                    @for (color of noteColors; track color.value) {
                      <button type="button" (click)="formData.color = color.value" [class.ring-2]="formData.color === color.value" [class.ring-offset-2]="formData.color === color.value" [class.ring-gray-400]="formData.color === color.value" class="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 transition-all shadow-sm" [style.background-color]="color.value" [title]="color.name"></button>
                    }
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea [(ngModel)]="formData.content" name="content" rows="8" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none resize-none text-sm" placeholder="Write your note here..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                <input type="text" [(ngModel)]="tagsInput" name="tags" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="e.g., important, study, exam" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
                <div class="flex items-center gap-3">
                  <label class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <span>Click to upload file</span>
                    <input type="file" (change)="onFileSelected($event)" class="hidden" />
                  </label>
                </div>
                @if (uploading()) {
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>
                }
                @if (formData.attachments && formData.attachments.length > 0) {
                  <div class="mt-2 space-y-1">
                    @for (att of formData.attachments; track att.filename) {
                      <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                        <span class="text-gray-600 dark:text-gray-400 truncate">{{ att.originalName }}</span>
                        <button type="button" (click)="removeAttachment(att.filename)" class="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
              <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input type="checkbox" [(ngModel)]="formData.isFavorite" name="isFavorite" id="isFavorite" class="w-5 h-5 text-gray-900 dark:text-white rounded-lg focus:ring-gray-500 cursor-pointer" />
                <label for="isFavorite" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Mark as favorite</label>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="closeModal()" class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Cancel</button>
                <button type="submit" [disabled]="saving()" class="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-sm">{{ saving() ? 'Saving...' : 'Save Note' }}</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class NotesComponent implements OnInit {
  notes = signal<Note[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  uploading = signal(false);
  showFavoritesOnly = signal(false);
  
  searchQuery = '';
  tagsInput = '';
  
  noteColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Red', value: '#fee2e2' },
    { name: 'Gray', value: '#f3f4f6' }
  ];
  
  formData: Partial<Note> = {
    title: '',
    content: '',
    subject: '',
    color: '#ffffff',
    isFavorite: false,
    tags: []
  };
  
  editingId: string | null = null;

  constructor(
    private noteService: NoteService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.showFavoritesOnly()) params.isFavorite = true;
    
    this.noteService.getNotes(params).subscribe({
      next: (response) => {
        this.notes.set(response.notes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getNoteAccentColor(color: string | undefined): string {
    const accents: { [key: string]: string } = {
      '#ffffff': 'bg-slate-400',
      '#fef3c7': 'bg-amber-400',
      '#d1fae5': 'bg-emerald-400',
      '#dbeafe': 'bg-blue-400',
      '#f3e8ff': 'bg-purple-400',
      '#fce7f3': 'bg-pink-400',
      '#ffedd5': 'bg-orange-400',
      '#fee2e2': 'bg-red-400',
      '#f3f4f6': 'bg-slate-400'
    };
    return accents[color || '#ffffff'] || 'bg-slate-400';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  toggleFavorite(note: Note): void {
    const updatedNote = { ...note, isFavorite: !note.isFavorite };
    this.noteService.updateNote(note._id!, updatedNote).subscribe({
      next: () => {
        this.loadNotes();
        this.dataRefreshService.triggerDashboardRefresh();
      }
    });
  }

  editNote(note: Note): void {
    this.editingId = note._id || null;
    this.formData = { ...note };
    this.tagsInput = note.tags?.join(', ') || '';
    this.showEditModal.set(true);
  }

  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.loadNotes();
          this.dataRefreshService.triggerDashboardRefresh();
        }
      });
    }
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.editingId = null;
    this.resetForm();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.editingId && !this.formData._id) return;
    const noteId = this.editingId || this.formData._id!;
    this.uploading.set(true);
    this.noteService.uploadFile(noteId, file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.formData.attachments = res.note.attachments;
        this.loadNotes();
      },
      error: () => this.uploading.set(false)
    });
  }

  removeAttachment(filename: string): void {
    const noteId = this.editingId || this.formData._id;
    if (!noteId) return;
    this.noteService.deleteFile(noteId, filename).subscribe({
      next: (res) => {
        this.formData.attachments = res.note.attachments;
        this.loadNotes();
      }
    });
  }

  resetForm(): void {
    this.formData = {
      title: '',
      content: '',
      subject: '',
      color: '#ffffff',
      isFavorite: false,
      tags: []
    };
    this.tagsInput = '';
  }

  saveNote(): void {
    if (!this.formData.title) {
      return;
    }

    this.saving.set(true);
    
    const noteData: Partial<Note> = {
      ...this.formData,
      tags: this.tagsInput.split(',').map(t => t.trim()).filter(t => t)
    };
    
    if (this.showEditModal() && this.editingId) {
      this.noteService.updateNote(this.editingId, noteData as Note).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadNotes();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.noteService.createNote(noteData as Note).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadNotes();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    }
  }
}
