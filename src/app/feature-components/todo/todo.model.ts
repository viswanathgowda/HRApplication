
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'textarea'
  | 'link'
  | 'image';

export type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface DynamicField {
  label: string;
  type: FieldType;
  value: any;
}

export interface Todo {
  id: number;
  title: string;
  category: string;
  createdBy: string;
  assignedTo: string;
  createdDate: Date;
  expectedDate: Date;
  status: TodoStatus;
  progress: number;
  fields: DynamicField[];
}
