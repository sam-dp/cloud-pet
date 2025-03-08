import { SessionProvider } from "next-auth/react";  // Import SessionProvider for authentication
import { AppProps } from 'next/app';
//import "../styles/globals.css";  // Global styles (if any)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>  {/* Wrapping the app with SessionProvider */}
      <Component {...pageProps} />  {/* Rendering the current page */}
    </SessionProvider>
  );
}

export default MyApp;