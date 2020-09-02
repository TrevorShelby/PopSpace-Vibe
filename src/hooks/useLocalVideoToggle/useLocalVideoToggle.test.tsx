import { act, renderHook } from '@testing-library/react-hooks';
import useLocalVideoToggle from './useLocalVideoToggle';
import useVideoContext from '../useVideoContext/useVideoContext';
import { EventEmitter } from 'events';
import { LocalParticipant } from 'twilio-video';
import { useAppState } from '../../state';

import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
jest.mock('../../withHooks/useParticipantMeta/useParticipantMeta');
const mockUseParticipantMeta = useParticipantMeta as jest.Mock<any>;
mockUseParticipantMeta.mockImplementation(() => ({}));

jest.mock('../useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

// Mock the app state context because this hook can set an error in the app state.
jest.mock('../../state');
const mockUseAppState = useAppState as jest.Mock<any>;
mockUseAppState.mockImplementation(() => ({ setError: () => ({}) }));

function getMockTrack(name: string, deviceId?: string) {
  return {
    name,
    mediaStreamTrack: {
      getSettings: () => ({
        deviceId,
      }),
    },
  };
}

describe('the useLocalVideoToggle hook', () => {
  it('should return true when a localVideoTrack exists', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [getMockTrack('camera-123456')],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  it('should return false when a localVideoTrack does not exist', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [getMockTrack('microphone')],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([false, expect.any(Function)]);
  });

  describe('toggleVideoEnabled function', () => {
    it('should call removeLocalVideoTrack when a localVideoTrack exists', () => {
      const mockRemoveLocalVideoTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [getMockTrack('camera')],
        room: { localParticipant: null },
        removeLocalVideoTrack: mockRemoveLocalVideoTrack,
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockRemoveLocalVideoTrack).toHaveBeenCalled();
    });

    it('should call localParticipant.unpublishTrack when a localVideoTrack and localParticipant exists', () => {
      const mockLocalTrack = {
        ...getMockTrack('camera-123456'),
        stop: jest.fn(),
      };

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.unpublishTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
        room: { localParticipant: mockLocalParticipant },
        removeLocalVideoTrack: () => {},
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockLocalTrack);
    });

    it('should call getLocalVideoTrack when a localVideoTrack does not exist', async () => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve());
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: {},
      }));

      const { result, waitForNextUpdate } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitForNextUpdate();
      expect(mockGetLocalVideoTrack).toHaveBeenCalled();
    });

    it('should call mockLocalParticipant.publishTrack when a localVideoTrack does not exist and localParticipant does exist', async (done) => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve('mockTrack'));

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result, waitForNextUpdate } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitForNextUpdate();
      setImmediate(() => {
        expect(mockLocalParticipant.publishTrack).toHaveBeenCalledWith('mockTrack', { priority: 'low' });
        done();
      });
    });

    it('should not call mockLocalParticipant.publishTrack when isPublishing is true', async () => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve('mockTrack'));

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result, waitForNextUpdate } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      result.current[1](); // Should be ignored because isPublishing is true
      expect(mockGetLocalVideoTrack).toHaveBeenCalledTimes(1);
      await waitForNextUpdate();
    });

    it('should call onError when publishTrack throws an error', async () => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve('mockTrack'));
      const mockOnError = jest.fn();

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = jest.fn(() => Promise.reject(new Error('error')));

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
        onError: mockOnError,
      }));

      const { result, waitForNextUpdate } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      await waitForNextUpdate();
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call getLocalVideoTrack with the deviceId of the previously active track', async () => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve('mockTrack'));

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [getMockTrack('camera', 'testDeviceID')],
        room: { localParticipant: null },
        removeLocalVideoTrack: jest.fn(),
        getLocalVideoTrack: mockGetLocalVideoTrack,
      }));

      const { result, rerender, waitForNextUpdate } = renderHook(useLocalVideoToggle);

      // Remove existing track
      result.current[1]();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        room: { localParticipant: null },
        removeLocalVideoTrack: jest.fn(),
        getLocalVideoTrack: mockGetLocalVideoTrack,
      }));
      rerender();

      await act(async () => {
        // Get new video track
        result.current[1]();
        await waitForNextUpdate();
      });

      expect(mockGetLocalVideoTrack).toHaveBeenCalledWith({ deviceId: { exact: 'testDeviceID' } });
    });
  });
});
