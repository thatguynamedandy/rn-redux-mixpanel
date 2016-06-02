import trackEvent from './api/trackEvent'
import updateUserProfile from './api/updateUserProfile'

export default function mixpanel({
  token,
  getToken = () => null,
  selectDistinctId = () => null,
  selectUserProfileData = () => null,
  selectEventName = (action) => action.type,
  selectProperties = () => null,
  ignoreAction = (action) => false,
}) {

  return store => next => action => {
    // Don't track falsy actions or actions that should be ignored
    if (!action.type || ignoreAction(action)) {
      return next(action)
    }

    // Get store state; select distinct id for action & state
    const state = store.getState()
    const distinctId = selectDistinctId(action, state)
    const eventName = selectEventName(action, state)
    const properties = selectProperties(action, state)
    const token = getToken(state) || token;

    // Track action event with Mixpanel
    trackEvent({
      token,
      distinctId,
      eventName: eventName,
      eventData: properties
    })

    // Select user profile data for action; if it selects truthy data,
    // update user profile on Mixpanel
    const userProfileData = selectUserProfileData(action, state)
    if (userProfileData) {
      updateUserProfile({
        token,
        distinctId,
        userProfileData,
      })
    }

    return next(action)
  }
}
