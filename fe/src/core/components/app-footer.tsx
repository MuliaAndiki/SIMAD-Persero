import { appConfig } from '@/configs/app.config';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={appConfig.logo}
                alt="SIMAD Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-xl">{appConfig.name}</span>
            </Link>
            <p className="text-muted-foreground text-sm">{appConfig.description}</p>
            <div className="flex items-center gap-4 mt-2">
              {Object.entries(appConfig.social_media).map(([key, value]) => (
                <Link
                  href={value.url}
                  key={key}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon icon={value.icon} width={24} height={24} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Produk</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-primary transition-colors">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link href="#workflow" className="hover:text-primary transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="#roles" className="hover:text-primary transition-colors">
                  Akses Pengguna
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Sumber Daya</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#problem" className="hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-primary transition-colors">
                  Pusat Bantuan (FAQ)
                </Link>
              </li>
              <li>
                <Link href="#benefits" className="hover:text-primary transition-colors">
                  Manfaat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <p>
            © {new Date().getFullYear()} {appConfig.name}. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">Dibuat di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
