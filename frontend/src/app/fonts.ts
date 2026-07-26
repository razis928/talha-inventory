import {
  DM_Serif_Display,
  Encode_Sans,
  Inter,
  Martel_Sans,
  Montserrat,
  Poppins,
} from 'next/font/google';

export const fontMontserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const fontPoppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800', '900'],
});
export const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const fontMartelSans = Martel_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-martel-sans',
  weight: ['200', '300', '400', '600', '700', '800', '900'],
});

export const fontDMSerif = DM_Serif_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-serif',
  weight: ['400'],
});
export const encodeSans = Encode_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-encode-sans',
});
