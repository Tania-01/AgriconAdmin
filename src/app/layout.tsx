import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Мій проект',
    description: 'Проект для керування об’єктами та роботами',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="uk">
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}
