import * as React from 'react';
import gql from 'graphql-tag';
import { useLazyQuery, useQuery } from '@apollo/client';

import useAdhocSubscription from 'src/hooks/useAdhocSubscription';

import headers from 'src/shared/headers';
import roles from 'src/shared/roles';

const gqls = {
  watchLoginToken: gql`
    subscription WatchLoginToken {
      loginToken {
        approved
        id
      }
    }
  `,

  me: gql`
    query Me {
      me: user {
        id
        email
        created
        updated
      }
    }
  `,

  watchLoginRequests: gql`
    subscription LoginRequests {
      loginToken(order_by: { created: desc }) {
        id
        created
        expires
        approved
        ip
        userAgent
      }
    }
  `,

  watchRefreshTokens: gql`
    subscription RefreshTokens {
      refreshToken(order_by: { lastActive: desc }) {
        id: loginTokenId
        created
        expires
        ip
        lastActive
        userAgent
      }
    }
  `,
};

export default {
  query,

  watchLoginToken: (jwtToken) => {
    const result = useAdhocSubscription(gqls.watchLoginToken, {
      role: roles.login,
      jwt: jwtToken.encoded,
    });

    let approved = false;

    if (!result.error && result.data && result.data.loginToken) {
      // extract approved
      const [loginToken] = result.data.loginToken;
      if (loginToken) {
        approved = loginToken.approved;
      }
    }

    return approved;
  },

  me: () => {
    const [get, result] = useLazyQuery(gqls.me, {
      fetchPolicy: 'cache-and-network',
      context: {
        headers: {
          [headers.role]: roles.self,
        },
      },
    });

    let self;

    if (!result.error && result.data) {
      const [me] = result.data.me;
      self = me;
    }

    return [get, self];
  },

  watchLoginRequests: () => {
    const result = useAdhocSubscription(gqls.watchLoginRequests, {
      role: roles.self,
    });

    let loginRequests = [];

    if (!result.error && result.data && Array.isArray(result.data.loginToken)) {
      // extract approved
      loginRequests = result.data.loginToken;
    }

    return loginRequests;
  },

  watchRefreshTokens: () => {
    const result = useAdhocSubscription(gqls.watchRefreshTokens, {
      role: roles.self,
    });

    let refreshTokens = [];

    if (
      !result.error &&
      result.data &&
      Array.isArray(result.data.refreshToken)
    ) {
      // extract approved
      refreshTokens = result.data.refreshToken;
    }

    return refreshTokens;
  },
};

async function query(
  client,
  query,
  { headers, variables, role = roles.user } = {},
) {
  const queryResult = await client.query({
    query,
    variables,
    context: {
      headers: {
        [headers.role]: role,
        ...headers,
      },
    },
  });

  return queryResult;
}
