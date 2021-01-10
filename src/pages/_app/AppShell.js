import * as React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { IntlProvider } from 'react-intl';

const DynamicModalContainer = dynamic(() => import('@components/Modal/ModalContainer'));

const { APP_NAME } = process.env;

export default function AppShell({ children, Component, pageProps }) {
  const title = Component && Component.title ? `${APP_NAME} - ${Component.title}` : APP_NAME;

  return (
    <IntlProvider locale="en" defaultLocale="en">
      <Head>
        <title key="title">{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          key="viewport"
        />
        <link
          key="favicon"
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪄</text></svg>"
        />
      </Head>

      {children}

      <DynamicModalContainer />
    </IntlProvider>
  );
}
