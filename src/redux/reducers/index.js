import { combineReducers } from 'redux'
import sidebarItems from './sidebarItems'
import toggleSidebar from './toggleSidebar'
import user from './user'

export default combineReducers({
  sidebarItems,
  toggleSidebar,
  user
})