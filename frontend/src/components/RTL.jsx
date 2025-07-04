import React from 'react';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const RTL = (props) => {
  return <CacheProvider value={cacheRtl}>{props.children}</CacheProvider>;
};

// Export the component as default
export default RTL;
