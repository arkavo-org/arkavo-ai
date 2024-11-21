// src/utils/keycloakUtils.ts
import { KeycloakInstance } from 'keycloak-js';

export interface UserProfile {
  name: string;
  picture: string;
}

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

export const logoutAndClearProfile = (keycloak: KeycloakInstance): void => {
  keycloak.logout();
  localStorage.removeItem('userProfile');
};
