export const setVisibilityFilter = filter => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

export const toggleSidebar = () => ({
  type: 'TOGGLE_SIDEBAR',
})
export const userLogin = (user) => ({
  type: 'USER_LOGIN',
  user
})

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}