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
  pids: Object;
}

export interface ICohort {
  id: string;
  index: number;
  value: any;
}

export class MySubClassedDexie extends Dexie {
  node!: Table<INode>;

  group!: Table<IGroup>;

  cohorts!: Table<ICohort, [string, number]>;

  constructor() {
    super('db');
    this.version(1).stores({
      node: 'id,label,name,en_name',
      cohorts: '[id+index],value',
      group: 'id,pids',
    });
  }
}

export const db = new MySubClassedDexie();

export const getNodeById = (id: number) => db.node.get({ id });