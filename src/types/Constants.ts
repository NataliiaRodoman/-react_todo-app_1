/* eslint-disable no-shadow */
export enum ErrorMessage {
  NotAdded = 'Unable to add a todo',
  NotDeleted = 'Unable to delete a todo',
  NotUpdated = 'Unable to update a todo',
  Issue = 'There is an issue.',
  DownloadError = 'Failed to load todos',
}

export enum FilterBy {
  ALL = 'All',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
}
