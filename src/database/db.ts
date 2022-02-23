/* eslint-disable camelcase */
import Dexie, { Table } from 'dexie';

export interface INode {
  id: number;
  label: string;
  name?: string;
  en_name?: string;
}

export interface IGroup {
  id: string;
  pids: string[];
}

export class MySubClassedDexie extends Dexie {
  node!: Table<INode>;

  group!: Table<IGroup>;

  atomFeature!: Table<{ id: string; value: any }>;

  constructor() {
    super('db');
    this.version(1).stores({
      node: 'id,label,name,en_name',
      group: 'id,pids',
      atomFeature: 'id,value',
    });
  }
}

export const db = new MySubClassedDexie();
