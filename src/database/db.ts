/* eslint-disable camelcase */
import Dexie, { Table } from 'dexie';

export interface IData {
  id: string;
  cf2cf_pmi: {
    [key: string]: {
      [key: string]: number;
    };
  };
  descriptions: {
    [key: string]: {
      features: { text: string; type: string }[];
      proportion: number;
      sentence: string[];
      weight: number;
    };
  };
  // sentences: Object;
}

export interface INode {
  id: number;
  label: string;
  name?: string;
  en_name?: string;
}

export interface IGroup extends IData {
  id: string;
  // pids: Object;
}

export interface ICohort {
  id: string;
  index: number;
  value: {
    features: any[];
    fid2weight: { [key: string]: number };
    maxFigureWeight: number;
    people: any;
    pid2allcfvalue: {
      [key: string]: {
        [key: string]: number;
      };
    };
  };
}

export interface ISentence {
  id: string;
  words: string[];
  edges: string[];
  category: string;
}

export interface IFeature {
  id: string;
  model_descriptors: {
    type: string;
    parms: any;
  }[];
  proportion: number;
  type: string;
  weight: number;
}

export class MySubClassedDexie extends Dexie {
  node!: Table<INode>;

  group!: Table<IGroup>;

  cohorts!: Table<ICohort, [string, number]>;

  sentence!: Table<ISentence, string>;

  features!: Table<IFeature, string>;

  constructor() {
    super('db');
    this.version(1).stores({
      node: 'id,label,name,en_name',
      cohorts: '[id+index],value',
      group: 'id,cf2cf_pmi,descriptions,sentences',
      sentence: 'id,words,edges,category',
      features: 'id,model_descriptors,proportion,type,weight',
    });
  }
}

export const db = new MySubClassedDexie();

export const getNodeById = (id: number) => db.node.get({ id });
