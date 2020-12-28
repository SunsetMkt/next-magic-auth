import * as React from 'react';
import { ApolloProvider } from '@apollo/client';

import { useAuth } from 'src/components/AuthProvider';
import { buildApolloClient } from 'src/client/graphql/client';

export default function ApolloProviderWrapper({ children }) {
  const instance = React.useRef({ key: 1 });
  const auth = useAuth();

  // console.debug('[ApolloProvider]', 'auth change', { auth });

  // rebuild apollo client when auth changes
  return React.useMemo(() => {
    const client = buildApolloClient(auth);

    // console.debug('[ApolloProvider]', 'rebuild client', { client });

    // key prop such as `key={Date.now()}` or `key={auth.jwt}`
    // will ensure we hard refresh entire tree with new provider
    // without key prop when logging out we will see previous queries refetch
    // e.g. the me query will replay with no jwt and return an error

    // for now just invalidate entire tree when auth.jwt is falsy (logged out)
    const key = !auth.jwt ? ++instance.current.key : instance.current.key;

    // console.debug('[ApolloProvider]', { key });

    return <ApolloProvider {...{ key, client }}>{children}</ApolloProvider>;
  }, [auth.jwt]);
}
