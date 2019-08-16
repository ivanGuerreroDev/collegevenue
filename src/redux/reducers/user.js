const user = (state = '', action) => {
  switch (action.type) {
    case 'USER_LOGIN':
      return state = action.user
    case 'USER_LOGOUT':
      return state = ''
    default:
      return state
  }
}

export default user