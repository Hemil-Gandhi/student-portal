import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Expense } from '../../models/interfaces';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Expenses</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Track and manage your spending</p>
          </div>
          <button
            (click)="showAddModal.set(true)"
            class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lifetime</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">₹{{ totalAmount() | number:'1.0-0' }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Spent</p>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">This Month</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">₹{{ monthlyTotal() | number:'1.0-0' }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly Spending</p>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Count</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalCount() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Transactions</p>
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span class="font-medium">Filters:</span>
          </div>
          <select
            [(ngModel)]="selectedCategory"
            (change)="loadExpenses()"
            class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
          >
            <option value="">All Categories</option>
            @for (category of categories; track category) {
              <option [value]="category">{{ category | titlecase }}</option>
            }
          </select>
          <input
            type="month"
            [(ngModel)]="selectedMonth"
            (change)="loadExpenses()"
            class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      @if (stats()?.categoryStats?.length > 0) {
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (cat of stats().categoryStats.slice(0, 4); track cat._id) {
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2 mb-2">
                  <span [class]="'w-3 h-3 rounded-full ' + getCategoryDotColor(cat._id)"></span>
                  <span class="font-medium text-gray-700 dark:text-gray-300 text-sm capitalize">{{ cat._id }}</span>
                </div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">₹{{ cat.total | number:'1.0-0' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ cat.count }} transactions</p>
              </div>
            }
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
          </div>
        } @else if (expenses().length === 0) {
          <div class="text-center py-16 px-8">
            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-gray-900 dark:text-white text-lg font-medium">No expenses found</p>
            <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6">Start tracking your spending by adding an expense</p>
            <button
              (click)="showAddModal.set(true)"
              class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              Add your first expense
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expense</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                @for (expense of expenses(); track expense._id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center ' + getCategoryIconBg(expense.category)">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class]="getCategoryIconColor(expense.category)">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-gray-900 dark:text-white">{{ expense.title }}</div>
                          @if (expense.description) {
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ expense.description }}</div>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ' + getCategoryColor(expense.category)">
                        {{ expense.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-bold text-gray-900 dark:text-white text-lg">₹{{ expense.amount | number:'1.2-2' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {{ formatDate(expense.date) }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="editExpense(expense)"
                          class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          (click)="deleteExpense(expense._id!)"
                          class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ showEditModal() ? 'Edit Expense' : 'Add Expense' }}
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ showEditModal() ? 'Update expense details' : 'Record a new expense' }}</p>
            </div>
            <form (ngSubmit)="saveExpense()" class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                  placeholder="e.g., Grocery Shopping"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span class="text-gray-500 dark:text-gray-400 font-semibold">₹</span>
                    </div>
                    <input
                      type="number"
                      [(ngModel)]="formData.amount"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    [(ngModel)]="formData.category"
                    name="category"
                    required
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                  >
                    @for (category of categories; track category) {
                      <option [value]="category">{{ category | titlecase }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    [(ngModel)]="formData.date"
                    name="date"
                    required
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                  <select
                    [(ngModel)]="formData.paymentMethod"
                    name="paymentMethod"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                  >
                    <option value="">Select</option>
                    @for (method of paymentMethods; track method) {
                      <option [value]="method">{{ method | titlecase }}</option>
                    }
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="3"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all resize-none text-sm"
                  placeholder="Add details about this expense (optional)"
                ></textarea>
              </div>
              <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isRecurring"
                  name="isRecurring"
                  id="isRecurring"
                  class="w-5 h-5 text-gray-900 dark:text-white rounded-lg border-gray-300 focus:ring-gray-500 cursor-pointer"
                />
                <label for="isRecurring" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Recurring Expense</label>
              </div>
              @if (formData.isRecurring) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                  <select
                    [(ngModel)]="formData.recurringFrequency"
                    name="recurringFrequency"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none transition-all text-sm"
                  >
                    <option value="">Select frequency</option>
                    @for (freq of frequencies; track freq) {
                      <option [value]="freq">{{ freq | titlecase }}</option>
                    }
                  </select>
                </div>
              }
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 text-sm"
                >
                  {{ saving() ? 'Saving...' : 'Save Expense' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ExpensesComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  stats = signal<any>(null);
  totalAmount = signal(0);
  totalCount = signal(0);
  monthlyTotal = signal(0);
  
  selectedCategory = '';
  selectedMonth = '';
  
  categories = ['food', 'transport', 'accommodation', 'books', 'fees', 'entertainment', 'medical', 'other'];
  paymentMethods = ['cash', 'card', 'upi', 'wallet', 'other'];
  frequencies = ['daily', 'weekly', 'monthly', 'yearly'];
  
  formData: Partial<Expense> = {
    title: '',
    amount: 0,
    category: 'other',
    date: new Date(),
    paymentMethod: 'cash',
    description: '',
    isRecurring: false,
    recurringFrequency: null
  };
  
  editingId: string | null = null;

  constructor(
    private expenseService: ExpenseService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadStats();
  }

  loadExpenses(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-');
      params.year = year;
      params.month = month;
    }
    
    this.expenseService.getExpenses(params).subscribe({
      next: (response) => {
        this.expenses.set(response.expenses);
        this.totalAmount.set(response.totalAmount);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.expenseService.getExpenseStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        const currentMonth = new Date();
        const monthlyStat = stats.monthlyStats?.find((s: any) => 
          s._id.year === currentMonth.getFullYear() && 
          s._id.month === currentMonth.getMonth() + 1
        );
        this.monthlyTotal.set(monthlyStat?.total || 0);
      }
    });
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'food': 'bg-orange-100 text-orange-700 border border-orange-200',
      'transport': 'bg-blue-100 text-blue-700 border border-blue-200',
      'accommodation': 'bg-purple-100 text-purple-700 border border-purple-200',
      'books': 'bg-green-100 text-green-700 border border-green-200',
      'fees': 'bg-red-100 text-red-700 border border-red-200',
      'entertainment': 'bg-pink-100 text-pink-700 border border-pink-200',
      'medical': 'bg-teal-100 text-teal-700 border border-teal-200',
      'other': 'bg-slate-100 text-slate-700 border border-slate-200'
    };
    return colors[category] || 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  getCategoryIconBg(category: string): string {
    const colors: { [key: string]: string } = {
      'food': 'bg-orange-100',
      'transport': 'bg-blue-100',
      'accommodation': 'bg-purple-100',
      'books': 'bg-green-100',
      'fees': 'bg-red-100',
      'entertainment': 'bg-pink-100',
      'medical': 'bg-teal-100',
      'other': 'bg-slate-100'
    };
    return colors[category] || 'bg-slate-100';
  }

  getCategoryIconColor(category: string): string {
    const colors: { [key: string]: string } = {
      'food': 'text-orange-600',
      'transport': 'text-blue-600',
      'accommodation': 'text-purple-600',
      'books': 'text-green-600',
      'fees': 'text-red-600',
      'entertainment': 'text-pink-600',
      'medical': 'text-teal-600',
      'other': 'text-slate-600'
    };
    return colors[category] || 'text-slate-600';
  }

  getCategoryDotColor(category: string): string {
    const colors: { [key: string]: string } = {
      'food': 'bg-orange-500',
      'transport': 'bg-blue-500',
      'accommodation': 'bg-purple-500',
      'books': 'bg-green-500',
      'fees': 'bg-red-500',
      'entertainment': 'bg-pink-500',
      'medical': 'bg-teal-500',
      'other': 'bg-slate-500'
    };
    return colors[category] || 'bg-slate-500';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  editExpense(expense: Expense): void {
    this.editingId = expense._id || null;
    this.formData = { ...expense };
    this.showEditModal.set(true);
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.loadExpenses();
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
      title: '',
      amount: 0,
      category: 'other',
      date: new Date(),
      paymentMethod: 'cash',
      description: '',
      isRecurring: false,
      recurringFrequency: null
    };
  }

  saveExpense(): void {
    if (!this.formData.title || !this.formData.amount || !this.formData.category) {
      return;
    }

    this.saving.set(true);
    
    // Convert date string to Date object
    const expenseData = {
      ...this.formData,
      date: new Date(this.formData.date as any)
    } as Expense;
    
    if (this.showEditModal() && this.editingId) {
      this.expenseService.updateExpense(this.editingId, expenseData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadExpenses();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.expenseService.createExpense(expenseData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadExpenses();
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
