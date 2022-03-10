type TPos = [number, number];

const lineFunction = (points: [number[], number[]]): string => {
  const start = points[0];
  const end = points[1];

  const control1 = [start[0] + (end[0] - start[0]) / 3, start[1]];
  const control2 = [end[0] - (end[0] - start[0]) / 3, end[1]];

  const dStr = `M${start[0]} ${start[1]}C${control1[0]} ${control1[1]},${control2[0]} ${control2[1]},${end[0]} ${end[1]}`;

  return dStr;
};

const drawCurve = ([x, y]: TPos, [x2, y2]: TPos) =>
  lineFunction([
    [x, y],
    [x2, y2],
  ]);

export default drawCurve;
