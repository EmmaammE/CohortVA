/* eslint-disable */
import React, { useRef, useState } from 'react';

const _tags = [
  {
    name: 'a',
  },
  {
    name: 'b',
  },
  {
    name: 'c',
  },
  {
    name: 'd',
  },
];

const getPercentage = (containerWidth: number, distanceMoved: number) =>
  (distanceMoved / containerWidth) * 100;

const limitNumberWithinRange = (
  value: number,
  min: number,
  max: number
): number => Math.min(Math.max(value, min), max);

const nearestN = (N: number, number: number) => Math.ceil(number / N) * N;
interface TagSectionProps {
  name: string;
  width: number;
  noSliderButton: boolean;
  onSliderSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const TagSection = ({
  name,
  width,
  noSliderButton,
  onSliderSelect,
}: TagSectionProps) => (
  <div
    className="tag"
    style={{
      ...styles.tag,
      width: `${width}%`,
    }}
  >
    <span style={styles.tagText}>{name}</span>
    {!noSliderButton && (
      <div
        style={styles.sliderButton}
        onPointerDown={onSliderSelect}
        className="slider-button"
      />
    )}
  </div>
);

export interface ITagSlider {
  data: { id: string; weight: number; name: string }[];
  // 总权重
  sum: number;
}
const TagSlider = ({ data, sum }: ITagSlider) => {
  const [widths, setWidths] = useState<number[]>(
    data.map((d) => (d.weight / sum) * 100)
  );
  const [tags, setTags] = useState(data);
  const TagSliderRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        margin: '0 5px',
        width: '195px',
      }}
    >
      <div
        ref={TagSliderRef}
        style={{
          display: 'flex',
          border: '1px solid #ccc',
        }}
      >
        {tags.map((tag, index) => (
          <TagSection
            width={widths[index]}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            noSliderButton={index === tags.length - 1}
            name={tag.name}
            onSliderSelect={(e) => {
              e.preventDefault();
              document.body.style.cursor = 'ew-resize';

              const startDragX = e.pageX;
              const sliderWidth = TagSliderRef.current?.offsetWidth || 0;

              // eslint-disable-next-line no-shadow
              const resize = (e: MouseEvent) => {
                e.preventDefault();
                const endDragX = e.pageX;
                const distanceMoved = endDragX - startDragX;
                const maxPercent = widths[index] + widths[index + 1];

                const percentageMoved = nearestN(
                  1,
                  getPercentage(sliderWidth, distanceMoved)
                );
                // const percentageMoved = getPercentage(sliderWidth, distanceMoved);

                const _widths = widths.slice();

                const prevPercentage = _widths[index];

                const newPercentage = prevPercentage + percentageMoved;
                const currentSectionWidth = limitNumberWithinRange(
                  newPercentage,
                  0,
                  maxPercent
                );
                _widths[index] = currentSectionWidth;

                const nextSectionIndex = index + 1;

                const nextSectionNewPercentage =
                  _widths[nextSectionIndex] - percentageMoved;
                const nextSectionWidth = limitNumberWithinRange(
                  nextSectionNewPercentage,
                  0,
                  maxPercent
                );
                _widths[nextSectionIndex] = nextSectionWidth;

                if (tags.length > 2) {
                  if (_widths[index] === 0) {
                    _widths[nextSectionIndex] = maxPercent;
                    _widths.splice(index, 1);
                    setTags(tags.filter((t, i) => i !== index));
                    removeEventListener();
                  }
                  if (_widths[nextSectionIndex] === 0) {
                    _widths[index] = maxPercent;
                    _widths.splice(nextSectionIndex, 1);
                    setTags(tags.filter((t, i) => i !== nextSectionIndex));
                    removeEventListener();
                  }
                }

                setWidths(_widths);
              };

              window.addEventListener('pointermove', resize);

              const removeEventListener = () => {
                window.removeEventListener('pointermove', resize);
              };

              const handleEventUp = (e: Event) => {
                e.preventDefault();
                document.body.style.cursor = 'initial';
                removeEventListener();
              };

              window.addEventListener('pointerup', handleEventUp);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TagSlider;

type StylesType = { [key: string]: React.CSSProperties };

const styles: StylesType = {
  tag: {
    padding: 3,
    textAlign: 'center',
    position: 'relative',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: 'white',
    boxSizing: 'border-box',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'white',
    height: '5px',
  },
  tagText: {
    fontWeight: 700,
    userSelect: 'none',
    display: 'block',
    overflow: 'hidden',
    fontFamily: 'serif',
    position: 'absolute',
    left: '50%',
    top: '-15px',
    fontSize: '12px',
  },
  sliderButton: {
    width: '5px',
    height: '15px',
    backgroundColor: '#efefef',
    opacity: '0.9',
    position: 'absolute',
    border: '1px solid #ccc',
    right: 'calc(-2px)',
    top: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    margin: 'auto',
    zIndex: 1,
    cursor: 'ew-resize',
    userSelect: 'none',
  },
};

// https://css-tricks.com/lets-make-a-multi-thumb-slider-that-calculates-the-width-between-thumbs/
