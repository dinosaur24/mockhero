import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TIER_LIMITS, type Tier } from "@/lib/utils/constants";
import Link from "next/link";

interface TierInfoProps {
  tier: Tier;
  isEarlyAdopter: boolean;
}

const tierBadgeVariant: Record<Tier, "default" | "secondary" | "outline"> = {
  free: "secondary",
  pro: "default",
  scale: "outline",
};

export function TierInfo({ tier, isEarlyAdopter }: TierInfoProps) {
  const limits = TIER_LIMITS[tier];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
      </CardHeader>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant={tierBadgeVariant[tier]}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>
        {isEarlyAdopter && (
          <Badge variant="secondary">Early Adopter — 10x Free</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Daily records</span>
          <span className="font-medium text-foreground">
            {isEarlyAdopter && tier === "free"
              ? "10,000"
              : limits.dailyRecords.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Per request</span>
          <span className="font-medium text-foreground">
            {limits.perRequest.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Rate limit</span>
          <span className="font-medium text-foreground">
            {limits.perMinute} req/min
          </span>
        </div>
      </div>

      {tier === "free" && (
        <div className="mt-4">
          <Link href="/dashboard/settings">
            <Button variant="default" size="sm" className="w-full">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
