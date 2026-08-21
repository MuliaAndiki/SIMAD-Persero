"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/atoms/navigation-menu";
import { appConfig, navigationMenuConfig } from "@/configs/app.config";
import { Button } from "@/components/atoms/button";
// import UserDropdown from './user.dropdown';
import NotificationDropdownContainer from "@/core/containers/notification.dropdown.container";
import { cn } from "@/utils/classname";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageDropdown from "./language.dropdown";
import ThemeToggle from "./theme-toggle";

export default function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm p-6 border-b transition-all duration-200",
        isScrolled ? "border-b-border shadow-md" : "border-b-transparent",
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src={appConfig.logo} alt="Logo" width={40} height={40} />
            <span className="font-bold text-lg hidden sm:inline-block">
              {appConfig.name}
            </span>
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationMenuConfig?.items?.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink
                  href={item.href}
                  className={navigationMenuTriggerStyle()}
                >
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* <LanguageDropdown />
          <NotificationDropdownContainer /> */}
          <Link href="/login">
            <Button className="rounded-full px-6">Masuk</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
