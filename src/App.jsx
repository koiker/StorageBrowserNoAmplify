import {useAuth} from "react-oidc-context"
import {createStorageBrowser, createManagedAuthAdapter,} from '@aws-amplify/ui-react-storage/browser';
import {GetIdCommand, CognitoIdentityClient, GetCredentialsForIdentityCommand} from '@aws-sdk/client-cognito-identity';
import {Button, Flex, Heading, View} from "@aws-amplify/ui-react";
import './App.css'
import '@aws-amplify/ui-react/styles.css'


function App() {
    const auth = useAuth()

    async function fetchCredentials() {
        const client = new CognitoIdentityClient({region: 'us-east-2'});
        const getIdCommand = new GetIdCommand({
            IdentityPoolId: 'us-east-2:9b4723a1-e191-42c8-bc55-073fac878b68', // Your Cognito Identity Pool ID
            Logins: {
                'cognito-idp.us-east-2.amazonaws.com/us-east-2_hSRJy5JE9': auth.user.id_token
            }
        });
        try {
            // Get the Identity ID
            const {IdentityId} = await client.send(getIdCommand);
            const getCredentialsCommand = new GetCredentialsForIdentityCommand({
                IdentityId: IdentityId,
                Logins: {
                    'cognito-idp.us-east-2.amazonaws.com/us-east-2_hSRJy5JE9': auth.user.id_token
                }
            })
            const credentials = await client.send(getCredentialsCommand)
            return credentials.Credentials
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    const {StorageBrowser} = createStorageBrowser({
        config: createManagedAuthAdapter({
            credentialsProvider: async () => {
                const credentials = await fetchCredentials()
                return  {
                    credentials: {
                        accessKeyId: credentials.AccessKeyId,
                        secretAccessKey: credentials.SecretKey,
                        sessionToken: credentials.SessionToken,
                        expiration: credentials.Expiration,
                    },
                }
            },
            // AWS `region` and `accountId` of the S3 Access Grants Instance.
            region: 'us-east-2',
            accountId: '109881088269',
            // call `onAuthStateChange` when end user auth state changes
            // to clear sensitive data from the `StorageBrowser` state
            registerAuthListener: (onAuthStateChange) => {
            },

        })
    })

    const signOutRedirect = () => {
        const clientId = "rkpc8k8b3gbe23n1dvdv988fd"
        const logoutUri = "http://localhost:5173/"
        const cognitoDomain = "https://koiker.auth.us-east-2.amazoncognito.com"
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
    }

    const handleLogout = () => {
        auth.removeUser(); // Clear local storage
        signoutRedirect(); // Redirect to the identity provider's logout endpoint
    };

    if (auth.isLoading) {
        return <div>Loading...</div>
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>
    }

    if (auth.isAuthenticated) {

        return (
            <>
                <Flex direction="column"
                      justifyContent="flex-start"
                      alignItems="stretch"
                      alignContent="flex-start"
                      wrap="nowrap"
                      gap="1rem">
                    <View as="div" width="100%">
                        <Heading level={1}>Hello {auth.user.profile.identities[0].userId}</Heading>
                        <Button onClick={handleLogout}>Sign out</Button>
                    </View>
                    <View as="div" width="100%">
                        <StorageBrowser/>
                    </View>
                </Flex>
            </>
        )
    }
    return (
        <div>
            <button onClick={() => auth.signinRedirect()}>Sign in</button>
            <button onClick={() => signOutRedirect()}>Sign out</button>
        </div>
    );
}

export default App
