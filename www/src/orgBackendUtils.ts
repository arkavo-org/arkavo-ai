export async function fetchKeycloakUsers(token: string): Promise<string[]> {
    try {
        const backendUrl = import.meta.env.VITE_ORG_BACKEND_URL;

        if (!backendUrl) {
            throw new Error('VITE_ORG_BACKEND_URL is not set in the environment variables.');
        }

        if (!token) {
            throw new Error('Access token is missing.');
        }

        const response = await fetch(`${backendUrl}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Send the token as Bearer token
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch users: ${response.statusText} - ${errorText}`);
            throw new Error(`Failed to fetch users: ${response.statusText} - ${errorText}`);
        }

        const users = await response.json();
        return users.map((user: any) => user.username || user.email);
    } catch (error) {
        console.error('Error fetching users from Go backend service:', error);
        return [];
    }
}
