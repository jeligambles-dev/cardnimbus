'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MakeOfferModal } from './make-offer-modal'

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
  const [offerOpen, setOfferOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
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
          onClick={() => {
            // Message seller — conversation creation would be wired here
            window.location.href = `/messages/new?listingId=${listingId}`
          }}
        >
          Message Seller
        </Button>
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
