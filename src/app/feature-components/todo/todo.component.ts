import { Component } from '@angular/core';
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
  ],
  templateUrl: './todo.component.html',
})
export class TodoComponent {
  todos: Todo[] = [];

  users = ['Admin', 'Manager', 'User1', 'User2'];
  categories = ['General', 'Development', 'Design', 'Testing'];

  fieldTypes: FieldType[] = [
    'text',
    'number',
    'date',
    'textarea',
    'link',
    'image',
  ];

  filterUser: string | null = null;
  filterCategory: string | null = null;
  filterDate: Date | null = null;

  newTodo: Todo = this.emptyTodo();

  emptyTodo(): Todo {
    return {
      id: Date.now(),
      title: '',
      category: 'General',
      createdBy: 'Admin',
      assignedTo: 'User1',
      createdDate: new Date(),
      expectedDate: new Date(),
      status: 'OPEN',
      progress: 0,
      fields: [],
    };
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
    this.todos.push(structuredClone(this.newTodo));
    this.newTodo = this.emptyTodo();
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
    return status === 'OPEN'
      ? 'info'
      : status === 'IN_PROGRESS'
      ? 'warn'
      : 'success';
  }
}
