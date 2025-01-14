import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context"
import './index.css'
import '@aws-amplify/ui-react/styles.css'
import App from './App.jsx'

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_hSRJy5JE9",
    client_id: "rkpc8k8b3gbe23n1dvdv988fd",
    redirect_uri: "http://localhost:5173/",
    response_type: "code",
    scope: "email openid profile",
}

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>
    </StrictMode>,
)
