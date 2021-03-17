import { Box, makeStyles, Modal } from '@material-ui/core';
import * as React from 'react';
import { FullscreenLoading } from '../../../components/FullscreenLoading/FullscreenLoading';
import { MediaReadinessContext } from '../../../components/MediaReadinessProvider/MediaReadinessProvider';
import { PrepareStep } from './PrepareStep';
import { RequestPermissionsStep } from './RequestPermissionsStep';
import permissionsBg from '../../../images/illustrations/browser_permission.gif';
import permissionsMobileBg from '../../../images/illustrations/browser_permission_responsive.jpg';
import textureEdge from '../../../images/illustrations/textured_side_transparent.png';

export interface IEntryOverlayProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'grid',
    gridTemplateAreas: '"content image"',
    gridTemplateColumns: 'minmax(auto, 500px) 1fr',
    overflow: 'hidden',
    minHeight: '100%',
    zIndex: theme.zIndex.modal - 1,
    // at smaller sizes we stack the two sections vertically and scroll
    // the entire stack together
    [theme.breakpoints.down('md')]: {
      gridTemplateAreas: '"image" "content"',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '260px 1fr',
      overflow: 'auto',
    },
  },
  content: {
    gridArea: 'content',
    overflow: 'auto',
    [theme.breakpoints.down('md')]: {
      overflow: 'hidden',
    },
  },
  graphic: {
    gridArea: 'image',
  },
  glass: {
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(4px)',
    // unfortunately MUI Modal uses style to control color
    backgroundColor: 'transparent !important',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    backgroundImage: `url(${permissionsBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 'auto',
      width: 16,
      zIndex: 1,
      backgroundImage: `url(${textureEdge})`,
      backgroundRepeat: 'repeat-y',
      backgroundSize: 'contain',
    },

    [theme.breakpoints.down('md')]: {
      backgroundImage: `url(${permissionsMobileBg})`,

      '&::before': {
        display: 'none',
      },
    },
  },
}));

function useHasGrantedPermission() {
  const [isGranted, setIsGranted] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      // get the list of devices that have been given permission,
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
      // docs state that a device that is active or has permissions will have a label set,
      // so we are going off of that assumption
      const hasActiveDevices = devices.some(
        (val) =>
          val.deviceId !== 'default' &&
          ((val.kind === 'audioinput' && val.label !== '') || (val.kind === 'videoinput' && val.label !== ''))
      );
      setIsGranted(hasActiveDevices);
    });
  }, []);

  return [isGranted, setIsGranted] as const;
}

export const EntryOverlay: React.FC<IEntryOverlayProps> = () => {
  const classes = useStyles();
  const { isReady, onReady } = React.useContext(MediaReadinessContext);
  const [hasGrantedPermission, setHasGrantedPermission] = useHasGrantedPermission();

  if (isReady) {
    return null;
  }

  return (
    <Modal open BackdropProps={{ className: classes.glass }}>
      <Box className={classes.root}>
        <Box className={classes.content} p={6} bgcolor="white">
          {hasGrantedPermission === undefined ? (
            <FullscreenLoading />
          ) : !hasGrantedPermission ? (
            <RequestPermissionsStep onComplete={() => setHasGrantedPermission(true)} />
          ) : (
            <PrepareStep onComplete={onReady} />
          )}
        </Box>
        <Box className={classes.graphic}>{!hasGrantedPermission && <div className={classes.image} />}</Box>
      </Box>
    </Modal>
  );
};
