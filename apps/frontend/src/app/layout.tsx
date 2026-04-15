import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AutoDeployHub – Cloud-Native CI/CD Platform',
  description: 'Automate build, test, and deployment pipelines with AutoDeployHub. Connect repositories, run CI/CD pipelines, and deploy to Kubernetes with minimal configuration.',
  keywords: ['CI/CD', 'DevOps', 'Kubernetes', 'Docker', 'Pipeline', 'Deployment'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
