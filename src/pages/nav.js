import React from 'react';
import Layout from '@theme/Layout';
import Nav from '../components/Nav';

export default function NavPage() {
  return (
    <Layout
      title="资源导航"
      description="技术资源导航页面">
      <main>
        <Nav />
      </main>
    </Layout>
  );
} 