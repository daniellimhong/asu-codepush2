export const setSDRLoginStatus = (store, value) => {
  store.setState({ SDRLoginStatus: value });
};

export const setCampusWeekSchedule = (store, value) => {
  store.setState({ campusWeekSchedule: value });
};

export const setShowCampusModal = (store, value) => {
  store.setState({ showCampusModal: value });
};

export const setPreviousScreenAndSection = (store, value) => {
  store.setState({ preferenceValues: value });
};

export const setRefetchWeeklySchedule = (store, value) => {
  store.setState({ refetchWeeklySchedule: value });
};

export const setSurveySubmitted = (store, value) => {
  store.setState({ surveySubmitted: value });
};
