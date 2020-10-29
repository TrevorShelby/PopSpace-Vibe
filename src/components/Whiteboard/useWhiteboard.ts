import * as React from 'react';
import Konva from 'konva';
import { nanoid } from '@reduxjs/toolkit';
import { COLORS, ERASER_COLOR, ERASER_WIDTH, STROKE_WIDTH } from './constants';
import { DrawingLine, WhiteboardState } from './types';

function getMousePosition(ev: Konva.KonvaEventObject<MouseEvent>) {
  return ev.target?.getStage()?.getPointerPosition() ?? { x: 0, y: 0 };
}

export function useWhiteboard(controlledValue?: WhiteboardState, controlledOnChange?: (val: WhiteboardState) => any) {
  // a ref to the Konva stage, which we can use to export an image.
  const stageRef = React.useRef<Konva.Stage>(null);

  const [internalState, setInternalState] = React.useState<WhiteboardState>({ lines: [] });
  const [activeLine, setActiveLine] = React.useState<DrawingLine | null>(null);
  const [activeColor, setActiveColor] = React.useState<string>(COLORS[1]);

  const finalState = controlledValue || internalState;
  const finalOnChange = controlledValue ? controlledOnChange : setInternalState;

  const handleMouseDown = React.useCallback(
    (ev: Konva.KonvaEventObject<MouseEvent>) => {
      setActiveLine((current) => {
        // we are already drawing something, ignore this
        if (current) return current;

        const { x, y } = getMousePosition(ev);

        const isEraser = activeColor === ERASER_COLOR;

        return {
          id: nanoid(),
          color: activeColor,
          isEraser,
          strokeWidth: isEraser ? ERASER_WIDTH : STROKE_WIDTH,
          path: [x, y],
        };
      });
    },
    [activeColor]
  );

  const handleMouseUp = React.useCallback(
    (ev: Konva.KonvaEventObject<MouseEvent>) => {
      if (!activeLine) return;
      const { x, y } = getMousePosition(ev);

      // add that last bit
      activeLine.path.push(x, y);

      setActiveLine(null);
      finalOnChange?.({
        ...finalState,
        lines: [...finalState.lines, activeLine],
      });
    },
    [activeLine, finalOnChange, finalState]
  );

  const handleMouseMove = React.useCallback((ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { x, y } = getMousePosition(ev);

    setActiveLine(
      (cur) =>
        cur && {
          ...cur,
          path: [...cur.path, x, y],
        }
    );
  }, []);

  const handleEraserClick = React.useCallback(() => {
    if (activeColor === ERASER_COLOR) {
      finalOnChange?.({
        lines: [],
      });
      setActiveColor(COLORS[1]);
    } else {
      setActiveColor(ERASER_COLOR);
    }
  }, [finalOnChange, activeColor]);

  const whiteboardProps = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    ref: stageRef,
    value: finalState,
    onChange: finalOnChange,
    activeLine,
  };

  const toolsProps = {
    onEraserClick: handleEraserClick,
    setActiveColor,
    activeColor,
  };

  const exportToImageURL = () => {
    if (!stageRef.current) {
      throw new Error('Tried to export whiteboard to image, but Konva was not yet mounted');
    }
    return stageRef.current.toDataURL();
  };

  return {
    whiteboardProps,
    toolsProps,
    exportToImageURL,
    activeColor,
  };
}
