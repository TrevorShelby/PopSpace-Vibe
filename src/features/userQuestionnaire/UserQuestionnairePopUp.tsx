import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, makeStyles, Paper, Grow, useTheme, Typography, IconButton } from '@material-ui/core';
import { Analytics } from '@analytics/Analytics';
import { useLocalStorage } from '@hooks/useLocalStorage/useLocalStorage';
import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { CloseIcon } from '@components/icons/CloseIcon';

//@ts-ignore
import { Widget } from '@typeform/embed-react';

export interface IUserQuestionnairePopupProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      width: 432,
      maxHeight: '80vh',
    },
  },
  typeform: {
    width: 400,
    height: 400,
    color: theme.palette.brandColors.snow.regular,
  },
}));

export const UserQuestionnairePopup: React.FC<IUserQuestionnairePopupProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const roomId = useRoomStore((room: RoomStateShape) => room.id);
  const theme = useTheme();

  const [savedUserStats, setSavedUserStats] = useLocalStorage('tilde_user_stats', {
    count: 1,
    lastRoom: roomId,
    date: '',
    completed: [] as string[],
  });

  const getQuestionnaire = () => {
    // TODO: Refine this, was trying to start the process of
    // trying to build this to be expandable easily
    if (savedUserStats?.count >= 5 && !savedUserStats?.completed.includes('aug23Coworker')) {
      return {
        name: 'aug23Coworker',
        id: 'uCNjpQsy',
      };
    }
    return null;
  };

  const currentQuestionnaire = getQuestionnaire();

  const markComplete = () => {
    if (currentQuestionnaire) {
      savedUserStats.completed.push(currentQuestionnaire?.name);
      setSavedUserStats({
        ...savedUserStats,
      });
    }
  };

  return (
    <Grow in={currentQuestionnaire !== null}>
      <Box
        component={Paper}
        p={2}
        {...({ elevation: 3 } as any)}
        position="fixed"
        bottom={theme.spacing(2)}
        right={theme.spacing(2)}
        className={classes.root}
        zIndex={theme.zIndex.modal}
        display="flex"
        flexDirection="column"
      >
        <Box display="flex" justifyContent="space-between" p={2}>
          <Typography variant="h2">{t('features.userQuestionnaire.title')}</Typography>
          <IconButton
            onClick={() => {
              markComplete();
              Analytics.trackEvent(`userQuestionnairePopup_dismiss`);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Widget
          id={currentQuestionnaire?.id}
          className={classes.typeform}
          onSubmit={() => {
            markComplete();
          }}
        />
      </Box>
    </Grow>
  );
};
