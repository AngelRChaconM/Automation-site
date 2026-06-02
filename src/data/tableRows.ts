export type TableRow = {
  id: number;
  name: string;
  email: string;
  age: number;
  country: string;
  active: boolean;
  salary: number;
};

export const TABLE_ROWS: TableRow[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', age: 28, country: 'USA', active: true, salary: 65000 },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', age: 34, country: 'Canada', active: true, salary: 72000 },
  { id: 3, name: 'Carla Diaz', email: 'carla@example.com', age: 41, country: 'Spain', active: false, salary: 58000 },
  { id: 4, name: 'David Chen', email: 'david@example.com', age: 29, country: 'China', active: true, salary: 80000 },
  { id: 5, name: 'Elena Rossi', email: 'elena@example.com', age: 36, country: 'Italy', active: true, salary: 67000 },
  { id: 6, name: 'Farid Hassan', email: 'farid@example.com', age: 45, country: 'Egypt', active: false, salary: 53000 },
  { id: 7, name: 'Grace Kim', email: 'grace@example.com', age: 27, country: 'Korea', active: true, salary: 70000 },
  { id: 8, name: 'Henry Brown', email: 'henry@example.com', age: 52, country: 'UK', active: true, salary: 92000 },
];
