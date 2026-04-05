'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MakeOfferModal } from './make-offer-modal'
import { BuyNowButton } from './buy-now-button'
import { SaveListingButton } from './save-listing-button'

interface ListingDetailActionsProps {
  listingId: string
  listingTitle: string
  listingPrice: number
  sellerId: string
  sellerUserId: string
}

export function ListingDetailActions({
  listingId,
  listingTitle,
  listingPrice,
}: ListingDetailActionsProps) {
  const router = useRouter()
  const [offerOpen, setOfferOpen] = useState(false)
  const [messaging, setMessaging] = useState(false)

  const handleMessageSeller = async () => {
    if (messaging) return
    setMessaging(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/marketplace/${listingId}`)}`)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'Failed to start conversation')
        setMessaging(false)
        return
      }
      router.push(`/account/messages/${data.id}`)
    } catch {
      setMessaging(false)
    }
  }

  return (
    <>
      <div className="mt-6 space-y-3">
        <BuyNowButton listingId={listingId} size="md" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => setOfferOpen(true)}
          >
            Make an Offer
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={handleMessageSeller}
            disabled={messaging}
          >
            {messaging ? 'Starting chat...' : 'Message Seller'}
          </Button>
        </div>
        <SaveListingButton listingId={listingId} />
      </div>

      <MakeOfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        listingPrice={listingPrice}
      />
    </>
  )
}
