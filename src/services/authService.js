import { apiClient } from './apiClient'

export const authService = {
  /**
   * Login with identifier (Student ID or Email) and password
   */
  async login(credentials) {
    await apiClient.post('/auth/login', credentials)
    return {
      success: true,
      user: {
        id: credentials.identifier,
        role: credentials.role,
        name: credentials.role === 'student' ? 'สมชาย ใจดี' : 'อ.สมพงษ์ สว่างจิตต์'
      },
      token: 'jwt-mock-examhub-token-xyz'
    }
  },

  /**
   * SSO Login with provider (Google / DOPA)
   */
  async ssoLogin(provider) {
    await apiClient.post(`/auth/sso/${provider}`, {})
    return {
      success: true,
      provider,
      redirectUrl: `/auth/callback/${provider}`
    }
  },

  /**
   * Logout
   */
  async logout() {
    await apiClient.post('/auth/logout', {})
    return { success: true }
  }
}
