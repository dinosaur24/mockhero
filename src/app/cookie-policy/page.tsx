import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cookie Policy — MockHero",
  description:
    "Cookie Policy for mockhero.dev, provided by Space Cadet d.o.o.",
}

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-svh justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img
            src="/logo.png"
            alt="MockHero logo"
            width={28}
            height={28}
            className="rounded"
          />
          <Link
            href="/"
            className="text-[17px] font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            MockHero
          </Link>
        </div>

        <article className="prose prose-sm prose-neutral max-w-none [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground">
          <h1>Cookie Policy</h1>

          <p>Effective Date: March 22, 2026.</p>
          <p>
            We use cookies to help improve your experience of our website at{" "}
            <a href="https://mockhero.dev">https://mockhero.dev</a> and its
            subdomains. This cookie policy is part of Space Cadet
            d.o.o.&apos;s{" "}
            <Link href="/privacy-policy">privacy policy</Link>. It covers the
            use of cookies between your device and our site.
          </p>
          <p>
            We also provide basic information on third-party services we may
            use, who may also use cookies as part of their service. This policy
            does not cover their cookies.
          </p>
          <p>
            If you don&apos;t wish to accept cookies from us, you should
            instruct your browser to refuse cookies from{" "}
            <a href="https://mockhero.dev">https://mockhero.dev</a>. In such a
            case, we may be unable to provide you with some of your desired
            content and services.
          </p>

          {/* -- What is a Cookie -- */}
          <h2>What is a Cookie?</h2>
          <p>
            A cookie is a small piece of data that a website stores on your
            device when you visit. It typically contains information about the
            website itself, a unique identifier that allows the site to
            recognise your web browser when you return, additional data that
            serves the cookie&apos;s purpose, and the lifespan of the cookie
            itself.
          </p>
          <p>
            Cookies are used to enable certain features (e.g. logging in),
            track site usage (e.g. analytics), store your user settings (e.g.
            time zone, notification preferences), and to personalize your
            content (e.g. advertising, language).
          </p>
          <p>
            Cookies set by the website you are visiting are usually referred to
            as first-party cookies. They typically only track your activity on
            that particular site.
          </p>
          <p>
            Cookies set by other sites and companies (i.e. third parties) are
            called third-party cookies. They can be used to track you on other
            websites that use the same third-party service.
          </p>

          {/* -- Control -- */}
          <h2>How Can You Control Our Website&apos;s Use of Cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies on
            our Website. You can manage your cookie preferences in our Cookie
            Consent Manager powered by CookieBot. The Cookie Consent Manager
            allows you to select which categories of cookies you accept or
            reject. Essential cookies cannot be rejected as they are strictly
            necessary to provide you with the services on our Website.
          </p>
          <p>
            You may also be able to set or amend your cookie preferences by
            managing your web browser settings. As each web browser is
            different, please consult the instructions provided by your web
            browser (typically in the &ldquo;help&rdquo; section). If you
            choose to refuse or disable cookies you may still use the Website,
            though some of the functionality of the Website may not be available
            to you.
          </p>

          {/* -- Updates -- */}
          <h2>How Often Will We Update This Cookie Policy?</h2>
          <p>
            We may update this Cookie Policy from time to time in order to
            reflect any changes to the cookies and related technologies we use,
            or for other operational, legal or regulatory reasons.
          </p>
          <p>
            Each time you use our Website, the current version of the Cookie
            Policy will apply. When you use our Website, you should check the
            date of this Cookie Policy (which appears at the top of this
            document) and review any changes since the last version.
          </p>

          {/* -- Contact -- */}
          <h2>Where Can You Obtain Further Information?</h2>
          <p>
            For any questions or concerns regarding our Cookie Policy, you may
            contact us using the following details:
          </p>
          <p>
            Dino Sakoman
            <br />
            <a href="mailto:hello@mockhero.dev">hello@mockhero.dev</a>
          </p>
        </article>

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Space Cadet d.o.o. &mdash; All
          rights reserved.
        </p>
      </div>
    </div>
  )
}
