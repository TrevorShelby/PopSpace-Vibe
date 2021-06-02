import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import linkSrc from './png/link.png';
import stickySrc from './png/sticky.png';
import videoSrc from './png/youtube.png';
import whiteboardSrc from './png/whiteboard.png';
import fileUploadSrc from './png/upload.png';
import embedSrc from './png/embed.png';
import { ReactComponent as ScreenShareIcon } from './svg/screenShare.svg';
import { WidgetType } from '@roomState/types/widgets';

const icons = {
  [WidgetType.Link]: linkSrc,
  [WidgetType.StickyNote]: stickySrc,
  [WidgetType.Whiteboard]: whiteboardSrc,
  [WidgetType.YouTube]: videoSrc,
  [WidgetType.SidecarStream]: ScreenShareIcon,
  file: fileUploadSrc,
  embed: embedSrc,
};

export type AccessoryIconType = keyof typeof icons;

export type AccessoryIconProps = Omit<SvgIconProps, 'ref'> & {
  type: AccessoryIconType;
};

export function AccessoryIcon({ type, ...props }: AccessoryIconProps) {
  const Glyph = icons[type];

  if (typeof Glyph === 'string') {
    return <img alt={`${type} icon`} style={{ width: 48, height: 48 }} src={Glyph} />;
  }

  return (
    <SvgIcon {...props} viewBox="0 0 48 48">
      {Glyph && <Glyph />}
    </SvgIcon>
  );
}
