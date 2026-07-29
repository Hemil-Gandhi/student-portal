import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacementService } from '../../services/placement.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Placement } from '../../models/interfaces';

@Component({
  selector: 'app-placements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Placements</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Track your job applications and career journey</p>
          </div>
          <button
            (click)="showAddModal.set(true)"
            class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Application
          </button>
        </div>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getStatusCount('applied') }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Applied</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getStatusCount('interviewing') }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Interviewing</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getStatusCount('offer-received') }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Offers</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getStatusCount('accepted') }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Accepted</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">₹{{ stats()?.totalCTC || 0 }}L</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total CTC</p>
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span class="font-medium">Filters:</span>
          </div>
          <select [(ngModel)]="filterStatus" (change)="loadPlacements()" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm">
            <option value="">All Status</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ formatStatus(status) }}</option>
            }
          </select>
          <select [(ngModel)]="filterJobType" (change)="loadPlacements()" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm">
            <option value="">All Job Types</option>
            @for (type of jobTypes; track type) {
              <option [value]="type">{{ type | titlecase }}</option>
            }
          </select>
          <div class="flex-1 min-w-[200px] relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" [(ngModel)]="searchCompany" (input)="loadPlacements()" placeholder="Search company..." class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" />
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
        </div>
      } @else if (placements().length === 0) {
        <div class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <p class="text-gray-900 dark:text-white text-lg font-medium">No applications found</p>
          <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6">Start tracking your job search journey</p>
          <button (click)="showAddModal.set(true)" class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Add your first application</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (placement of placements(); track placement._id) {
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden" [class]="getStatusBorderColor(placement.status)">
              <div class="p-6">
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
                        {{ getCompanyInitials(placement.companyName) }}
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ placement.companyName }}</h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm">{{ placement.role }}</p>
                      </div>
                    </div>
                  </div>
                  <span [class]="'px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide ' + getStatusBadgeColor(placement.status)">
                    {{ formatStatus(placement.status) }}
                  </span>
                </div>

                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <span class="capitalize font-medium">{{ placement.jobType | titlecase }}</span>
                  </div>
                  @if (placement.location) {
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span>{{ placement.location }}</span>
                    </div>
                  }
                  @if (placement.ctc) {
                    <div class="flex items-center gap-2 text-sm">
                      <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ placement.ctc }} LPA</span>
                    </div>
                  }
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>Applied: {{ formatDate(placement.applicationDate) }}</span>
                  </div>
                  @if (placement.interviewDate) {
                    <div class="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span>Interview: {{ formatDate(placement.interviewDate) }}</span>
                    </div>
                  }
                </div>

                @if (placement.requirements && placement.requirements.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (req of placement.requirements; track req) {
                      <span class="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">{{ req }}</span>
                    }
                  </div>
                }

                <div class="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  @if (placement.applicationLink) {
                    <a [href]="placement.applicationLink" target="_blank" rel="noopener" class="flex-1 py-2 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all flex items-center justify-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      View Posting
                    </a>
                  }
                  <button (click)="editPlacement(placement)" class="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">Edit</button>
                  <button (click)="deletePlacement(placement._id!)" class="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">Delete</button>
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
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ showEditModal() ? 'Edit Application' : 'Add Application' }}</h2>
            </div>
            <form (ngSubmit)="savePlacement()" class="p-6 space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
                  <input type="text" [(ngModel)]="formData.companyName" name="companyName" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Company name" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                  <input type="text" [(ngModel)]="formData.role" name="role" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Job role" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type *</label>
                  <select [(ngModel)]="formData.jobType" name="jobType" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm">
                    @for (type of jobTypes; track type) {
                      <option [value]="type">{{ type | titlecase }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
                  <select [(ngModel)]="formData.status" name="status" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm">
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ formatStatus(status) }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Date *</label>
                  <input type="date" [(ngModel)]="formData.applicationDate" name="applicationDate" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interview Date</label>
                  <input type="date" [(ngModel)]="formData.interviewDate" name="interviewDate" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTC (LPA)</label>
                  <input type="number" [(ngModel)]="formData.ctc" name="ctc" step="0.1" min="0" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="e.g., 12.5" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input type="text" [(ngModel)]="formData.location" name="location" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Job location" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description</label>
                <textarea [(ngModel)]="formData.jobDescription" name="jobDescription" rows="3" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none resize-none text-sm" placeholder="Job description"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements (comma separated)</label>
                <input type="text" [(ngModel)]="requirementsInput" name="requirements" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="e.g., React, Node.js, 2+ years experience" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Link</label>
                <input type="url" [(ngModel)]="formData.applicationLink" name="applicationLink" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="https://..." />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                  <input type="text" [ngModel]="formData.contactPerson?.name || ''" (ngModelChange)="formData.contactPerson = formData.contactPerson || {}; formData.contactPerson.name = $event" name="contactName" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Name" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                  <input type="email" [ngModel]="formData.contactPerson?.email || ''" (ngModelChange)="formData.contactPerson = formData.contactPerson || {}; formData.contactPerson.email = $event" name="contactEmail" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none text-sm" placeholder="Email" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea [(ngModel)]="formData.notes" name="notes" rows="2" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none resize-none text-sm" placeholder="Additional notes"></textarea>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="closeModal()" class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Cancel</button>
                <button type="submit" [disabled]="saving()" class="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-sm">{{ saving() ? 'Saving...' : 'Save' }}</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PlacementsComponent implements OnInit {
  placements = signal<Placement[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  stats = signal<any>(null);
  
  filterStatus = '';
  filterJobType = '';
  searchCompany = '';
  
  statuses = ['applied', 'interviewing', 'offer-received', 'rejected', 'accepted', 'declined'];
  jobTypes = ['internship', 'full-time', 'part-time', 'contract', 'freelance'];
  
  requirementsInput = '';
  formData: Partial<Placement> = {
    companyName: '',
    role: '',
    jobType: 'full-time',
    status: 'applied',
    applicationDate: new Date(),
    interviewDate: undefined,
    ctc: undefined,
    location: '',
    jobDescription: '',
    requirements: [],
    applicationLink: '',
    contactPerson: { name: '', email: '', phone: '' },
    notes: ''
  };
  
  editingId: string | null = null;

  constructor(
    private placementService: PlacementService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadPlacements();
    this.loadStats();
  }

  loadPlacements(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterJobType) params.jobType = this.filterJobType;
    if (this.searchCompany) params.company = this.searchCompany;
    
    this.placementService.getPlacements(params).subscribe({
      next: (response) => {
        this.placements.set(response.placements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.placementService.getPlacementStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
  }

  getStatusCount(status: string): number {
    const stat = this.stats()?.statusStats?.find((s: any) => s._id === status);
    return stat?.count || 0;
  }

  formatStatus(status: string): string {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'applied': 'bg-blue-500 text-white',
      'interviewing': 'bg-amber-500 text-white',
      'offer-received': 'bg-emerald-500 text-white',
      'rejected': 'bg-red-500 text-white',
      'accepted': 'bg-purple-500 text-white',
      'declined': 'bg-slate-500 text-white'
    };
    return colors[status] || 'bg-slate-500 text-white';
  }

  getStatusBorderColor(status: string): string {
    const colors: { [key: string]: string } = {
      'applied': 'border-blue-400',
      'interviewing': 'border-amber-400',
      'offer-received': 'border-emerald-400',
      'rejected': 'border-red-400',
      'accepted': 'border-purple-400',
      'declined': 'border-slate-400'
    };
    return colors[status] || 'border-slate-300';
  }

  getCompanyInitials(companyName: string): string {
    return companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  editPlacement(placement: Placement): void {
    this.editingId = placement._id || null;
    this.formData = { 
      ...placement,
      contactPerson: placement.contactPerson || { name: '', email: '', phone: '' }
    };
    this.requirementsInput = placement.requirements?.join(', ') || '';
    this.showEditModal.set(true);
  }

  deletePlacement(id: string): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.placementService.deletePlacement(id).subscribe({
        next: () => {
          this.loadPlacements();
          this.loadStats();
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

  resetForm(): void {
    this.formData = {
      companyName: '',
      role: '',
      jobType: 'full-time',
      status: 'applied',
      applicationDate: new Date(),
      interviewDate: undefined,
      ctc: undefined,
      location: '',
      jobDescription: '',
      requirements: [],
      applicationLink: '',
      contactPerson: { name: '', email: '', phone: '' },
      notes: ''
    };
    this.requirementsInput = '';
  }

  savePlacement(): void {
    if (!this.formData.companyName || !this.formData.role) {
      return;
    }

    this.saving.set(true);
    
    const placementData: Partial<Placement> = {
      ...this.formData,
      applicationDate: new Date(this.formData.applicationDate as any),
      interviewDate: this.formData.interviewDate ? new Date(this.formData.interviewDate as any) : undefined,
      requirements: this.requirementsInput.split(',').map(r => r.trim()).filter(r => r)
    };
    
    if (this.showEditModal() && this.editingId) {
      this.placementService.updatePlacement(this.editingId, placementData as Placement).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadPlacements();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.placementService.createPlacement(placementData as Placement).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadPlacements();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    }
  }
}
