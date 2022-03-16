type TFeature = {
  descriptorsArr: {
    type: string;
    id: string;
  }[];
};

// eslint-disable-next-line import/prefer-default-export
export const getDisplayedFeatureText = (feature: TFeature) =>
  feature?.descriptorsArr?.map((d: any) => `${d.type}(${d.text})`).join('&') ||
  '';

export const padding = 0.01;

export const fixPadding = (d: any) => (d[0] === d[1] ? 0 : padding);

export const histogramHeight = 60;
