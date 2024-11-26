import {useEffect, useState} from "react";
import {AuthProviders, NanoTDFDatasetClient} from "@opentdf/sdk";

function TDFContent() {
  const auth = useAuth();
  const [count, setCount] = useState(0);
  const [tdfClient, setTdfClient] = useState<NanoTDFDatasetClient | null>(null);
  const [encryptedData, setEncryptedData] = useState<ArrayBuffer | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: 'info' | 'error' | 'success' | null;
    message: string | null;
  }>({ type: null, message: null });

  useEffect(() => {
    const initTDF = async () => {
      if (!auth.isAuthenticated || !auth.user) return;
      try {
        setStatus({ type: 'info', message: 'Initializing TDF client...' });
        const refreshToken = auth.user.refresh_token;
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const authProvider = await AuthProviders.refreshAuthProvider({
          clientId: "localhost-arkavo-web",
          exchange: "refresh",
          refreshToken,
          oidcOrigin: "https://keycloak.juliancoy.us/auth/realms/opentdf/",
        });

        const client = new NanoTDFDatasetClient({
          authProvider,
          kasEndpoint: "http://localhost:5173/kas",
        });
        // add attributes using otdfctl then add here for ABAC
        // client.dataAttributes = ["https://juliancoy.us/attr/classification/value/secret"];
        setTdfClient(client);
        setStatus({ type: 'success', message: 'TDF client initialized successfully' });
      } catch (error) {
        console.error("TDF initialization failed:", error);
        setStatus({
          type: 'error',
          message: `Failed to initialize TDF client: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };

    initTDF().catch(console.error);
  }, [auth.isAuthenticated, auth.user]);

  const handleEncrypt = async () => {
    if (!tdfClient) return;
    try {
      setStatus({ type: 'info', message: 'Encrypting data...' });
      const data = `Count value: ${count}`;
      const encrypted = await tdfClient.encrypt(data);
      setEncryptedData(encrypted);
      setDecryptedData(null);
      setStatus({ type: 'success', message: 'Data encrypted successfully' });
    } catch (error) {
      console.error("Encryption failed:", error);
      setStatus({
        type: 'error',
        message: `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleDecrypt = async () => {
    if (!tdfClient || !encryptedData) return;
    try {
      setStatus({ type: 'info', message: 'Decrypting data...' });
      const decrypted = await tdfClient.decrypt(encryptedData);
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);
      setDecryptedData(decryptedText);
      setStatus({ type: 'success', message: 'Data decrypted successfully' });
    } catch (error) {
      console.error("Decryption failed:", error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        // Check for specific network error related to KAS
        if (error.message.includes('NetworkError') && error.message.includes('kas')) {
          errorMessage = 'Failed to connect to Key Access Service (KAS). Please check if the KAS service is running and accessible.';
        } else {
          errorMessage = error.message;
        }
      }
      setStatus({ type: 'error', message: `Decryption failed: ${errorMessage}` });
    }
  };

  const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b, i) => {
        const hex = b.toString(16).padStart(2, "0");
        if ((i + 1) % 20 === 0) return hex + "\n";
        return hex + " ";
      })
      .join("");
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div><div>Oops... {auth.error.message}</div><div><a href="http://localhost:5173/">home</a></div></div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <button onClick={() => auth.signinRedirect()}>Log in</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="user-info">
        <p>Welcome {auth.user?.profile.name}</p>
        <button onClick={() => auth.removeUser()}>Log out</button>
      </div>
      <h1>Secure Vite + React App + OpenTDF + OIDC</h1>
      {status.message && (
        <div className={`mt-4 p-4 rounded ${
          status.type === 'error' ? 'bg-red-100 text-red-700' :
            status.type === 'success' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
        }`}>
          {status.message}
        </div>
      )}
      <div className="card">
        <button onClick={() => setCount((count: number) => count + 1)}>
          count is {count}
        </button>
        <button
          onClick={handleEncrypt}
          disabled={!tdfClient}
          className="ml-4"
        >
          Encrypt Count
        </button>
        <button
          onClick={handleDecrypt}
          disabled={!tdfClient || !encryptedData}
          className="ml-4"
        >
          Decrypt Data
        </button>
        {encryptedData && (
          <div className="mt-4">
            <h3>Encrypted NanoTDF</h3>
            <pre className="bg-gray-100 p-2 rounded font-mono text-sm text-left whitespace-pre-line">
              {arrayBufferToHex(encryptedData)}
            </pre>
          </div>
        )}
        {decryptedData && (
          <div className="mt-4">
            <h3>Decrypted Data</h3>
            <pre className="bg-gray-100 p-2 rounded font-mono text-sm">
              {decryptedData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function TDF() {
  return (
      <TDFContent />
  );
}

export default TDF;
