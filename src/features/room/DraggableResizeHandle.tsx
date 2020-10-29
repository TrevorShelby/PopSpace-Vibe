import * as React from 'react';
import { animated } from '@react-spring/web';
import { makeStyles, useTheme } from '@material-ui/core';
import { ReactComponent as ResizeHandleIcon } from '../../images/glyphs/resize_handle.svg';
import { DraggableContext } from './Draggable';
import clsx from 'clsx';

export interface IDraggableResizeHandleProps {
  disabled?: boolean;
  className?: string;
}

const useResizeHandleStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.grey[50],
    width: 16,
    height: 16,
    '&:hover': {
      color: theme.palette.grey[200],
    },
  },
}));

export const DraggableResizeHandle: React.FC<IDraggableResizeHandleProps> = ({ children, disabled, className }) => {
  const classes = useResizeHandleStyles();
  const { resizeHandleProps, isResizingAnimatedValue, disableResize } = React.useContext(DraggableContext);
  const theme = useTheme();

  if (disableResize) {
    return null;
  }

  return (
    <animated.div
      {...(disabled ? {} : resizeHandleProps)}
      style={{
        cursor: disabled ? 'inherit' : 'se-resize',
        color: isResizingAnimatedValue.to((v) => (v ? theme.palette.grey[500] : undefined)) as any,
      }}
      className={clsx(classes.root, className)}
    >
      {children || <ResizeHandleIcon />}
    </animated.div>
  );
};
