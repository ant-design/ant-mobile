export const base = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
  },
  Cascader: {
    placeholder: 'Selecting',
  },
  Dialog: {
    ok: 'OK',
  },
  ErrorBlock: {
    default: {
      title: 'Oops, something went wrong',
      description: 'Please wait a minute and try again',
    },
    busy: {
      title: 'Oops, not loading',
      description: 'Try to refresh the page',
    },
    disconnected: {
      title: 'Network is busy',
      description: 'Try to refresh the page',
    },
    empty: {
      title: "Hmm, couldn't find that...",
      description: 'Want to try a new search?',
    },
  },
  ImageUploader: {
    uploading: 'Uploading...',
  },
  Mask: {
    name: 'Mask',
  },
  Modal: {
    ok: 'OK',
  },
  PullToRefresh: {
    pulling: 'Scroll down to refresh',
    canRelease: 'Release to refresh immediately',
    complete: 'Refresh successful',
  },
}

export type Locale = typeof base
