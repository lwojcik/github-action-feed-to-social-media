import { runAction } from '../src/action';
import { setFailed, setOutput } from '@actions/core';
import { createCache } from '../src/cache';
import { fetchLatestFeedItem } from '../src/feed';
import { isFeedItemNewer } from '../src/helpers/isFeedItemNewer';
import { postToSocialMedia } from '../src/helpers/postToSocialMedia';
import { FeedItem } from '../src/types';

jest.mock('@actions/core');
jest.mock('../src/config');
jest.mock('../src/cache');
jest.mock('../src/feed');
jest.mock('../src/logger');
jest.mock('../src/helpers/isFeedItemNewer');
jest.mock('../src/helpers/postToSocialMedia');

jest.mock('path', () => ({
  join: (name: string) => name,
}));

describe('runAction', () => {
  it('should skip when no feed item is fetched', async () => {
    const mockedSetOutput = setOutput as jest.Mock;
    (
      fetchLatestFeedItem as jest.MockedFunction<typeof fetchLatestFeedItem>
    ).mockResolvedValueOnce(undefined);

    await runAction();

    expect(mockedSetOutput).toHaveBeenCalled();
  });

  it('should post to social media and update cache when a new feed item is detected', async () => {
    const mockedSetOutput = setOutput as jest.Mock;

    const mockedCachedItem = { title: 'Cached Feed Item' } as FeedItem;
    const mockedFeedItem = { title: 'New Feed Item' } as FeedItem;

    (
      fetchLatestFeedItem as jest.MockedFunction<typeof fetchLatestFeedItem>
    ).mockResolvedValueOnce(mockedFeedItem);
    (createCache as any).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockedCachedItem),
      set: jest.fn(),
    });
    (isFeedItemNewer as any).mockReturnValueOnce(true);
    (postToSocialMedia as any).mockResolvedValueOnce('success');

    await runAction();

    expect(postToSocialMedia).toHaveBeenCalled();
    expect(mockedSetOutput).toHaveBeenCalled();

    expect(createCache).toHaveBeenCalled();
    expect(mockedSetOutput).toHaveBeenCalled();
  });

  it('should populate empty cache when no cached item exists', async () => {
    const mockedSetOutput = setOutput as jest.Mock;

    const mockedFeedItem = { title: 'New Feed Item' };

    (fetchLatestFeedItem as any).mockResolvedValueOnce(mockedFeedItem);
    (createCache as any).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
    });

    await runAction();

    expect(createCache).toHaveBeenCalled();

    expect(mockedSetOutput).toHaveBeenCalled();
  });

  it('should exit when no new feed item is detected', async () => {
    const mockedSetOutput = setOutput as jest.Mock;

    const mockedFeedItem = { title: 'New Feed Item' };

    (fetchLatestFeedItem as any).mockResolvedValueOnce(mockedFeedItem);
    (createCache as any).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockedFeedItem),
      set: jest.fn(),
    });

    await runAction();
  });

  it('should handle error and set failed status', async () => {
    const mockedSetFailed = setFailed as jest.Mock;

    const mockedError = new Error('Some error');

    (fetchLatestFeedItem as any).mockRejectedValueOnce(mockedError);

    await runAction();

    expect(mockedSetFailed).toHaveBeenCalledWith('Some error');
  });
});
