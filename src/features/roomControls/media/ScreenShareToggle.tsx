import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { SharingOnIcon } from '../../../components/icons/SharingOnIcon';
import { SharingOffIcon } from '../../../components/icons/SharingOffIcon';
import useScreenShareToggle from '../../../hooks/useScreenShareToggle/useScreenShareToggle';

export const ScreenShareToggle = (props: { className?: string }) => {
  const [isSharingOn, toggleSharingOn] = useScreenShareToggle();

  return (
    <ToggleButton value="video" selected={isSharingOn} onChange={toggleSharingOn} {...props}>
      {isSharingOn ? <SharingOnIcon fontSize="default" /> : <SharingOffIcon fontSize="default" />}
    </ToggleButton>
  );
};
