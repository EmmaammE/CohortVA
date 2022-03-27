export const modelName2Topic = {
  Frqnode_model: 'Entity',
  place_model: 'Location',
  group_model: 'Relationship',
  popular_model: 'Celebrity',
  office_model: 'Affiliation',
  time_model: 'TimeRange',
  gender_model: 'Gender',
};

const atomTopic = [
  {
    color: '#8AA79B',
    text: 'Relationship',
  },
  {
    color: '#7891AA',
    text: 'Location',
  },
  {
    color: '#AD7982',
    text: 'Affiliation',
  },
  {
    color: '#CA9087',
    text: 'Celebrity',
  },
  {
    color: '#AAB0BE',
    text: 'TimeRange',
  },
  {
    color: '#DDB997',
    text: 'Entity',
  },
];

const atomTopic2 = [
  {
    color: '#EDEDED',
    text: 'Group',
  },
  {
    color: '#D1D1D1',
    text: 'Location',
  },
  {
    color: '#AD7982',
    text: 'Office',
  },
  {
    color: '#A8A8A8',
    text: 'Popular',
  },
  {
    color: '#828282',
    text: 'TimeRange',
  },
  {
    color: '#626262',
    text: 'Frequent',
  },
];

export const featureMap: { [k: string]: string } = atomTopic.reduce(
  (acc, cur) => ({ ...acc, [cur.text]: cur.color }),
  {}
);

export default atomTopic;

export const mainColors = [
  '#334133',
  '#50625C',
  '#808E89',
  '#ADB5B9',
  '#E0DFE4',
];
export const mainColors2 = [
  '#6B717A',
  '#91969B',
  '#AAAFB5',
  '#C8CACC',
  '#E3E3E7',
];

export const BASE_CODE = 97;
