import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createWorker, Worker } from 'tesseract.js';

interface ClassSchedule {
  id?: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar';
  professor?: string;
  color: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your weekly timetable</p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="showImportModal.set(true)"
              class="px-5 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Import Timetable
            </button>
            <button
              (click)="showAddModal.set(true)"
              class="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Class
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="grid grid-cols-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div class="p-4 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Time</div>
          @for (day of days; track day) {
            <div 
              [class]="'p-4 text-center font-semibold ' + 
                (day === currentDay() ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')"
            >
              {{ day }}
            </div>
          }
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          @for (time of timeSlots; track time) {
            <div class="grid grid-cols-8 min-h-[80px]">
              <div class="p-3 text-sm text-gray-500 dark:text-gray-400 font-medium border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-center">
                {{ time }}
              </div>
              
              @for (day of days; track day) {
                <div class="border-r border-gray-100 dark:border-gray-800 p-1 relative group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  @for (classItem of getClassesForSlot(day, time); track classItem.id) {
                    <div
                      (click)="editClass(classItem)"
                      [class]="'rounded-lg p-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ' + classItem.color"
                    >
                      <p class="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{{ classItem.subject }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">{{ classItem.room }}</p>
                      <span 
                        [class]="'inline-block mt-1 px-1.5 py-0.5 text-xs rounded-full ' + getTypeBadgeClass(classItem.type)"
                      >
                        {{ classItem.type }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </span>
            Today's Classes
          </h3>
          
          @if (todayClasses.length === 0) {
            <div class="text-center py-8 text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <p>No classes scheduled for today</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (classItem of todayClasses; track classItem.id) {
                <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div [class]="'w-2 h-12 rounded-full ' + getColorBar(classItem.color)"></div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ classItem.subject }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ classItem.room }} {{ classItem.professor ? '• ' + classItem.professor : '' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">{{ classItem.startTime }} - {{ classItem.endTime }}</p>
                    <span [class]="'inline-block mt-1 px-2 py-0.5 text-xs rounded-full ' + getTypeBadgeClass(classItem.type)">
                      {{ classItem.type }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="bg-gray-900 dark:bg-gray-800 rounded-xl shadow-lg p-6 text-white">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Weekly Overview
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/10 dark:bg-gray-700 rounded-xl p-4">
              <p class="text-3xl font-bold">{{ totalClasses }}</p>
              <p class="text-sm text-gray-300 dark:text-gray-400">Total Classes</p>
            </div>
            <div class="bg-white/10 dark:bg-gray-700 rounded-xl p-4">
              <p class="text-3xl font-bold">{{ lectureCount }}</p>
              <p class="text-sm text-gray-300 dark:text-gray-400">Lectures</p>
            </div>
            <div class="bg-white/10 dark:bg-gray-700 rounded-xl p-4">
              <p class="text-3xl font-bold">{{ labCount }}</p>
              <p class="text-sm text-gray-300 dark:text-gray-400">Labs</p>
            </div>
            <div class="bg-white/10 dark:bg-gray-700 rounded-xl p-4">
              <p class="text-3xl font-bold">{{ weeklyHours }}</p>
              <p class="text-sm text-gray-300 dark:text-gray-400">Hours/Week</p>
            </div>
          </div>
        </div>
      </div>

      @if (showImportModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Import Timetable</h2>
              <button 
                (click)="closeImportModal()"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-6">
              @if (!ocrResult() && !isProcessing()) {
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
                  (click)="fileInput.click()"
                  (dragover)="$event.preventDefault(); dragOver.set(true)"
                  (dragleave)="dragOver.set(false)"
                  (drop)="onFileDrop($event)"
                  [class]="dragOver() ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800' : ''"
                >
                  <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">Drop your timetable image here</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">or click to browse (PNG, JPG, PDF)</p>
                  <input
                    #fileInput
                    type="file"
                    accept="image/*,.pdf"
                    (change)="onFileSelected($event)"
                    class="hidden"
                  />
                </div>
              }

              @if (previewUrl()) {
                <div class="relative">
                  <img [src]="previewUrl()" class="w-full rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 object-contain" />
                  @if (!isProcessing()) {
                    <button
                      (click)="clearImage()"
                      class="absolute top-2 right-2 p-1.5 bg-gray-900/70 dark:bg-white/70 rounded-lg text-white dark:text-gray-900 hover:bg-gray-900/90 dark:hover:bg-white/90 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  }
                </div>
              }

              @if (isProcessing()) {
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Scanning timetable...</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ ocrStatus() }}</p>
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                      [style.width.%]="ocrProgress()"
                    ></div>
                  </div>
                </div>
              }

              @if (ocrResult() && detectedClasses().length > 0 && !isProcessing()) {
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      Detected {{ detectedClasses().length }} class{{ detectedClasses().length > 1 ? 'es' : '' }}
                    </h3>
                    <button
                      (click)="selectAllDetected()"
                      class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {{ allSelected ? 'Deselect All' : 'Select All' }}
                    </button>
                  </div>

                  @for (cls of detectedClasses(); track $index) {
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div class="flex items-start gap-3">
                        <input
                          type="checkbox"
                          [checked]="cls.selected"
                          (change)="cls.selected = !cls.selected"
                          class="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-500"
                        />
                        <div class="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Subject</label>
                            <input
                              type="text"
                              [(ngModel)]="cls.subject"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Day</label>
                            <select
                              [(ngModel)]="cls.day"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            >
                              @for (day of days; track day) {
                                <option [value]="day">{{ day }}</option>
                              }
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Start Time</label>
                            <input
                              type="time"
                              [(ngModel)]="cls.startTime"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">End Time</label>
                            <input
                              type="time"
                              [(ngModel)]="cls.endTime"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Room</label>
                            <input
                              type="text"
                              [(ngModel)]="cls.room"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Type</label>
                            <select
                              [(ngModel)]="cls.type"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            >
                              <option value="lecture">Lecture</option>
                              <option value="lab">Lab</option>
                              <option value="tutorial">Tutorial</option>
                              <option value="seminar">Seminar</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Professor</label>
                            <input
                              type="text"
                              [(ngModel)]="cls.professor"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Color</label>
                            <select
                              [(ngModel)]="cls.color"
                              class="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none"
                            >
                              <option value="bg-blue-100 border-blue-200">Blue</option>
                              <option value="bg-green-100 border-green-200">Green</option>
                              <option value="bg-purple-100 border-purple-200">Purple</option>
                              <option value="bg-orange-100 border-orange-200">Orange</option>
                              <option value="bg-pink-100 border-pink-200">Pink</option>
                              <option value="bg-teal-100 border-teal-200">Teal</option>
                              <option value="bg-indigo-100 border-indigo-200">Indigo</option>
                              <option value="bg-amber-100 border-amber-200">Amber</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (ocrResult() && detectedClasses().length === 0 && !isProcessing()) {
                <div class="text-center py-6">
                  <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">No classes detected</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">The OCR couldn't find class entries. Try a clearer image or add classes manually.</p>
                  <button
                    (click)="showRawText.set(!showRawText())"
                    class="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white"
                  >
                    {{ showRawText() ? 'Hide' : 'Show' }} extracted text
                  </button>
                  @if (showRawText()) {
                    <pre class="mt-3 text-xs text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ ocrResult() }}</pre>
                  }
                </div>
              }

              @if (ocrResult() && detectedClasses().length > 0 && !isProcessing()) {
                <div>
                  <button
                    (click)="showRawText.set(!showRawText())"
                    class="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white mb-2"
                  >
                    {{ showRawText() ? 'Hide' : 'Show' }} raw extracted text
                  </button>
                  @if (showRawText()) {
                    <pre class="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ ocrResult() }}</pre>
                  }
                </div>
              }
            </div>

            <div class="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                (click)="closeImportModal()"
                class="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              @if (ocrResult() && detectedClasses().length > 0 && !isProcessing()) {
                <button
                  (click)="addSelectedClasses()"
                  class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                >
                  Add {{ selectedCount }} Class{{ selectedCount > 1 ? 'es' : '' }} to Schedule
                </button>
              }
              @if (!ocrResult() && !isProcessing() && !previewUrl()) {
                <button
                  (click)="pasteFromClipboard()"
                  class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Or paste timetable text manually
                </button>
              }
              @if (!ocrResult() && !isProcessing() && previewUrl()) {
                <button
                  (click)="startOcr()"
                  class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                >
                  Scan Image
                </button>
              }
            </div>
          </div>
        </div>
      }

      @if (showPasteModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Paste Timetable Text</h2>
              <button 
                (click)="showPasteModal.set(false)"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Paste your timetable text below. The parser works best with formats like:<br/>
                <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Mon 9:00 AM - 10:00 AM Data Structures Room 301</code><br/>
                <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Monday: 10:00-11:30 | Math Lab | Prof. Smith</code>
              </p>
              <textarea
                [(ngModel)]="pastedText"
                rows="12"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none resize-none font-mono"
                placeholder="Mon 9:00 AM - 10:00 AM Data Structures Room 301
Tue 10:00 AM - 11:00 AM Operating Systems Lab Room 205
Wed 11:00 AM - 12:00 PM Computer Networks Room 401"
              ></textarea>
            </div>
            <div class="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                (click)="showPasteModal.set(false)"
                class="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="parsePastedText()"
                [disabled]="!pastedText.trim()"
                class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Parse Text
              </button>
            </div>
          </div>
        </div>
      }

      @if (showAddModal() || editingClass()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ editingClass() ? 'Edit Class' : 'Add New Class' }}
              </h2>
              <button 
                (click)="closeModal()"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form (ngSubmit)="saveClass()" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  [(ngModel)]="formData.subject"
                  name="subject"
                  required
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                  placeholder="e.g., Data Structures"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                  <select
                    [(ngModel)]="formData.day"
                    name="day"
                    required
                    class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  >
                    @for (day of days; track day) {
                      <option [value]="day">{{ day }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Type</label>
                  <select
                    [(ngModel)]="formData.type"
                    name="type"
                    required
                    class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    [(ngModel)]="formData.startTime"
                    name="startTime"
                    required
                    class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    [(ngModel)]="formData.endTime"
                    name="endTime"
                    required
                    class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room/Location</label>
                <input
                  type="text"
                  [(ngModel)]="formData.room"
                  name="room"
                  required
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  placeholder="e.g., Room 301"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professor (Optional)</label>
                <input
                  type="text"
                  [(ngModel)]="formData.professor"
                  name="professor"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div class="flex gap-2 flex-wrap">
                  @for (color of colorOptions; track color.class) {
                    <button
                      type="button"
                      (click)="formData.color = color.class"
                      [class]="'w-8 h-8 rounded-lg ' + color.class + ' ' + 
                        (formData.color === color.class ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : '')"
                    ></button>
                  }
                </div>
              </div>
              
              <div class="flex gap-3 pt-4">
                @if (editingClass()) {
                  <button
                    type="button"
                    (click)="deleteClass()"
                    class="flex-1 px-4 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors text-sm"
                  >
                    Delete
                  </button>
                }
                <button
                  type="submit"
                  class="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-sm"
                >
                  {{ editingClass() ? 'Update' : 'Add' }} Class
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ScheduleComponent implements OnInit {
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', 
               '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
  
  colorOptions = [
    { class: 'bg-blue-100 border-blue-200' },
    { class: 'bg-green-100 border-green-200' },
    { class: 'bg-purple-100 border-purple-200' },
    { class: 'bg-orange-100 border-orange-200' },
    { class: 'bg-pink-100 border-pink-200' },
    { class: 'bg-teal-100 border-teal-200' },
    { class: 'bg-indigo-100 border-indigo-200' },
    { class: 'bg-amber-100 border-amber-200' }
  ];

  classes = signal<ClassSchedule[]>([]);
  showAddModal = signal(false);
  showImportModal = signal(false);
  showPasteModal = signal(false);
  editingClass = signal<ClassSchedule | null>(null);
  currentDay = signal(this.getCurrentDay());

  isProcessing = signal(false);
  ocrProgress = signal(0);
  ocrStatus = signal('');
  ocrResult = signal('');
  previewUrl = signal('');
  dragOver = signal(false);
  showRawText = signal(false);
  pastedText = '';
  detectedClasses = signal<(ClassSchedule & { selected: boolean })[]>([]);

  formData: Partial<ClassSchedule> = {
    color: 'bg-blue-100 border-blue-200',
    type: 'lecture'
  };

  ngOnInit(): void {
    this.loadClasses();
  }

  get todayClasses() {
    return this.classes().filter(c => c.day === this.currentDay());
  }

  get totalClasses() {
    return this.classes().length;
  }

  get lectureCount() {
    return this.classes().filter(c => c.type === 'lecture').length;
  }

  get labCount() {
    return this.classes().filter(c => c.type === 'lab').length;
  }

  get weeklyHours() {
    return this.classes().reduce((total, c) => {
      const start = this.timeToMinutes(c.startTime);
      const end = this.timeToMinutes(c.endTime);
      return total + (end - start) / 60;
    }, 0).toFixed(1);
  }

  get allSelected() {
    return this.detectedClasses().length > 0 && this.detectedClasses().every(c => c.selected);
  }

  get selectedCount() {
    return this.detectedClasses().filter(c => c.selected).length;
  }

  getClassesForSlot(day: string, time: string): ClassSchedule[] {
    return this.classes().filter(c => {
      if (c.day !== day) return false;
      const slotMinutes = this.timeToMinutes(time);
      const startMinutes = this.timeToMinutes(c.startTime);
      const endMinutes = this.timeToMinutes(c.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  }

  editClass(classItem: ClassSchedule): void {
    this.editingClass.set(classItem);
    this.formData = { ...classItem };
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.editingClass.set(null);
    this.formData = {
      color: 'bg-blue-100 border-blue-200',
      type: 'lecture'
    };
  }

  saveClass(): void {
    if (!this.formData.subject || !this.formData.day || !this.formData.startTime || 
        !this.formData.endTime || !this.formData.room) {
      return;
    }

    const newClass: ClassSchedule = {
      id: this.editingClass()?.id || Date.now().toString(),
      subject: this.formData.subject || '',
      day: this.formData.day || '',
      startTime: this.formData.startTime || '',
      endTime: this.formData.endTime || '',
      room: this.formData.room || '',
      type: this.formData.type as any || 'lecture',
      professor: this.formData.professor,
      color: this.formData.color || 'bg-blue-100 border-blue-200'
    };

    if (this.editingClass()) {
      this.classes.update(list => list.map(c => c.id === newClass.id ? newClass : c));
    } else {
      this.classes.update(list => [...list, newClass]);
    }

    this.saveClasses();
    this.closeModal();
  }

  deleteClass(): void {
    if (this.editingClass()) {
      this.classes.update(list => list.filter(c => c.id !== this.editingClass()?.id));
      this.saveClasses();
      this.closeModal();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadImage(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.loadImage(event.dataTransfer.files[0]);
    }
  }

  private loadImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.previewUrl.set('');
    this.ocrResult.set('');
    this.detectedClasses.set([]);
  }

  async startOcr(): Promise<void> {
    if (!this.previewUrl()) return;

    this.isProcessing.set(true);
    this.ocrProgress.set(0);
    this.ocrStatus.set('Initializing OCR engine...');

    try {
      const worker: Worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.ocrProgress.set(Math.round(m.progress * 100));
            this.ocrStatus.set(`Reading text... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'loading language traineddata') {
            this.ocrStatus.set('Loading language data...');
          } else if (m.status === 'initializing api') {
            this.ocrStatus.set('Preparing OCR engine...');
          }
        }
      });

      const { data } = await worker.recognize(this.previewUrl());
      this.ocrResult.set(data.text);
      this.ocrStatus.set('Parsing timetable...');
      this.ocrProgress.set(100);

      const detected = this.parseTimetableText(data.text);
      this.detectedClasses.set(detected.map(c => ({ ...c, selected: true })));

      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      this.ocrStatus.set('OCR failed. Please try again.');
    }

    this.isProcessing.set(false);
  }

  parseTimetableText(text: string): ClassSchedule[] {
    const results: ClassSchedule[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const dayMap: { [key: string]: string } = {
      'monday': 'Mon', 'mon': 'Mon', 'm': 'Mon',
      'tuesday': 'Tue', 'tue': 'Tue', 'tues': 'Tue', 'tu': 'Tue',
      'wednesday': 'Wed', 'wed': 'Wed', 'w': 'Wed',
      'thursday': 'Thu', 'thu': 'Thu', 'thur': 'Thu', 'th': 'Thu',
      'friday': 'Fri', 'fri': 'Fri', 'f': 'Fri',
      'saturday': 'Sat', 'sat': 'Sat', 'sa': 'Sat',
      'sunday': 'Sun', 'sun': 'Sun', 'su': 'Sun'
    };

    const timeRegex = /(\d{1,2})[.:](\d{2})\s*(AM|PM|am|pm)?/g;
    const dayRegex = new RegExp(`\\b(${Object.keys(dayMap).join('|')})\\b`, 'gi');

    for (const line of lines) {
      const dayMatch = line.match(dayRegex);
      if (!dayMatch) continue;

      const day = dayMap[dayMatch[0].toLowerCase()] || dayMatch[0].substring(0, 3);
      if (!this.days.includes(day)) continue;

      const times: string[] = [];
      let m;
      const tr = new RegExp(timeRegex.source, 'g');
      while ((m = tr.exec(line)) !== null) {
        let hours = parseInt(m[1]);
        const mins = m[2];
        let period = m[3]?.toUpperCase() || '';

        if (!period) {
          if (hours >= 1 && hours <= 7) period = 'PM';
          else period = 'AM';
        }

        if (period === 'PM' && hours >= 1 && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        times.push(`${hours}:${mins}`);
      }

      let subject = line;
      subject = subject.replace(dayRegex, '');
      subject = subject.replace(/(\d{1,2})[.:](\d{2})\s*(AM|PM|am|pm)?/g, '');
      subject = subject.replace(/[|\/\\:,;\-–—]+/g, ' ').replace(/\s+/g, ' ').trim();

      const typeKeywords: { [key: string]: 'lecture' | 'lab' | 'tutorial' | 'seminar' } = {
        'lab': 'lab', 'practical': 'lab', 'prac': 'lab',
        'tutorial': 'tutorial', 'tut': 'tutorial', 'tut.': 'tutorial',
        'seminar': 'seminar', 'sem': 'seminar', 'guest': 'seminar', 'lecture': 'lecture'
      };

      let type: 'lecture' | 'lab' | 'tutorial' | 'seminar' = 'lecture';
      const lowerSubject = subject.toLowerCase();
      for (const [key, val] of Object.entries(typeKeywords)) {
        if (lowerSubject.includes(key)) {
          type = val;
          subject = subject.replace(new RegExp(key, 'gi'), '').trim();
          break;
        }
      }

      const roomMatch = subject.match(/(?:room|r\.?|hall|lab\s*\d*|h\d+|b\d+|g\d+|floor|fl\.?)\s*[\w\d\-]+/i);
      let room = 'TBA';
      let professor = '';
      if (roomMatch) {
        room = roomMatch[0].trim();
        subject = subject.replace(roomMatch[0], '').trim();
      }

      const profMatch = subject.match(/(?:prof\.?|dr\.?|mr\.?|mrs\.?|ms\.?)\s+[\w\s.]+/i);
      if (profMatch) {
        professor = profMatch[0].trim();
        subject = subject.replace(profMatch[0], '').trim();
      }

      subject = subject.replace(/^[\s\-–—|/,;:]+/, '').replace(/[\s\-–—|/,;:]+$/, '').trim();

      if (!subject || subject.length < 2) continue;

      if (times.length >= 2) {
        results.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          subject,
          day,
          startTime: this.normalizeTime(times[0]),
          endTime: this.normalizeTime(times[1]),
          room,
          type,
          professor,
          color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)].class
        });
      } else if (times.length === 1 && results.length > 0) {
        const last = results[results.length - 1];
        if (last.day === day) {
          results.push({
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            subject,
            day,
            startTime: last.endTime,
            endTime: this.addOneHour(last.endTime),
            room,
            type,
            professor,
            color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)].class
          });
        }
      }
    }

    return results;
  }

  private normalizeTime(time: string): string {
    const [hours, mins] = time.split(':').map(Number);
    const h = hours % 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  private addOneHour(time: string): string {
    const minutes = this.timeToMinutes(time);
    return this.normalizeTimeFromMinutes(minutes + 60);
  }

  private normalizeTimeFromMinutes(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }

  selectAllDetected(): void {
    const allSelected = this.allSelected;
    this.detectedClasses.update(list => list.map(c => ({ ...c, selected: !allSelected })));
  }

  addSelectedClasses(): void {
    const selected = this.detectedClasses().filter(c => c.selected);
    const toAdd: ClassSchedule[] = selected.map(c => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      subject: c.subject,
      day: c.day,
      startTime: c.startTime,
      endTime: c.endTime,
      room: c.room,
      type: c.type,
      professor: c.professor,
      color: c.color
    }));

    this.classes.update(list => [...list, ...toAdd]);
    this.saveClasses();
    this.closeImportModal();
  }

  pasteFromClipboard(): void {
    this.showPasteModal.set(true);
  }

  parsePastedText(): void {
    if (!this.pastedText.trim()) return;
    const detected = this.parseTimetableText(this.pastedText);
    this.detectedClasses.set(detected.map(c => ({ ...c, selected: true })));
    this.ocrResult.set(this.pastedText);
    this.showPasteModal.set(false);
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
    this.isProcessing.set(false);
    this.ocrProgress.set(0);
    this.ocrStatus.set('');
    this.ocrResult.set('');
    this.previewUrl.set('');
    this.detectedClasses.set([]);
    this.showRawText.set(false);
    this.dragOver.set(false);
    this.pastedText = '';
  }

  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'lecture': 'bg-blue-100 text-blue-700',
      'lab': 'bg-green-100 text-green-700',
      'tutorial': 'bg-purple-100 text-purple-700',
      'seminar': 'bg-orange-100 text-orange-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }

  getColorBar(color: string): string {
    const colorMap: { [key: string]: string } = {
      'bg-blue-100 border-blue-200': 'bg-blue-500',
      'bg-green-100 border-green-200': 'bg-green-500',
      'bg-purple-100 border-purple-200': 'bg-purple-500',
      'bg-orange-100 border-orange-200': 'bg-orange-500',
      'bg-pink-100 border-pink-200': 'bg-pink-500',
      'bg-teal-100 border-teal-200': 'bg-teal-500',
      'bg-indigo-100 border-indigo-200': 'bg-indigo-500',
      'bg-amber-100 border-amber-200': 'bg-amber-500'
    };
    return colorMap[color] || 'bg-gray-500';
  }

  private getCurrentDay(): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  }

  private timeToMinutes(time: string): number {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = (match[3] || '').toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    if (!period) {
      if (hours >= 1 && hours <= 7) hours += 12;
    }
    return hours * 60 + minutes;
  }

  private saveClasses(): void {
    localStorage.setItem('classSchedule', JSON.stringify(this.classes()));
  }

  private loadClasses(): void {
    const saved = localStorage.getItem('classSchedule');
    if (saved) {
      this.classes.set(JSON.parse(saved));
    }
  }
}
