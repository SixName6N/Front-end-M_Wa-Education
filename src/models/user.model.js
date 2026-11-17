/**
 * Data model for Login credentials
 */
export class LoginCredentials {
  constructor({ identifier = '', password = '', role = 'student', rememberMe = false } = {}) {
    this.identifier = identifier
    this.password = password
    this.role = role
    this.rememberMe = rememberMe
  }
}

/**
 * Data model for User entity
 */
export class User {
  constructor({ id, name, email, role, avatar = null, token = null } = {}) {
    this.id = id
    this.name = name
    this.email = email
    this.role = role
    this.avatar = avatar
    this.token = token
  }
}
