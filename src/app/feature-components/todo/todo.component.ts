import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG */
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

import { FieldType, TodoStatus, DynamicField, Todo } from './todo.model';
import { FireAuthService } from '../../firebase-services/fireauth.service';
import { FirestoreService } from '../../firebase-services/firestore.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    TextareaModule,
    DividerModule,
    Toast,
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
  providers: [MessageService],
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];

  // users = ['Admin', 'Manager', 'User1', 'User2'];
  categories = ['General', 'Development', 'Design', 'Testing'];

  fieldTypes: FieldType[] = [
    'text',
    'number',
    'date',
    'textarea',
    'link',
    'image',
  ];
  statusOptions: TodoStatus[] = ['OPEN', 'IN PROGRESS', 'COMPLETED'];

  filterUser: string | null = null;
  filterCategory: string | null = null;
  filterDate: Date | null = null;

  newTodo: Todo = this.emptyTodo();

  isEditMode = false;
  editingTodoId: number | null = null;

  users: any[] = [];
  lastDoc: any = null;
  pageSize = 10;

  currentUser: { uid: string; username: string } | null = null;

  constructor(
    private auth: FireAuthService,
    private firestore: FirestoreService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.auth.getCurrentUser().then((user) => {
      this.firestore.getDoc(`users/${user.uid}`).subscribe((userData: any) => {
        this.currentUser = { username: userData.username, uid: user.uid };
        this.getTodos(userData.username);
      });
    });
    this.loadUsers();
  }

  loadUsers() {
    this.firestore
      .getCollection(
        'users',
        [],
        this.pageSize,
        { key: 'createdAt', direction: 'asc' },
        false,
        this.lastDoc
      )
      .subscribe((data) => {
        if (data.length > 0) {
          this.lastDoc = data[data.length - 1];
          this.users = [...this.users, ...data.map((d: any) => d.username)];
        }
      });
  }

  getTodos(username: string) {
    this.firestore
      .getCollection('todos', [
        {
          key: 'assignedTo',
          filter: '==',
          val: username,
        },
      ])
      .subscribe((data: any[]) => {
        this.todos = data.map((todo) => ({
          ...todo,
          createdDate:
            todo.createdDate instanceof Timestamp
              ? todo.createdDate.toDate()
              : todo.createdDate,
          expectedDate:
            todo.expectedDate instanceof Timestamp
              ? todo.expectedDate.toDate()
              : todo.expectedDate,
        }));
      });
  }

  emptyTodo(): Todo {
    const obj = {
      id: Date.now(),
      title: '',
      category: 'General',
      createdBy: this.currentUser?.uid || '',
      createdByUsername: this.currentUser?.username || '',
      assignedTo: this.users?.length > 0 ? this.users[0]?.username : '',
      createdDate: new Date(),
      expectedDate: new Date(),
      status: 'OPEN' as TodoStatus,
      progress: 0,
      fields: [] as DynamicField[],
    };
    return obj;
  }

  addField(type: FieldType) {
    this.newTodo.fields.push({
      label: '',
      type,
      value: '',
    });
  }

  removeField(i: number) {
    this.newTodo.fields.splice(i, 1);
  }

  saveTodo() {
    if (this.isEditMode) {
      this.updateTodo();
    } else {
      this.createTodo();
    }
  }

  //later we have add assignedTo docid to assigned user
  createTodo() {
    this.todos.push(structuredClone(this.newTodo));
    const uid = this.currentUser?.uid; // or however you get auth user
    if (!uid || !this.currentUser?.username) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not authenticated.',
      });
      return;
    }
    this.newTodo.createdBy = uid; // ✅ MUST be UID
    this.newTodo.createdByUsername = this.currentUser?.username || '';

    console.log('New Todo to be saved:', this.newTodo);
    this.firestore
      .createDoc(`todos`, this.newTodo, { createdAtField: 'createdDate' })
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Todo Created',
          detail: 'The todo has been created successfully.',
        });
        this.newTodo = this.emptyTodo();
      })
      .catch((error) => {
        console.error('Error saving todo to Firestore:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'There was an error creating the todo.',
        });
      });
  }

  updateTodo() {
    const index = this.todos.findIndex((t) => t.id === this.editingTodoId);

    if (index !== -1) {
      this.todos[index] = structuredClone(this.newTodo);
    }

    this.resetEditState();
  }

  resetEditState() {
    this.newTodo = this.emptyTodo();
    this.isEditMode = false;
    this.editingTodoId = null;
  }

  clearFilters() {
    this.filterUser = null;
    this.filterCategory = null;
    this.filterDate = null;
  }

  filteredTodos() {
    return this.todos.filter(
      (t) =>
        (!this.filterUser || t.assignedTo === this.filterUser) &&
        (!this.filterCategory || t.category === this.filterCategory) &&
        (!this.filterDate ||
          new Date(t.expectedDate).toDateString() ===
            this.filterDate.toDateString())
    );
  }

  severity(status: TodoStatus) {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN PROGRESS':
        return 'warn';
      case 'COMPLETED':
        return 'success';
      default:
        return 'info';
    }
  }

  editTodo(todo: Todo) {
    this.isEditMode = true;
    this.editingTodoId = todo.id;

    // Keep the same ID
    this.newTodo = structuredClone(todo);
  }
}
