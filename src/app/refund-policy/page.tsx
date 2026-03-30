import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Refund Policy | MockHero",
  description:
    "Refund Policy for mockhero.dev, provided by Space Cadet d.o.o.",
}

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-svh justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <Image
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
          <h1>Refund Policy</h1>

          <p>Last updated: March 22, 2026.</p>
          <p>
            We understand that there may come a time to return a purchase and
            we aim to make the returns process as simple as possible.
          </p>
          <p>
            If you&apos;re looking to return or exchange your order, we offer
            returns within 14 days of purchase. You can return your product for
            a refund to the original payment method.
          </p>

          {/* -- Conditions -- */}
          <h2>Conditions of Return</h2>
          <p>
            MockHero is a subscription-based software service. Refunds are
            subject to the following conditions:
          </p>
          <p>
            Subscription fees may be refunded within 14 days of purchase if
            fewer than 100 API requests have been made during that billing
            period. If you cancel your subscription, you will retain access to
            your current plan until the end of the billing period. No partial
            refunds are issued for unused time within a billing period. Refund
            requests should be submitted to{" "}
            <a href="mailto:hello@mockhero.dev">hello@mockhero.dev</a> within
            30 days of the original charge.
          </p>

          {/* -- Return Process -- */}
          <h2>Return Process</h2>
          <p>
            To request a refund, email us at{" "}
            <a href="mailto:hello@mockhero.dev">hello@mockhero.dev</a> with
            your account details and the reason for your request. Our support
            team will be happy to assist you with the next steps.
          </p>

          {/* -- Refunds -- */}
          <h2>Refunds</h2>
          <p>
            After receiving your request and reviewing your account, we will
            process your refund. Please allow at least 14 days from the receipt
            of your request for your refund to be processed.
          </p>

          {/* -- Questions -- */}
          <h2>Questions</h2>
          <p>
            For questions relating to our refund policy, please contact us at{" "}
            <a href="mailto:hello@mockhero.dev">hello@mockhero.dev</a>.
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
