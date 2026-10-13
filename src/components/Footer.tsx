import { PartyPopper } from 'lucide-react';
import mallImage from '@/images/bintang2026.jpg';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#3d081d] text-[#f5dce5] py-12">
      <img
        src={mallImage}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-[#3d081d]/85" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#fff8fa] to-[#edc5d2] shadow-lg shadow-[#edc5d2]/20 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-[#5a0d2a]" />
            </div>
            <div>
              <p className="text-white font-semibold">Bintang Megamall</p>
              <p className="text-xs">The Paragon of Shopping & Entertainment · Miri, Sarawak</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://bintangmegamall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f5b2c8] transition-colors"
            >
              Official Website
            </a>
            <a
              href="https://bintangmegamall.com/directory"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f5b2c8] transition-colors"
            >
              Directory
            </a>
            <a
              href="https://bintangmegamall.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f5b2c8] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#6f2948] text-center text-xs">
          <p>
            30th Anniversary Celebration · Bintang Megamall Miri
          </p>
        </div>
      </div>
    </footer>
  );
}
