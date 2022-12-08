// const eventMap = {
//   politics: {
//     color: '#BA6352',
//   },
//   academic: {
//     color: '#C5913E',
//   },
//   religion: {
//     color: '#215B83',
//   },
//   sociality: {
//     color: '#689A99',
//   },
//   military: {
//     color: '#D49F8F',
//   },
//   others: {
//     color: '#ccc',
//   },
//   // family: {
//   //   color: '#6C4A40',
//   // },
// };

const eventMap = {
  politics: {
    color: '#658CA2',
  },
  academic: {
    color: '#508F8A'
  },
  religion: {
    color: '#E5B79B'
  },
  sociality: {
    color: '#B79657'
  },
  military: {
    color: '#5CB5AA'
  },
  others: {
    color: '#ccc',
  },
  // family: {
  //   color: '#6C4A40',
  // },
};

export type TEventType = keyof typeof eventMap;
export default eventMap;
