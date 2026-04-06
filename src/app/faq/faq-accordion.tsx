'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is Card Nimbus?',
    answer:
      'Card Nimbus is a Pokemon card marketplace and store where you can buy, sell, and trade cards. We offer a curated storefront with graded and raw cards, a peer-to-peer marketplace, mystery packs, raffles, and a sell-to-us program where you can get instant offers on your collection.',
  },
  {
    question: 'How do I buy cards?',
    answer:
      'Browse our shop or marketplace, add items to your cart, and check out using Stripe or PayPal. All cards listed in our store are verified and ship directly from Card Nimbus. Marketplace listings ship from individual sellers but are backed by our buyer protection policy.',
  },
  {
    question: 'How does the marketplace work?',
    answer:
      'The marketplace is a peer-to-peer platform where verified sellers list their own cards. Buyers purchase directly through Card Nimbus, and payments are held in escrow until the buyer confirms delivery. This protects both parties and ensures a safe transaction.',
  },
  {
    question: 'How do I sell cards to Card Nimbus?',
    answer:
      'Use our "Sell Your Cards" feature to submit photos of your cards. Our team will review them and send you an offer within 24-48 hours. If you accept, ship the cards to us with the prepaid label we provide. Once we verify the cards, payment is issued to your account.',
  },
  {
    question: 'How do I sell on the marketplace?',
    answer:
      'Create a seller account, then list your items with photos, descriptions, and pricing. When a buyer purchases your listing, you ship the card within the specified handling time. Card Nimbus charges a 10% commission on completed sales, which covers payment processing and platform fees.',
  },
  {
    question: 'What are the shipping and return policies?',
    answer:
      'Store orders ship within 1-3 business days. Marketplace sellers set their own handling times. Returns are accepted within 14 days of delivery for store purchases if the item is not as described. Marketplace disputes are handled through our resolution center. Shipping costs for returns depend on the reason for the return.',
  },
  {
    question: 'How do raffles work?',
    answer:
      'Raffles let you enter for a chance to win high-value cards at a fraction of the price. Each raffle has a set number of spots and a draw date. Purchase one or more entries, and when all spots are filled (or the draw date arrives), a winner is randomly selected. If you do not win, no further charges apply — you only pay for your entries.',
  },
  {
    question: 'How do mystery packs work?',
    answer:
      'Mystery packs contain a curated selection of cards at various rarities. Each pack tier has a guaranteed minimum value and a chance at hitting rare pulls worth significantly more. Pack contents are randomized and sealed — what you pull is what you get. All mystery packs are non-refundable.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards through Stripe (Visa, Mastercard, Amex, Discover) as well as PayPal. All transactions are processed securely, and your payment information is never stored on our servers.',
  },
  {
    question: 'How does slab grading work?',
    answer:
      'Graded cards (slabs) are professionally evaluated and encapsulated by third-party grading companies. We support cards graded by PSA, BGS (Beckett), CGC, ACE, and TAG. Each grading company uses its own scale, and grades are displayed on every listing so you know exactly what you are buying.',
  },
  {
    question: 'How do I keep my account secure?',
    answer:
      'Use a strong, unique password and enable two-factor authentication (2FA) in your account settings. Never share your login credentials. If you suspect unauthorized access, change your password immediately and contact our support team.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach us via email at support@cardnimbus.com, through the live chat widget on any page, or by visiting our Contact Us page. Our support team is available Monday through Friday, 9 AM to 6 PM EST, and we aim to respond within 24 hours.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="rounded-2xl border border-surface-border bg-surface-raised overflow-hidden transition-colors"
        >
          <button
            type="button"
            onClick={() => toggle(index)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
            <svg
              className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-5 pb-4">
              <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
