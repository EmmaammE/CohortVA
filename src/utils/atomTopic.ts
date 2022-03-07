export const modelName2Topic = {
  Frqnode_model: 'Frequent',
  place_model: 'Location',
  group_model: 'Group',
  popular_model: 'Popular',
  office_model: 'Office',
  time_model: 'TimeRange',
  gender_model: 'Gender',
};

const atomTopic = [
  {
    color: '#8AA79B',
    text: 'Group',
  },
  {
    color: '#7891AA',
    text: 'Location',
  },
  {
    color: '#AD7982',
    text: 'Office',
  },
  {
    color: '#B3948D',
    text: 'Event',
  },
  {
    color: '#CA9087',
    text: 'Popular',
  },
  {
    color: '#AAB0BE',
    text: 'TimeRange',
  },
  {
    color: '#DDB997',
    text: 'Frequent',
  },
];

export const featureMap: { [k: string]: string } = atomTopic.reduce(
  (acc, cur) => ({ ...acc, [cur.text]: cur.color }),
  {}
);

export default atomTopic;
