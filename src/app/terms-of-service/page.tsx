import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — MockHero",
  description:
    "Terms of Service for mockhero.dev, provided by Space Cadet d.o.o.",
}

export default function TermsOfServicePage() {
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
          <h1>Terms of Service</h1>

          <p>
            These Terms of Service govern your use of the website located at{" "}
            <a href="https://mockhero.dev">https://mockhero.dev</a> and any
            related services provided by Space Cadet d.o.o.
          </p>
          <p>
            By accessing{" "}
            <a href="https://mockhero.dev">https://mockhero.dev</a>, you agree
            to abide by these Terms of Service and to comply with all applicable
            laws and regulations. If you do not agree with these Terms of
            Service, you are prohibited from using or accessing this website or
            using any other services provided by Space Cadet d.o.o.
          </p>
          <p>
            We, Space Cadet d.o.o., reserve the right to review and amend any of
            these Terms of Service at our sole discretion. Upon doing so, we will
            update this page. Any changes to these Terms of Service will take
            effect immediately from the date of publication.
          </p>
          <p>These Terms of Service were last updated on March 22, 2026.</p>

          {/* -- Limitations of Use -- */}
          <h2>Limitations of Use</h2>
          <p>
            By using this website, you warrant on behalf of yourself, your
            users, and other parties you represent that you will not:
          </p>
          <ul>
            <li>
              modify, copy, prepare derivative works of, decompile, or reverse
              engineer any materials and software contained on this website;
            </li>
            <li>
              remove any copyright or other proprietary notations from any
              materials and software on this website;
            </li>
            <li>
              transfer the materials to another person or &ldquo;mirror&rdquo;
              the materials on any other server;
            </li>
            <li>
              knowingly or negligently use this website or any of its associated
              services in a way that abuses or disrupts our networks or any
              other service Space Cadet d.o.o. provides;
            </li>
            <li>
              use this website or its associated services to transmit or publish
              any harassing, indecent, obscene, fraudulent, or unlawful
              material;
            </li>
            <li>
              use this website or its associated services in violation of any
              applicable laws or regulations;
            </li>
            <li>
              use this website in conjunction with sending unauthorized
              advertising or spam;
            </li>
            <li>
              harvest, collect, or gather user data without the user&apos;s
              consent; or
            </li>
            <li>
              use this website or its associated services in such a way that may
              infringe the privacy, intellectual property rights, or other
              rights of third parties.
            </li>
          </ul>

          {/* -- Intellectual Property -- */}
          <h2>Intellectual Property</h2>
          <p>
            The intellectual property in the materials contained in this website
            are owned by or licensed to Space Cadet d.o.o. and are protected by
            applicable copyright and trademark law. We grant our users
            permission to download one copy of the materials for personal,
            non-commercial transitory use.
          </p>
          <p>
            This constitutes the grant of a license, not a transfer of title.
            This license shall automatically terminate if you violate any of
            these restrictions or the Terms of Service, and may be terminated by
            Space Cadet d.o.o. at any time.
          </p>

          {/* -- User-Generated Content -- */}
          <h2>User-Generated Content</h2>
          <p>
            You retain your intellectual property ownership rights over content
            you submit to us for publication on our website. We will never claim
            ownership of your content, but we do require a license from you in
            order to use it.
          </p>
          <p>
            When you use our website or its associated services to post, upload,
            share, or otherwise transmit content covered by intellectual
            property rights, you grant to us a non-exclusive, royalty-free,
            transferable, sub-licensable, worldwide license to use, distribute,
            modify, run, copy, publicly display, translate, or otherwise create
            derivative works of your content in a manner that is consistent with
            your privacy preferences and our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
          <p>
            The license you grant us can be terminated at any time by deleting
            your content or account. However, to the extent that we (or our
            partners) have used your content in connection with commercial or
            sponsored content, the license will continue until the relevant
            commercial or post has been discontinued by us.
          </p>
          <p>
            You give us permission to use your username and other identifying
            information associated with your account in a manner that is
            consistent with your privacy preferences and our Privacy Policy.
          </p>

          {/* -- Liability -- */}
          <h2>Liability</h2>
          <p>
            Our website and the materials on our website are provided on an
            &lsquo;as is&rsquo; basis. To the extent permitted by law, Space
            Cadet d.o.o. makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property, or other violation of rights.
          </p>
          <p>
            In no event shall Space Cadet d.o.o. or its suppliers be liable for
            any consequential loss suffered or incurred by you or any third
            party arising from the use or inability to use this website or the
            materials on this website, even if Space Cadet d.o.o. or an
            authorized representative has been notified, orally or in writing,
            of the possibility of such damage.
          </p>
          <p>
            In the context of this agreement, &ldquo;consequential loss&rdquo;
            includes any consequential loss, indirect loss, real or anticipated
            loss of profit, loss of benefit, loss of revenue, loss of business,
            loss of goodwill, loss of opportunity, loss of savings, loss of
            reputation, loss of use and/or loss or corruption of data, whether
            under statute, contract, equity, tort (including negligence),
            indemnity or otherwise.
          </p>
          <p>
            Because some jurisdictions do not allow limitations on implied
            warranties, or limitations of liability for consequential or
            incidental damages, these limitations may not apply to you.
          </p>

          {/* -- Accuracy -- */}
          <h2>Accuracy of Materials</h2>
          <p>
            The materials appearing on our website are not comprehensive and are
            for general information purposes only. Space Cadet d.o.o. does not
            warrant or make any representations concerning the accuracy, likely
            results, or reliability of the use of the materials on this website,
            or otherwise relating to such materials or on any resources linked to
            this website.
          </p>

          {/* -- Links -- */}
          <h2>Links</h2>
          <p>
            Space Cadet d.o.o. has not reviewed all of the sites linked to its
            website and is not responsible for the contents of any such linked
            site. The inclusion of any link does not imply endorsement, approval
            or control by Space Cadet d.o.o. of the site. Use of any such
            linked site is at your own risk and we strongly advise you make your
            own investigations with respect to the suitability of those sites.
          </p>

          {/* -- Additional Terms for MockHero Services -- */}
          <h2>Additional Terms for MockHero Services</h2>

          <p>
            <strong>Account Registration.</strong> To access certain features of
            the Service, you must create an account. You agree to: (a) provide
            accurate, current, and complete information during registration; (b)
            maintain the security of your account credentials and not share them
            with any third party; (c) promptly update your account information
            if it changes; and (d) accept responsibility for all activities that
            occur under your account. You must notify us immediately at{" "}
            <a href="mailto:hello@mockhero.dev">hello@mockhero.dev</a> if you
            become aware of any unauthorized use of your account. We reserve the
            right to suspend or terminate accounts that contain inaccurate
            information or that we reasonably believe have been compromised.
          </p>

          <p>
            <strong>API Keys and Access.</strong> MockHero provides API keys to
            authenticate requests to our data generation service. You are
            responsible for safeguarding your API keys and must not share them
            publicly, embed them in client-side code, or expose them in version
            control repositories. We reserve the right to revoke API keys that
            are found to be compromised or used in violation of these Terms. You
            are responsible for all API usage associated with your keys.
          </p>

          <p>
            <strong>Generated Data.</strong> All data generated by MockHero is
            entirely synthetic and fictional. It is not derived from real
            individuals and should not be used as a substitute for real data in
            production systems. You acknowledge that generated data is provided
            for testing, development, and demonstration purposes only. We make
            no warranties regarding the suitability of generated data for any
            specific use case.
          </p>

          <p>
            <strong>Subscription and Payment.</strong> MockHero offers
            subscription plans with different pricing tiers. By subscribing to a
            paid plan, you agree that: (a) subscription fees are billed on a
            recurring monthly basis through our payment provider and are
            non-refundable except as described in our{" "}
            <Link href="/refund-policy">Refund Policy</Link>; (b) you authorize
            us to charge your chosen payment method for all applicable fees; (c)
            if a payment fails, we may suspend your access to paid features
            until the outstanding balance is resolved; (d) we may change our
            pricing upon 30 days&apos; written notice, and your continued use of
            the Service after the price change takes effect constitutes
            acceptance of the new pricing; and (e) you may upgrade, downgrade,
            or cancel your subscription at any time, with changes taking effect
            at the end of your current billing period.
          </p>

          <p>
            <strong>Rate Limits and Fair Use.</strong> Each subscription tier
            includes specific rate limits and usage quotas. You agree not to
            circumvent these limits through any means, including but not limited
            to creating multiple accounts, rotating API keys, or using automated
            tools designed to bypass rate limiting. We reserve the right to
            throttle or suspend access for accounts that exhibit abusive usage
            patterns.
          </p>

          <p>
            <strong>Service Modifications and Availability.</strong> We reserve
            the right to modify, update, or discontinue any part of the Service
            at any time, with or without notice, including changes to features,
            API endpoints, field types, and output formats. We do not guarantee
            uninterrupted or error-free availability and shall not be liable for
            downtime or service interruptions caused by maintenance, updates, or
            factors beyond our reasonable control.
          </p>

          <p>
            <strong>Communications.</strong> By creating an account, you consent
            to receive service-related communications via email, including
            account notifications, usage alerts, billing confirmations, and API
            status updates. These are necessary for the operation of the
            Service. You may manage your notification preferences in your
            account settings. Marketing communications such as newsletters
            require separate opt-in and you may unsubscribe at any time.
          </p>

          <p>
            <strong>Prohibited Uses.</strong> You may not use the MockHero API
            to: (a) generate data for the purpose of deceiving or defrauding
            others; (b) create synthetic identities for illegal purposes; (c)
            simulate real individuals without their consent; (d) overwhelm or
            attack third-party systems with generated data; or (e) resell or
            redistribute generated data as a competing data generation service.
          </p>

          <p>
            <strong>Related Policies.</strong> The following policies form part
            of these Terms of Service and are incorporated by reference: our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
            <Link href="/refund-policy">Refund Policy</Link>, all available at{" "}
            <a href="https://mockhero.dev">https://mockhero.dev</a>.
          </p>

          {/* -- Right to Terminate -- */}
          <h2>Right to Terminate</h2>
          <p>
            We may suspend or terminate your right to use our website and
            terminate these Terms of Service immediately upon written notice to
            you for any breach of these Terms of Service.
          </p>

          {/* -- Severance -- */}
          <h2>Severance</h2>
          <p>
            Any term of these Terms of Service which is wholly or partially void
            or unenforceable is severed to the extent that it is void or
            unenforceable. The validity of the remainder of these Terms of
            Service is not affected.
          </p>

          {/* -- Governing Law -- */}
          <h2>Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance
            with the laws of Croatia. You irrevocably submit to the exclusive
            jurisdiction of the courts in that State or location.
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
