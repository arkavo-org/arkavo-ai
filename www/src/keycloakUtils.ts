import { KeycloakInstance } from 'keycloak-js';

export interface UserProfile {
  name: string;
  picture: string;
}

// Fetch the stored user profile from localStorage
export const fetchStoredUserProfile = (): UserProfile | null => {
  const storedProfile = localStorage.getItem('userProfile');
  return storedProfile ? JSON.parse(storedProfile) : null;
};

// Fetch the user profile from Keycloak and update state/localStorage
export const fetchAndSetUserProfile = async (
  keycloak: KeycloakInstance,
  setUserProfile: (profile: UserProfile | null) => void
): Promise<void> => {
  try {
    const userProfile = await loginAndFetchProfile(keycloak);
    if (userProfile) {
      setUserProfile(userProfile);
    } else {
      setUserProfile(null);
    }
  } catch (error) {
    console.error('Failed to fetch and set user profile:', error);
    setUserProfile(null);
  }
};

// Login and fetch the user profile
export const loginAndFetchProfile = async (
  keycloak: KeycloakInstance,
  redirectUri: string = window.location.origin
): Promise<UserProfile | null> => {
  if (!keycloak.authenticated) {
    await keycloak.login({
      scope: 'openid profile email',
      redirectUri,
    });
  }

  if (keycloak.authenticated) {
    try {
      // Fetch userinfo from Keycloak
      const response = await fetch(
        `${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );

      const userInfo = await response.json();
      const userProfile: UserProfile = {
        name: userInfo.name || userInfo.preferred_username || 'User',
        picture: userInfo.picture || '/default-profile.png', // Default if picture is missing
      };

      // Save to localStorage for reuse
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      return userProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  return null;
};

// Clear user profile from localStorage and logout
export const logoutAndClearProfile = (keycloak: KeycloakInstance): void => {
  keycloak.logout();
  localStorage.removeItem('userProfile');
};

export const clearUserProfile = (keycloak: KeycloakInstance): void => {
    keycloak.logout();
    localStorage.removeItem('userProfile');
  };
  export async function fetchKeycloakUsers(keycloak: any): Promise<string[]> {
    try {
        await keycloak.updateToken(30);
        const token = keycloak.token;

        const response = await fetch(
            `https://keycloak.juliancoy.us/auth/admin/realms/opentdf/users`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("USERS");
        console.log(response);

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const users = await response.json();
        return users.map((user: any) => user.username || user.email);
    } catch (error) {
        console.error('Error fetching users from Keycloak:', error);
        return [];
    }
}
