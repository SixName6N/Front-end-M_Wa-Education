/**
 * HTTP Client Wrapper (supports simulated latency or real backend integration)
 */
export const apiClient = {
  async post(_endpoint, data) {
    // In demo / client-side mock mode, simulate latency
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { data, status: 200 }
  },

  async get(_endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return { status: 200 }
  }
}
