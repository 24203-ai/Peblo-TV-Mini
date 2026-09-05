import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Home } from './src/pages/Home';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';

const catalogue = JSON.parse(fs.readFileSync('../../assets/catalogue.json', 'utf-8'));

// Mock useQuery to return catalogue directly
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({ data: catalogue, isLoading: false, error: null })
}));

const queryClient = new QueryClient();

try {
  const html = renderToString(
    <StaticRouter location="/">
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </StaticRouter>
  );
  console.log("RENDER SUCCESS!");
  // console.log(html.substring(0, 500));
} catch (e) {
  console.error("RENDER ERROR:", e);
}
