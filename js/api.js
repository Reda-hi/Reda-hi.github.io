/**
 * API Communication Layer
 * Handles backend API calls with fallback to local database
 */

class APIClient {
    constructor(apiUrl = 'http://localhost:5000/api') {
        this.apiUrl = apiUrl;
        this.timeout = 5000;
    }

    /**
     * Search for videos based on materials
     */
    async searchMaterials(materials) {
        try {
            const response = await this.fetchWithTimeout(
                `${this.apiUrl}/search`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ materials })
                }
            );

            const data = await response.json();

            return {
                success: true,
                source: 'api',
                data: data.results || {},
                status: data.api_status,
                message: data.message
            };
        } catch (error) {
            console.error('[API] Search failed:', error);
            return {
                success: false,
                source: 'error',
                error: error.message
            };
        }
    }

    /**
     * Check API health
     */
    async checkHealth() {
        try {
            const response = await this.fetchWithTimeout(
                `${this.apiUrl}/health`,
                { method: 'GET' }
            );
            return await response.json();
        } catch (error) {
            console.error('[API] Health check failed:', error);
            return { status: 'offline', api_working: false };
        }
    }

    /**
     * Fetch with timeout
     */
    fetchWithTimeout(url, options = {}) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('API timeout')), this.timeout)
            )
        ]);
    }
}

// Export
const apiClient = new APIClient();
