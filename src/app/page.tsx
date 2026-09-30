import { About } from "@/components/About";
import { Marquee } from "@/components/background/Marquee";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";

/**
 * Single-page portfolio. Every section is a server component; only the theme
 * toggle, the scroll chrome and the background decoration ship JavaScript, so
 * the page stays close to fully static.
 */
export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:brutal-pill focus:bg-accent focus:px-4 focus:py-2 focus:font-extrabold"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        {/* The scrolling skills strip. Its own margin provides the separation
            from the hero above and the about section below. */}
        <Marquee />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
